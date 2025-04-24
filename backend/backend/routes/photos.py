from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from models import Foto
from database import SessionLocal
import shutil
import os
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploaded_images"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload-photo", status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    id_user: int = Form(...),
    caption: str = Form(""),
    db: Session = Depends(get_db)
):
    # Creează folderul dacă nu există
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Creează un nume unic pentru imagine
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{id_user}_{timestamp}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Salvează fișierul pe disc
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Creează intrarea în DB
    new_photo = Foto(
        id_user=id_user,
        url=file_path,
        caption=caption,
        status="active"
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return {
        "message": "Fotografie încărcată cu succes",
        "photo_id": new_photo.id,
        "path": file_path
    }
