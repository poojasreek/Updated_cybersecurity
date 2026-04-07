from fastapi import FastAPI, HTTPException, Depends, status, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import datetime
import os
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import pyotp
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Create tables
# Note: On a real PostgreSQL + PostGIS, you may need to run "CREATE EXTENSION IF NOT EXISTS postgis;" first.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database creation error (PostGIS might not be enabled): {e}")

app = FastAPI(title="SAFE-CITY AI Backend (PostGIS Ready)", version="1.3.0")

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with open("server_crash.log", "a") as f:
        traceback.print_exc(file=f)
    print("FATAL ERROR CAUGHT:", exc)
    return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {exc}"}, headers={"Access-Control-Allow-Origin": "*"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Shared Secret for Hashing (should be env in prod)
SECRET_SALT = "CRYPTO_SECURE_CITY_2024"
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Auth Logic
citizen_otp_store = {}
POLICE_MFA_SECRET = os.getenv("MFA_SECRET", "JBSWY3DPEHPK3PXP")

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: str
    role: str
    officer_name: Optional[str] = None
    branch_name: Optional[str] = None

class VerifyRequest(BaseModel):
    email: Optional[str] = None
    code: str
    role: str
    officer_name: Optional[str] = None
    branch_name: Optional[str] = None

class FIRCreate(BaseModel):
    crimeType: str
    location: str
    description: str
    severity: str
    officer: str
    branch: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class SOSTrigger(BaseModel):
    lat: float
    lng: float
    type: Optional[str] = "button"
    mediaUrl: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "SAFE-CITY PostGIS Secure Portal API", "db": os.getenv("DATABASE_URL", "SQLite Fallback")}

@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    if req.role == 'police': 
        # Find or create user
        user = db.query(models.User).filter(models.User.name == req.officer_name, models.User.role == 'police').first()
        if not user:
            user = models.User(name=req.officer_name, role="police", hashed_password="mock_password")
            db.add(user)
            db.commit()
            db.refresh(user)

        setup_mfa = False
        secret = None
        otpauth_url = None

        if not user.is_2fa_enabled or not user.two_fa_secret:
            setup_mfa = True
            secret = pyotp.random_base32()
            user.two_fa_secret = secret
            db.commit()
            otpauth_url = pyotp.totp.TOTP(secret).provisioning_uri(name=req.officer_name, issuer_name="SafeCity AI")

        return {
            "status": "success", 
            "needs_mfa": True, 
            "role": "police", 
            "setup_mfa": setup_mfa, 
            "secret": secret, 
            "otpauth_url": otpauth_url
        }
    if req.role == 'citizen':
        # For hackathon: skip password check, OTP is the real auth factor
        otp = "445566"
        citizen_otp_store[req.email] = otp
        print(f"📧 [MOCK EMAIL] OTP {otp} sent to {req.email}")
        return {"status": "success", "needs_otp": True, "role": "citizen"}
    return {"status": "success", "role": "admin"}

@app.post("/auth/verify-security")
def verify_security(req: VerifyRequest, db: Session = Depends(get_db)):
    if req.role == 'police':
        user = db.query(models.User).filter(models.User.name == req.officer_name, models.User.role == 'police').first()
        if not user or not user.two_fa_secret:
            raise HTTPException(status_code=401, detail="User MFA not setup")
            
        totp = pyotp.TOTP(user.two_fa_secret)
        if totp.verify(req.code):
            if not user.is_2fa_enabled:
                user.is_2fa_enabled = True
                db.commit()
            return {"token": "secure_mfa_token", "role": "police", "userId": user.id}
        raise HTTPException(status_code=401, detail="Invalid MFA Code")
    if req.role == 'citizen':
        if req.code == "445566" or citizen_otp_store.get(req.email) == req.code:
            # Check or create user
            user = db.query(models.User).filter(models.User.email == req.email).first()
            if not user:
                 user = models.User(email=req.email, role="citizen", hashed_password="mock_password")
                 db.add(user)
                 db.commit()
                 db.refresh(user)
            # Create a JWT token
            token = jwt.encode({"sub": req.email, "role": "citizen"}, JWT_SECRET, algorithm=JWT_ALGORITHM)
            return {"token": token, "userId": user.id, "role": "citizen"}
        raise HTTPException(status_code=401, detail="Invalid OTP Code")
    raise HTTPException(status_code=400, detail="Security mismatch")

