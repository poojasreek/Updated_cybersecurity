import sys
import traceback

with open("out.log", "w") as f:
    try:
        from main import app, LoginRequest, login
        from database import SessionLocal
        
        req = LoginRequest(role="citizen", email="test@test.com", password="123")
        db = SessionLocal()
        
        f.write(str(login(req, db)) + "\n")
    except Exception as e:
        traceback.print_exc(file=f)
