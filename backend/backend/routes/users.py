from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal
from schemas import UserCreate, UserLogin, AddPhotosToAlbum
from passwords import verify_password, hash_password
from redis_store import create_session, delete_session, get_user_id_by_token
from models import User, AlbumPhoto, Foto, Album, Friendships, FriendRequest, Message, Conversation
import uuid
from fastapi import Body

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
    if not user or not verify_password(credentials.parola, user.hash_parola):
        raise HTTPException(status_code=401, detail="Email sau parolă incorecte")

    token = create_session(user.id_user)
    return {
        "message": "Autentificare reușită",
        "token": token,
        "user_id": user.id_user,
        "moderator": user.moderator
    }


@router.post("/logout")
def logout(Authorization: str = Header(...)):
    token = Authorization.replace("Bearer ", "")
    delete_session(token)
    return {"message": "Delogare reușită"}


def get_current_user(Authorization: str = Header(...)) -> int:
    token = Authorization.replace("Bearer ", "")
    user_id = get_user_id_by_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid sau expirat")
    return user_id


@router.get("/me")
def get_logged_in_user(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există")
    return {
        "id": user.id_user,
        "nume": user.nume,
        "email": user.email,
        "moderator": user.moderator
    }
@router.post("/album/add-photos")
def add_photos_to_album(data: AddPhotosToAlbum, db: Session = Depends(get_db)):
    for photo_id in data.photo_ids:
        relation = AlbumPhoto(id_album=data.id_album, id_foto=photo_id)
        db.add(relation)
    db.commit()
    return {"message": f"{len(data.photo_ids)} fotografii adăugate în albumul {data.id_album}"}

@router.post("/validate-user/{user_id}")
def validate_user(user_id: int, moderator_id: int, db: Session = Depends(get_db)):
    moderator = db.query(User).filter(User.id_user == moderator_id).first()
    if not moderator or not moderator.moderator:
        raise HTTPException(status_code=403, detail="Acces interzis. Doar moderatorii pot valida conturi.")

    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit")

    user.is_validated = True
    db.commit()
    return {"message": f"Contul utilizatorului cu ID {user_id} a fost validat"}

@router.delete("/delete-user/{user_id}")
def delete_user(user_id: int, moderator_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    moderator = db.query(User).filter(User.id_user == moderator_id).first()
    if not moderator or not moderator.moderator:
        raise HTTPException(status_code=403, detail="Doar moderatorii pot șterge conturi")

    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există")

    # Șterge relațiile din album_photos
    db.query(AlbumPhoto).filter(AlbumPhoto.id_foto.in_(
        db.query(Foto.id).filter(Foto.id_user == user_id)
    )).delete(synchronize_session=False)

    # Șterge fotografiile utilizatorului
    db.query(Foto).filter(Foto.id_user == user_id).delete(synchronize_session=False)

    # Șterge cereri de prietenie trimise și primite
    db.query(FriendRequest).filter(
        (FriendRequest.id_sender == user_id) | (FriendRequest.id_receiver == user_id)
    ).delete(synchronize_session=False)

    # Șterge prieteniile în care este implicat
    db.query(Friendships).filter(
        (Friendships.id_user1 == user_id) | (Friendships.id_user2 == user_id)
    ).delete(synchronize_session=False)

    # Șterge mesajele trimise sau primite
    db.query(Message).filter(
        (Message.id_sender == user_id) | (Message.id_receiver == user_id)
    ).delete(synchronize_session=False)

    # Șterge conversațiile în care este implicat
    db.query(Conversation).filter(
        (Conversation.id_user1 == user_id) | (Conversation.id_user2 == user_id)
    ).delete(synchronize_session=False)

    # Șterge contul utilizatorului
    db.delete(user)
    db.commit()

    return {"message": f"Contul utilizatorului cu ID {user_id} a fost șters."}


@router.delete("/delete-own-account")
def delete_own_account(Authorization: str = Header(...), db: Session = Depends(get_db)):
    token = Authorization.replace("Bearer ", "")
    user_id = get_user_id_by_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid sau expirat")

    # Ștergere date asociate
    db.query(Message).filter((Message.id_sender == user_id) | (Message.id_receiver == user_id)).delete()
    db.query(Conversation).filter((Conversation.id_user1 == user_id) | (Conversation.id_user2 == user_id)).delete()
    db.query(AlbumPhoto).filter(AlbumPhoto.id_foto.in_(
        db.query(Foto.id).filter(Foto.id_user == user_id)
    )).delete()
    db.query(Foto).filter(Foto.id_user == user_id).delete()
    db.query(FriendRequest).filter((FriendRequest.id_sender == user_id) | (FriendRequest.id_receiver == user_id)).delete()
    db.query(Friendships).filter((Friendships.id_user1 == user_id) | (Friendships.id_user2 == user_id)).delete()

    # Ștergere cont
    db.query(User).filter(User.id_user == user_id).delete()
    db.commit()

    # Invalidare sesiune
    delete_session(token)

    return {"message": "Contul a fost sters cu succes"}