@app.get("/api/firs")
def get_firs(db: Session = Depends(get_db)):
    firs = db.query(models.FIR).order_by(models.FIR.timestamp.desc()).all()
    # Sanitize or add full URL for statement_path if needed
    return {"data": firs}

@app.post("/api/firs")
async def create_fir(
    FIR_ID: str = Form(...),
    Crime_Type: str = Form(...),
    IPC_Section: str = Form(...),
    Latitude: float = Form(...),
    Longitude: float = Form(...),
    Date_Time: str = Form(...),
    Description: str = Form(...),
    Police_Station: str = Form(...),
    Statement_File: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    file_path = None
    if Statement_File:
        file_path = os.path.join(UPLOAD_DIR, f"{FIR_ID}_{Statement_File.filename}")
        with open(file_path, "wb") as f:
            content = await Statement_File.read()
            f.write(content)
            
    # Create Tamper-Proof Integrity Hash (SHA-256)
    record_payload = f"{FIR_ID}{Crime_Type}{IPC_Section}{Latitude}{Longitude}{Date_Time}{SECRET_SALT}"
    integrity_hash = hashlib.sha256(record_payload.encode()).hexdigest()

    new_fir = models.FIR(
        fir_id=FIR_ID,
        crime_type=Crime_Type,
        ipc_section=IPC_Section,
        lat=Latitude,
        lng=Longitude,
        date_time=Date_Time,
        description=Description,
        police_station=Police_Station,
        statement_path=file_path,
        integrity_hash=integrity_hash,
        status="Open"
    )
    
    db.add(new_fir)
    db.commit()
    db.refresh(new_fir)
    return {"status": "success", "data": new_fir}

@app.get("/api/sos")
def get_sos(db: Session = Depends(get_db)):
    alerts = db.query(models.SOSAlert).all()
    return {"data": alerts}

import hashlib
import json

active_police_connections: List[WebSocket] = []

@app.websocket("/ws/police/alerts")
async def police_alerts_ws(websocket: WebSocket):
    await websocket.accept()
    active_police_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_police_connections.remove(websocket)

@app.post("/api/sos/trigger")
async def trigger_sos(req: SOSTrigger, db: Session = Depends(get_db)):
    data_string = f"{req.lat}-{req.lng}-{datetime.datetime.utcnow().isoformat()}"
    mock_hash = hashlib.sha256(data_string.encode()).hexdigest()
    
    new_sos = models.SOSAlert(
        type=req.type,
        location="Unknown (Reverse Geocoding Mock)",
        lat=req.lat,
        lng=req.lng,
        media_url=req.mediaUrl,
        blockchain_hash=mock_hash,
        status="active"
    )
    db.add(new_sos)
    db.commit()
    db.refresh(new_sos)
    
    print(f"🚨 [MOCK FIREBASE/TWILIO] SOS Triggered! ID: {new_sos.id} | Hash: {mock_hash}")
    
    # Broadcast to Police Command Center
    alert_payload = {
        "id": new_sos.id, 
        "type": new_sos.type, 
        "lat": new_sos.lat, 
        "lng": new_sos.lng, 
        "status": "active", 
        "time": "Just now", 
        "location": new_sos.location
    }
    for connection in active_police_connections:
        try:
            await connection.send_json(alert_payload)
        except Exception as e:
            pass
            
    return {"status": "success", "data": {"id": new_sos.id, "hash": mock_hash}}

active_connections: List[WebSocket] = []

@app.websocket("/ws/sos/{alert_id}")
async def sos_tracking_ws(websocket: WebSocket, alert_id: int):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            print(f"📍 [WS] Live loc for SOS {alert_id}: {data}")
            for connection in active_connections:
                if connection != websocket:
                    await connection.send_json({"alert_id": alert_id, "data": data})
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"WS connection closed for SOS {alert_id}")

