import redis
import uuid
from typing import Optional

# Inițializare conexiune Redis
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def create_session(user_id: int) -> str:
    session_token = str(uuid.uuid4())
    redis_client.set(session_token, user_id, ex=1800)  # sesiunea expira dupa 30 minute
    return session_token

def get_user_id_by_token(token: str) -> Optional[int]:
    return redis_client.get(token)

def delete_session(token: str):
    redis_client.delete(token)
