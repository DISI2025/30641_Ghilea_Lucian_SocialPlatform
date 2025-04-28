import redis
import json
import time

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

TEMP_KEY = "test:expire"
TEMP_DATA = {"test": "data"}

# 1. Setăm o valoare cu TTL de 5 secunde
redis_client.setex(TEMP_KEY, 5, json.dumps(TEMP_DATA))
print(f" Setat {TEMP_KEY} cu TTL 5 secunde.")

# 2. Verificăm că există imediat
if redis_client.exists(TEMP_KEY):
    print(" Cheia există imediat după setare.")

# 3. Așteptăm 6 secunde
time.sleep(6)

# 4. Verificăm dacă a expirat
if not redis_client.exists(TEMP_KEY):
    print(" Cheia a expirat corect după 5 secunde.")
else:
    print(" Cheia NU a expirat!")
