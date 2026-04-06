import sys
import traceback
import models

with open("out4.log", "w") as f:
    try:
        from database import SessionLocal
        db = SessionLocal()
        user = db.query(models.User).first()
        f.write(f"SQLite success. Found user: {user}\n")
    except Exception as e:
        traceback.print_exc(file=f)
