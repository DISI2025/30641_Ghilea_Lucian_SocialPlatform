from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text, TIMESTAMP, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id_user = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nume = Column(String)
    prenume = Column(String)
    email = Column(String, unique=True)
    hash_parola = Column(String)
    data_nasterii = Column(Date)
    id_poza_profil = Column(Integer, nullable=True)
    bio = Column(String, nullable=True)
    moderator = Column(Boolean, default=False)

class Foto(Base):
    __tablename__ = "fotos"

    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    id_album = Column(Integer, nullable=True)
    url = Column(Text, nullable=True)
    caption = Column(String(255), nullable=True)
    status = Column(String(64), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime)
    image_data = Column(LargeBinary)  # New column for image BLOB
