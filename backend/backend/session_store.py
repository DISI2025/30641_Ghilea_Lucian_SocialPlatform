# session_store.py
import uuid
from typing import Optional

# Dicționarul global pentru sesiuni: token -> user_id
session_store = {}

def create_session(user_id: int) -> str:
    session_token = str(uuid.uuid4())
    session_store[session_token] = user_id
    return session_token

def get_user_id_by_token(token: str) -> Optional[int]:
    return session_store.get(token)

def delete_session(token: str):
    session_store.pop(token, None)
