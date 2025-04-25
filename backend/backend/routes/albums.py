from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Album
from schemas import AlbumCreate, AlbumSummary
from datetime import datetime
from typing import List
from sqlalchemy import func
import base64

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/albums/create")
def create_album(album: AlbumCreate, db: Session = Depends(get_db)):
    new_album = Album(
        id_user=album.id_user,
        nume=album.nume,
        vizibilitate=album.vizibilitate,
        created_at=datetime.utcnow()
    )

    db.add(new_album)
    db.commit()
    db.refresh(new_album)

    return {"message": "Album creat cu succes", "album_id": new_album.id}

@router.get("/user_albums/{id_user}", response_model=List[AlbumSummary])
def get_user_albums_with_photo_count(id_user: int, db: Session = Depends(get_db)):
    results = db.query(
        Album.id,
        Album.nume,
        func.count(album_photos.c.id_foto).label("foto_count")
    ).outerjoin(
        album_photos, album_photos.c.id_album == Album.id
    ).filter(
        Album.id_user == id_user
    ).group_by(Album.id).order_by(Album.id.desc()).all()

    return results