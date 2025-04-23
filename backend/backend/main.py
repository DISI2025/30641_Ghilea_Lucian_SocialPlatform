from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import backend.models, backend.schemas
import psycopg2
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from backend.schemas import PhotoCreate
from backend.models import Foto, Base
from backend.database import SessionLocal, engine
from datetime import date
from backend.passwords import generate_random_password, hash_password
from backend.schemas import ResetPasswordRequest, PendingFriendRequest
from backend.models import User
from backend.models import User, Friendships, FriendRequest  # adjust based on your file structure
from backend.schemas import FriendInfo
from typing import List
from sqlalchemy import desc
import datetime
from fastapi import HTTPException
from sqlalchemy import func

# # Database connection string (adjust if necessary)
# DATABASE_URL = "postgresql://postgres:admin@localhost:5432/postgres"
#
# # Create an engine and session
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


backend.models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/profile/{id_user}", response_model=backend.schemas.UserProfileResponse)
def get_profile(id_user: int, db: Session = Depends(get_db)):
    user = db.query(backend.models.User).filter(backend.models.User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/profile/{id_user}")
def update_profile(id_user: int, profile: backend.schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(backend.models.User).filter(backend.models.User.id_user == id_user).first()
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
#returneaza o lista de prieteni
@app.get("/getfriends/{id_user}", response_model=list[FriendInfo])
def get_friends(id_user: int, db: Session = Depends(get_db)):
    friendships = db.query(Friendships).filter(
        (Friendships.id_user1 == id_user) | (Friendships.id_user2 == id_user)
    ).all()

    friend_ids = [
        f.id_user2 if f.id_user1 == id_user else f.id_user1 for f in friendships
    ]

    if not friend_ids:
        return []
    friends = db.query(User).filter(User.id_user.in_(friend_ids)).all()

    return friends

#Returneaza o lista ordonata cu toate friendrequesturile cu statusul "PENDING"
@app.get("/get_idling_friendrequest/{id_user}", response_model=list[PendingFriendRequest])
def get_pending_friend_requests(id_user: int, db: Session = Depends(get_db)):
    pending_requests = (
        db.query(
            FriendRequest.id_sender,
            User.nume,
            User.prenume,
            FriendRequest.created_at
        )
        .join(User, FriendRequest.id_sender == User.id_user)
        .filter(FriendRequest.id_receiver == id_user, FriendRequest.status == "pending")
        .order_by(desc(FriendRequest.created_at))
        .all()
    )

    return pending_requests

@app.post("/accept_friendrequest/{id_receiver}/{id_sender}")
def accept_friend_request(id_receiver: int, id_sender: int, db: Session = Depends(get_db)):
    request = db.query(FriendRequest).filter(
        FriendRequest.id_sender == id_sender,
        FriendRequest.id_receiver == id_receiver,
        FriendRequest.status == "pending"
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Friend request not found")

    request.status = "accepted"
    friendship = Friendships(
        id_user1=min(id_sender, id_receiver),
        id_user2=max(id_sender, id_receiver),
        created_at=datetime()
    )
    db.add(friendship)
    db.commit()
    return {"message": "Friend request accepted"}
@app.post("/decline_friendrequest/{id_receiver}/{id_sender}")
def decline_friend_request(id_receiver: int, id_sender: int, db: Session = Depends(get_db)):
    request = db.query(FriendRequest).filter(
        FriendRequest.id_sender == id_sender,
        FriendRequest.id_receiver == id_receiver,
        FriendRequest.status == "pending"
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Friend request not found")

    request.status = "declined"
    db.commit()

    return {"message": "Friend request declined"}

@app.post("/send_friend_request/{id_sender}/{email_receiver}")
def send_friend_request(id_sender: int, email_receiver: str, db: Session = Depends(get_db)):
    receiver = db.query(User).filter(User.email == email_receiver).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    if receiver.id_user == id_sender:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    existing_request = db.query(FriendRequest).filter(
        ((FriendRequest.id_sender == id_sender) & (FriendRequest.id_receiver == receiver.id_user)) |
        ((FriendRequest.id_sender == receiver.id_user) & (FriendRequest.id_receiver == id_sender))
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already exists")

    max_id = db.query(func.max(FriendRequest.id)).scalar()
    new_id = (max_id or 0) + 1

    new_request = FriendRequest(
        id=new_id,
        id_sender=id_sender,
        id_receiver=receiver.id_user,
        status="PENDING",
        created_at=datetime.datetime.now()
    )

    db.add(new_request)
    db.commit()

    return {"message": "Friend request sent", "request_id": new_id}
@app.get("/")
def read_root():
    return {"message": "Welcome to the Social Platform API"}
