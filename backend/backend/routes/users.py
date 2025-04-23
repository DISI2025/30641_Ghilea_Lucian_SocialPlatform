from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import SessionLocal
from backend.models import User
from backend.schemas import UserCreate
from backend.passwords import hash_password

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Obține sesiunea DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint de înregistrare
@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email deja folosit")

    new_user = User(
        nume=user_data.nume,
        prenume=user_data.prenume,
        email=user_data.email,
        hash_parola=hash_password(user_data.parola),
        data_nasterii=user_data.data_nasterii,
        bio=user_data.bio,
        moderator=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Utilizator înregistrat cu succes", "user_id": new_user.id_user}
