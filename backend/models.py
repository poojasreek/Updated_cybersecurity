from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from database import Base
import datetime
# GeoAlchemy2 for PostGIS support
try:
    from geoalchemy2 import Geometry
    HAS_POSTGIS = True
except ImportError:
    HAS_POSTGIS = False

class FIR(Base):
    __tablename__ = "firs"
    
    id = Column(Integer, primary_key=True, index=True)
    fir_id = Column(String, unique=True, index=True)
    crime_type = Column(String)
    location = Column(String)
    
    # Simple coordinates for general use
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    
    # PostGIS Geospatial column (Point)
    if HAS_POSTGIS:
        geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Open")
    severity = Column(String)
    description = Column(Text)
    officer_name = Column(String)
    branch_name = Column(String)

class SOSAlert(Base):
    __tablename__ = "sos_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) 
    location = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    
    # PostGIS Geospatial column (Point)
    if HAS_POSTGIS:
        geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)
        
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="active")
    media_url = Column(String, nullable=True)
    blockchain_hash = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone = Column(String, unique=True, index=True, nullable=True) # Mobile OTP
    hashed_password = Column(String, nullable=True)
    role = Column(String)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_2fa_enabled = Column(Boolean, default=False)
    two_fa_secret = Column(String, nullable=True)
    emergency_contacts = Column(Text, nullable=True) # stored as JSON string

class UserReport(Base):
    __tablename__ = "user_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    crime_type = Column(String)
    location = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Pending")

class DangerZone(Base):
    __tablename__ = "danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    risk_level = Column(String) # 'Red', 'Yellow'
    lat = Column(Float)
    lng = Column(Float)
    radius = Column(Float, default=500.0) # meters

class PatrolRoute(Base):
    __tablename__ = "patrol_routes"

    id = Column(Integer, primary_key=True, index=True)
    officer_id = Column(Integer, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    shift_start = Column(DateTime, nullable=True)
    shift_end = Column(DateTime, nullable=True)
    route_data = Column(Text, nullable=True) # Stored as JSON string
    status = Column(String, default="Pending") # Pending, Active, Completed
