import base64

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Album, Foto, AlbumPhoto
from schemas import AlbumCreate, AlbumSummary, FotoInAlbum
from datetime import datetime
from sqlalchemy import func
from typing import List

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
        created_at=datetime.datetime.utc()
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
        func.count(AlbumPhoto.id_foto).label("foto_count")
    ).outerjoin(
        AlbumPhoto, AlbumPhoto.id_album == Album.id
    ).filter(
        Album.id_user == id_user
    ).group_by(Album.id).order_by(Album.id.desc()).all()

    return results

#Toate pozele dintr-un album
@router.get("/all_fotos/{id_album}", response_model=List[FotoInAlbum])
def get_photos_in_album(id_album: int, db: Session = Depends(get_db)):
    photos_in_album = db.query(
        Foto.id.label("id_foto"),
        Foto.caption,
        AlbumPhoto.added_at,
        Foto.image_data
    ).join(
        AlbumPhoto, AlbumPhoto.id_foto == Foto.id
    ).filter(
        AlbumPhoto.id_album == id_album
    ).order_by(
        AlbumPhoto.added_at.desc()
    ).all()
    result = []
    for photo in photos_in_album:
        base64_image = base64.b64encode(photo.image_data).decode("utf-8")
        result.append(FotoInAlbum(
            id_foto=photo.id_foto,
            caption=photo.caption,
            added_at=photo.added_at,
            image_base64=base64_image
        ))

    return result

