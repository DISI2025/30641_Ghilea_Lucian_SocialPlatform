# from _pydatetime import datetime

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


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


model_config = {
        "from_attributes": True
    }