# ==========================================
# CITIZEN BACKEND (MODULE 7) ENHANCEMENTS
# ==========================================
import jwt
import json

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGORITHM = "HS256"

# Mock Redis Store
# In a real app: import redis; redis_client = redis.Redis(...)
mock_redis_alerts = []

class CitizenPhoneAuthRequest(BaseModel):
    phone: str

class CitizenOTPVerifyRequest(BaseModel):
    phone: str
    code: str

class UserReportCreate(BaseModel):
    crimeType: str
    location: str
    lat: float
    lng: float
    description: str
    userId: Optional[int] = None

class EmergencyContactsReq(BaseModel):
    userId: int
    contacts: List[str]

class RouteRequest(BaseModel):
    startLat: float
    startLng: float
    endLat: float
    endLng: float

@app.post("/api/citizen/auth/req-otp")
def req_citizen_otp(req: CitizenPhoneAuthRequest):
    # Mock sending OTP
    otp = "123456" # Static for hackathon
    citizen_otp_store[req.phone] = otp
    print(f"📱 [MOCK TWILIO] Sending OTP {otp} to {req.phone}")
    return {"status": "success", "message": "OTP sent"}

@app.post("/api/citizen/auth/verify")
def verify_citizen_otp(req: CitizenOTPVerifyRequest, db: Session = Depends(get_db)):
    if citizen_otp_store.get(req.phone) == req.code or req.code == "123456":
        # Create user if doesn't exist
        user = db.query(models.User).filter(models.User.phone == req.phone).first()
        if not user:
            user = models.User(phone=req.phone, role="citizen")
            db.add(user)
            db.commit()
            db.refresh(user)
        
        token = jwt.encode({"sub": req.phone, "role": "citizen"}, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return {"status": "success", "token": token, "userId": user.id}
    
    raise HTTPException(status_code=401, detail="Invalid OTP")

@app.get("/api/citizen/map/danger-zones")
def get_danger_zones(db: Session = Depends(get_db)):
    print("⚡ [REDIS-CACHE] Checking for 'danger_zones' cache key...")
    zones = db.query(models.DangerZone).all()
    if not zones: # Return mocks if empty
        return {
            "data": [
                {"id": 1, "name": "Zone A", "risk_level": "Red", "lat": 13.0827, "lng": 80.2707, "radius": 500},
                {"id": 2, "name": "Zone B", "risk_level": "Yellow", "lat": 13.0600, "lng": 80.2400, "radius": 300}
            ],
            "from_cache": True
        }
    print("⚡ [REDIS-CACHE] Cache miss! Fetched from DB. Setting value format in Redis...")
    return {"data": zones, "from_cache": False}

@app.post("/api/citizen/route/safe")
def get_safe_route(req: RouteRequest):
    # Mocking Safe Route avoidance logic
    cache_key = f"route_{req.startLat}_{req.endLng}"
    print(f"⚡ [REDIS-CACHE] Checking cache for key: {cache_key}")
    print(f"🗺️ Calculating safe route from ({req.startLat}, {req.startLng}) to ({req.endLat}, {req.endLng}) avoiding Red/Yellow zones.")
    # Return exactly the waypoints needed or dummy logic
    waypoints = [
         {"lat": req.startLat, "lng": req.startLng},
         {"lat": (req.startLat + req.endLat)/2 + 0.01, "lng": (req.startLng + req.endLng)/2 + 0.01}, # slight detour
         {"lat": req.endLat, "lng": req.endLng}
    ]
    print(f"⚡ [REDIS-CACHE] Storing calculated route in Redis TTL=3600")
    return {"status": "success", "route": waypoints, "from_cache": False}

@app.get("/api/citizen/alerts/nearby")
def get_nearby_alerts(lat: float, lng: float, radius: float = 5.0):
    # Mock fetching from Redis for speed
    print(f"⚡ [REDIS SET] Querying active alerts via GEORADIUS near {lat}, {lng} within {radius}km")
    return {"status": "success", "data": mock_redis_alerts, "from_cache": True}

@app.post("/api/citizen/report")
def report_crime(req: UserReportCreate, db: Session = Depends(get_db)):
    new_report = models.UserReport(
        user_id=req.userId,
        crime_type=req.crimeType,
        location=req.location,
        lat=req.lat,
        lng=req.lng,
        description=req.description
    )
    db.add(new_report)
    db.commit()
    return {"status": "success", "message": "Crime reported successfully"}

@app.put("/api/citizen/contacts")
def update_contacts(req: EmergencyContactsReq, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.emergency_contacts = json.dumps(req.contacts)
    db.commit()
    return {"status": "success", "message": "Emergency contacts updated"}

@app.post("/api/citizen/notify")
def notify_contacts(userId: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == userId).first()
    if user and user.emergency_contacts:
        contacts = json.loads(user.emergency_contacts)
        print(f"🔔 [FIREBASE CLOUD MESSAGING] Pushing emergency notification templates to {contacts}")
        return {"status": "success", "message": "FCM Push Notifications sent out to emergency circle"}
    return {"status": "failed", "message": "No contacts found"}

# Guardian Mode Tracker (WebSocket)
active_guardian_connections: List[WebSocket] = []

@app.websocket("/ws/citizen/guardian/{user_id}")
async def guardian_tracking_ws(websocket: WebSocket, user_id: int):
    await websocket.accept()
    active_guardian_connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # print(f"🛡️ [GUARDIAN] User {user_id} live location: {data}")
            # broadcast to guardians
            for connection in active_guardian_connections:
                if connection != websocket:
                    await connection.send_json({"user_id": user_id, "data": data})
    except WebSocketDisconnect:
        active_guardian_connections.remove(websocket)
        print(f"Guardian tracking WS disconnected for User {user_id}")

# ==========================================
# MODULE 10: ADMIN & ANALYTICS ENDPOINTS
# ==========================================

@app.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db)):
    """Aggregate system-wide statistics for the Admin Dashboard."""
    try:
        fir_count     = db.query(models.FIR).count()
        sos_count     = db.query(models.SOSAlert).count()
        citizen_count = db.query(models.User).filter(models.User.role == "citizen").count()
        officer_count = db.query(models.User).filter(models.User.role == "police").count()
        report_count  = db.query(models.UserReport).count() if hasattr(models, 'UserReport') else 0
        return {
            "fir_count":     fir_count,
            "sos_count":     sos_count,
            "citizen_count": citizen_count,
            "officer_count": officer_count,
            "report_count":  report_count,
        }
    except Exception as e:
        return {"fir_count": 0, "sos_count": 0, "citizen_count": 0, "officer_count": 0, "report_count": 0, "error": str(e)}

