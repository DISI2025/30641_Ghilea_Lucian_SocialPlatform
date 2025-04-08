from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Social Platform API"}


# 👇 Model pentru datele de la frontend
class SignInData(BaseModel):
    email: str
    password: str


@app.post("/signin")
def signin(data: SignInData):
    # Exemplu simplu de validare
    if data.email == "admin@example.com" and data.password == "1234":
        return {"message": "Autentificare reușită!"}

    raise HTTPException(status_code=401, detail="Email sau parolă greșită")
