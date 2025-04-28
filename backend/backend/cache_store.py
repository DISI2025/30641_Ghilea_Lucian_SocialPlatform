from datetime import date

from redis_config import redis_client
import json

CACHE_TTL_SECONDS = 60 * 5

def get_cached_profile(user_id: int):
    data = redis_client.get(f"profile:{user_id}")
    if data:
        return json.loads(data)
    return None

def set_cached_profile(user_id: int, profile_data: dict):
    def convert(o):
        if isinstance(o, date):
            return o.isoformat()
        raise TypeError(f"Type {type(o)} not serializable")

    redis_client.setex(
        f"profile:{user_id}",
        CACHE_TTL_SECONDS,
        json.dumps(profile_data, default=convert)
    )
def delete_cached_profile(user_id: int):
    redis_client.delete(f"profile:{user_id}")
