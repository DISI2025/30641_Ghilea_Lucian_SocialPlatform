
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import models, schemas
import psycopg2
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from schemas import PhotoCreate
from models import Foto, Base
from database import SessionLocal, engine
from datetime import date
from backend.password import generate_random_password, hash_password
from backend.schemas import ResetPasswordRequest
from backend.models import User
from routes import users


# # Database connection string (adjust if necessary)
# DATABASE_URL = "postgresql://postgres:admin@localhost:5432/postgres"
#
# # Create an engine and session
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
#ruta pentru inregistrare 
app.include_router(users.router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/profile/{id_user}", response_model=schemas.UserProfileResponse)
def get_profile(id_user: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/profile/{id_user}")
def update_profile(id_user: int, profile: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile.nume is not None:
        user.nume = profile.nume
    if profile.data_nasterii is not None:
        user.data_nasterii = profile.data_nasterii
    if profile.bio is not None:
        user.bio = profile.bio

    db.commit()
    return {"message": "Profile updated successfully"}

@app.post("/upload_photo_json/")
def upload_photo(photo: PhotoCreate, db: Session = Depends(get_db)):
    if not os.path.isfile(photo.image_data):
        raise HTTPException(status_code=400, detail="Image path not found")

    with open(photo.image_data, "rb") as file:
        image_bytes = file.read()

    new_photo = Foto(
        id_user=photo.id_user,
        caption=photo.caption,
        status=photo.status,
        image_data=image_bytes
    )

    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return {"message": "Photo uploaded", "photo_id": new_photo.id}

@app.get("/get_photo/{photo_id}")
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Foto).filter(Foto.id == photo_id).first()
    if not photo or not photo.image_data:
        raise HTTPException(status_code=404, detail="Photo not found")
    return Response(content=photo.image_data, media_type="image/jpeg")

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User does not exist")

    new_password = generate_random_password()
    hashed = hash_password(new_password)

    user.hash_parola = hashed
    db.commit()

    return {"message": "Password reset successfully", "new_password": new_password}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Social Platform API"}


class SignInData(BaseModel):
    email: str
    password: str


@app.post("/signin")
def signin(data: SignInData):

    if data.email == "admin@example.com" and data.password == "1234":
        return {"message": "Autentificare reușită!"}

    raise HTTPException(status_code=401, detail="Email sau parolă greșită")