@app.get("/admin/health")
def admin_health(db: Session = Depends(get_db)):
    """Return system health status for all components."""
    db_status = "ok"
    try:
        db.execute(__import__('sqlalchemy').text("SELECT 1"))
    except Exception:
        db_status = "error"
    return {
        "api":        "ok",
        "db":         db_status,
        "websocket":  "ok",
        "blockchain": "mock",
        "redis":      "mock",
        "kafka":      "not_configured",
        "model_lstm":    {"status": "active", "accuracy": 87},
        "model_xgboost": {"status": "active", "accuracy": 82},
    }

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    """Return all police officers and citizens with their details."""
    users = db.query(models.User).all()
    result = []
    for u in users:
        result.append({
            "id":              u.id,
            "name":            u.name or "—",
            "email":           u.email or "—",
            "phone":           u.phone or "—",
            "role":            u.role,
            "is_active":       u.is_active,
            "is_2fa_enabled":  u.is_2fa_enabled,
        })
    return {"data": result}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user by ID."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"status": "success", "message": f"User {user_id} deleted"}


@app.post("/admin/retrain")
def admin_retrain():
    """Trigger mock model retraining (simulated for hackathon)."""
    import time
    time.sleep(1)  # Simulate training delay
    print("🤖 [MOCK ML] Retraining LSTM and XGBoost models on latest data...")
    return {
        "status": "success",
        "message": "Models retrained successfully",
        "lstm_accuracy": 87,
        "xgboost_accuracy": 82,
        "trained_at": datetime.datetime.utcnow().isoformat()
    }

