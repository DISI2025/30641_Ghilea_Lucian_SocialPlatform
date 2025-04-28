import base64

from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, or_, and_, desc, func
from sqlalchemy.orm import sessionmaker, Session
import models, schemas
from fastapi import Form
from fastapi import UploadFile, File
from typing import List
import psycopg2
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from database import SessionLocal, engine
from passwords import generate_random_password, hash_password
from schemas import ResetPasswordRequest, PendingFriendRequest, FriendInfo
from models import User, Friendships, FriendRequest, Foto, Base
from typing import List
from fastapi import HTTPException
import datetime
from routes import users, albums
from redis_config import redis_client
from cache_store import get_cached_profile, set_cached_profile

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")
app.include_router(albums.router, prefix="/api")
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/profile/{id_user}")
def update_profile(id_user: int, profile: schemas.UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile.nume is not None:
        user.nume = profile.nume
    if profile.prenume is not None:
        user.prenume = profile.prenume
    if profile.data_nasterii is not None:
        user.data_nasterii = profile.data_nasterii
    if profile.bio is not None:
        user.bio = profile.bio
    db.commit()
    return {"message": "Profile updated successfully"}

@app.get("/profile/{id_user}", response_model=schemas.UserProfileResponse)
def get_profile(id_user: int, db: Session = Depends(get_db)):
    cached = get_cached_profile(id_user)
    if cached:
        return cached

    user = db.query(models.User).filter(models.User.id_user == id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    response_data = {
        "id_user": user.id_user,
        "nume": user.nume,
        "prenume": user.prenume,
        "email": user.email,
        "data_nasterii": user.data_nasterii,
        "bio": user.bio
    }
    set_cached_profile(id_user, response_data)
    return response_data

@app.post("/upload_photo/")
async def upload_photo(
        id_user: int = Form(...),
        caption: str = Form(...),
        status: str = Form(...),
        image_file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    image_bytes = await image_file.read()

    new_photo = Foto(
        id_user=id_user,
        caption=caption,
        status=status,
        image_data=image_bytes,
        created_at=datetime.datetime.now(),
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

@app.get("/get_photos_by_user/{id_user}")
def get_photos_by_user(id_user: int, db: Session = Depends(get_db)):
    photos = db.query(Foto).filter(Foto.id_user == id_user).order_by(desc(Foto.created_at)).all()

    if not photos:
        raise HTTPException(status_code=404, detail="No photos found for this user")

    photo_list = []
    for photo in photos:
        if photo.image_data:
            base64_image = base64.b64encode(photo.image_data).decode("utf-8")
            photo_list.append({
                "photo_id": photo.id,
                "caption": photo.caption,
                "status": photo.status,
                "created_at": photo.created_at,
                "image_base64": base64_image
            })

    return {"photos": photo_list}
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

#   SearchHelp
@app.get("/get_friends/{id_user}/{searchstring}", response_model=List[FriendInfo])
def search_potential_friends(id_user: int, searchstring: str, db: Session = Depends(get_db)):
    friend_ids = db.query(Friendships).filter(
        (Friendships.id_user1 == id_user) | (Friendships.id_user2 == id_user)
    ).all()
    already_friends_ids = []
    for f in friend_ids:
        if f.id_user1 == id_user:
            already_friends_ids.append(f.id_user2)
        else:
            already_friends_ids.append(f.id_user1)
    pending_requests = db.query(FriendRequest).filter(
        or_(
            and_(FriendRequest.id_sender == id_user),
            and_(FriendRequest.id_receiver == id_user)
        )
    ).all()

    for r in pending_requests:
        if r.id_sender == id_user:
            already_friends_ids.append(r.id_receiver)
        else:
            already_friends_ids.append(r.id_sender)

    exclude_ids = set(already_friends_ids + [id_user])

    results = db.query(User).filter(
        or_(
            User.nume.ilike(f"%{searchstring}%"),
            User.prenume.ilike(f"%{searchstring}%"),
            User.email.ilike(f"%{searchstring}%")
        ),
        ~User.id_user.in_(exclude_ids)
    ).limit(5).all()
    return results

@app.get("/getfriends/{id_user}", response_model=List[FriendInfo])
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
@app.get("/get_idling_friendrequest/{id_user}", response_model=List[PendingFriendRequest])
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
        created_at=datetime.datetime.now()
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
        status="pending",
        created_at=datetime.datetime.now()
    )
    db.add(new_request)
    db.commit()
    return {"message": "Friend request sent", "request_id": new_id}
@app.get("/")
def read_root():
    return {"message": "Welcome to the Social Platform API"}

@app.get("/test-redis")
def test_redis():
    redis_client.set("test", "ok")
    return {"test": redis_client.get("test").decode()}
