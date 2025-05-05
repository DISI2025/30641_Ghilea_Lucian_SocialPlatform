from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from models import Message, Conversation, User
from database import SessionLocal
from datetime import datetime
from schemas import SendMessageRequest, MessageResponse
from redis_store import get_user_id_by_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(Authorization: str = Header(...)) -> int:
    token = Authorization.replace("Bearer ", "")
    user_id = get_user_id_by_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalid sau expirat")
    return user_id

@router.post("/messages/send", response_model=MessageResponse, status_code=201)
def send_message(data: SendMessageRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    now = datetime.utcnow()

    # Convertim id_receiver dacă este furnizat
    receiver_id = data.id_receiver
    if receiver_id is not None:
        try:
            receiver_id = int(receiver_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="ID-ul destinatarului nu este valid")

    # Dacă nu avem id_conversation, căutăm sau creăm conversația
    if not data.id_conversation:
        if receiver_id is None:
            raise HTTPException(status_code=400, detail="Receiver ID necesar daca id-ul conversatiei nu e primit.")

        conversation = db.query(Conversation).filter(
            ((Conversation.id_user1 == user_id) & (Conversation.id_user2 == receiver_id)) |
            ((Conversation.id_user1 == receiver_id) & (Conversation.id_user2 == user_id))
        ).first()

        if not conversation:
            conversation = Conversation(
                id_user1=min(int(user_id), receiver_id),
                id_user2=max(int(user_id), receiver_id),
                created_at=now,
                last_message_at=now
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
    else:
        conversation = db.query(Conversation).filter(Conversation.id == data.id_conversation).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversatie inexistenta :-O ")

        # Dacă nu avem receiver_id, îl deducem din conversație
        if receiver_id is None:
            receiver_id = conversation.id_user1 if conversation.id_user2 == user_id else conversation.id_user2

    # Cream mesajul
    new_message = Message(
        id_conversation=conversation.id,
        id_sender=user_id,
        id_receiver=receiver_id,
        text=data.text,
        sent_at=now
    )

    db.add(new_message)
    conversation.last_message_at = now
    db.commit()
    db.refresh(new_message)

    return new_message
