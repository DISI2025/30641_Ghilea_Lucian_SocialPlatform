from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Album
from schemas import AlbumCreate
from datetime import datetime

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
