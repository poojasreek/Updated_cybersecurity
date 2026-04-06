import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, SQLALCHEMY_DATABASE_URL
import models

# Re-use engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    db = SessionLocal()
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have data
    if db.query(models.FIR).count() > 0:
        print("Database already contains data. Skipping seeding.")
        return

    print("Seeding database with demo entries for judges...")

    # Sample FIRs
    firs = [
        models.FIR(
            fir_id="FIR-20260403001",
            crime_type="Theft",
            location="T. Nagar, Market Street",
            lat=13.0418, lng=80.2341,
            description="Chain snatching reported by a pedestrian near the bus terminus.",
            severity="medium",
            status="Under Investigation",
            officer_name="SI Rajesh Kumar",
            branch_name="T. Nagar Sector 1",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        ),
        models.FIR(
            fir_id="FIR-20260403002",
            crime_type="Women Safety",
            location="Anna Nagar, Tower Park",
            lat=13.0850, lng=80.2101,
            description="Stalking complaint filed. High-density area, immediate patrolling required.",
            severity="high",
            status="Open",
            officer_name="SI Priya Sharma",
            branch_name="Anna Nagar Central",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        ),
        models.FIR(
            fir_id="FIR-20260403003",
            crime_type="Accident",
            location="OMR, Thoraipakkam Junction",
            lat=12.9516, lng=80.2402,
            description="Multi-vehicle collision at the metro construction signal.",
            severity="low",
            status="Resolved",
            officer_name="SI Vikram Singh",
            branch_name="Traffic Division South",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        ),
        models.FIR(
            fir_id="FIR-20260403004",
            crime_type="NDPS",
            location="Velachery, 100 Feet Road",
            lat=12.9815, lng=80.2180,
            description="Suspected drug peddling activity observed near the mall parking.",
            severity="high",
            status="Open",
            officer_name="Inspector Deepak",
            branch_name="Special Narcotics Unit",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=45)
        ),
        models.FIR(
            fir_id="FIR-20260403005",
            crime_type="General",
            location="Adyar, Besant Avenue",
            lat=13.0067, lng=80.2573,
            description="Public nuisance and illegal parking causing traffic congestion.",
            severity="low",
            status="Resolved",
            officer_name="SI Deepa Menon",
            branch_name="Adyar Traffic Branch",
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=8)
        )
    ]

    # Sample SOS Alerts
    sos = [
        models.SOSAlert(
            type="SOS",
            location="T. Nagar, Bus Terminus",
            lat=13.0425, lng=80.2348,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=2),
            status="active"
        ),
        models.SOSAlert(
            type="Panic",
            location="Guindy, Metro Station",
            lat=13.0075, lng=80.2210,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(minutes=15),
            status="responding"
        )
    ]

    db.add_all(firs)
    db.add_all(sos)
    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed()