# ==========================================
# MODULE 4: PATROL ROUTE GENERATOR
# ==========================================
from patrol_rl_agent import generate_ppo_route

class RouteGenRequest(BaseModel):
    officer_id: int
    shift_start_hours: int = 20 # 8 PM
    shift_end_hours: int = 4    # 4 AM

class GPSLogRequest(BaseModel):
    officer_id: int
    lat: float
    lng: float

@app.post("/api/patrol/generate-route")
def generate_officer_route(req: RouteGenRequest, db: Session = Depends(get_db)):
    # 1. Get Danger Zones
    zones = db.query(models.DangerZone).all()
    if not zones:
        # Provide fallback danger zones just in case DB is empty
        zones = [
            models.DangerZone(id=1, name="Zone Alpha", risk_level="Red", lat=13.0827, lng=80.2707),
            models.DangerZone(id=2, name="Zone Beta", risk_level="Yellow", lat=13.0600, lng=80.2400)
        ]
        
    now = datetime.datetime.utcnow()
    start_time = now.replace(hour=req.shift_start_hours, minute=0, second=0, microsecond=0)
    end_time = now.replace(hour=req.shift_end_hours, minute=0, second=0, microsecond=0)
    if end_time < start_time:
        end_time += datetime.timedelta(days=1)
        
    # 2. Generate PPO Route
    route_plan = generate_ppo_route(req.officer_id, start_time, end_time, zones)
    
    # 3. Store in DB
    new_route = models.PatrolRoute(
        officer_id=req.officer_id,
        date=now.date(),
        shift_start=start_time,
        shift_end=end_time,
        route_data=json.dumps(route_plan),
        status="Active"
    )
    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    
    return {"status": "success", "route": route_plan, "route_id": new_route.id}

@app.get("/api/patrol/my-route")
def get_my_route(officer_id: int, db: Session = Depends(get_db)):
    route = db.query(models.PatrolRoute).filter(models.PatrolRoute.officer_id == officer_id, models.PatrolRoute.status == "Active").order_by(models.PatrolRoute.id.desc()).first()
    if route and route.route_data:
        return {"status": "success", "route": json.loads(route.route_data)}
    return {"status": "success", "route": []}

@app.post("/api/patrol/log-gps")
def log_gps(req: GPSLogRequest):
    print(f"📡 [GPS] Logged coordinates for Officer {req.officer_id}: ({req.lat}, {req.lng})")
    # In a full app, this would save to a GPS history table.
    return {"status": "success"}

# WebSocket for Officer App
active_officer_connections: dict = {}

@app.websocket("/ws/officer/{officer_id}")
async def officer_tracking_ws(websocket: WebSocket, officer_id: int):
    await websocket.accept()
    active_officer_connections[officer_id] = websocket
    try:
        while True:
            # We receive GPS updates via WebSocket
            data = await websocket.receive_json()
            print(f"🚓 [OFFICER-WS] Officer {officer_id} tracking data: {data}")
            # Optionally broadcast to an admin dashboard connection list
    except WebSocketDisconnect:
        if officer_id in active_officer_connections:
            del active_officer_connections[officer_id]
        print(f"Officer tracking WS disconnected for Officer {officer_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8888, reload=True)
