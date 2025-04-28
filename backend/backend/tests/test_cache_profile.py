import redis
import json

# Conectare la Redis (presupunem că e local și default)
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def test_cached_profile(user_id: int):
    key = f"profile:{user_id}"
    cached = redis_client.get(key)

    if not cached:
        print(" Profilul NU e în cache.")
        return

    try:
        data = json.loads(cached)
        assert data.get("id_user") == user_id
        print(f" Profil găsit în cache pentru user_id={user_id}:")
        print(json.dumps(data, indent=4))
    except Exception as e:
        print(" Eroare la parse sau validare:", e)

# Rulează testul pentru user_id 1
if __name__ == "__main__":
    test_cached_profile(1)
