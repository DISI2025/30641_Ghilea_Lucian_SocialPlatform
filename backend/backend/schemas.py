# from _pydatetime import datetime

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


class UserLogin(BaseModel):
    email: str
    parola: str

class UserProfileUpdate(BaseModel):
    nume: Optional[str] = None
    data_nasterii: Optional[date] = None
    bio: Optional[str] = None

class UserProfileResponse(BaseModel):
    id_user: int
    nume: Optional[str]
    prenume: Optional[str]
    email: Optional[str]
    data_nasterii: Optional[date]
    bio: Optional[str]

class UserCreate(BaseModel):
    nume: str
    prenume: str
    email: str
    parola: str
    data_nasterii: Optional[date]
    bio: Optional[str] = None

class PhotoCreate(BaseModel):
    id_user: int
    image_data: str  # Local path to the image
    caption: Optional[str] = ""
    status: Optional[str] = "active"

class PhotoOut(BaseModel):
    id: int
    caption: Optional[str]
    status: Optional[str]
    created_at: datetime



class ResetPasswordRequest(BaseModel):
    email: Optional[str]

class FriendInfo(BaseModel):
    id_user: int
    nume: Optional[str]
    prenume: Optional[str]
    email: Optional[str]

class PendingFriendRequest(BaseModel):
    id_sender: int
    nume: str
    prenume: str
    created_at: datetime


model_config = {
        "from_attributes": True
    }

