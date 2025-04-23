from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal
from models import User
from schemas import UserCreate
from passwords import hash_password
from schemas import UserLogin
from passwords import verify_password

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

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email sau parolă incorecte")

    if not verify_password(credentials.parola, user.hash_parola):
        raise HTTPException(status_code=401, detail="Email sau parolă incorecte")

    return {
        "message": "Te-ai conectat, man",
        "user_id": user.id_user,
        "nume": user.nume,
        "prenume": user.prenume,
        "email": user.email
    }