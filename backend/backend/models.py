from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text, TIMESTAMP, LargeBinary, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id_user = Column(Integer, primary_key=True, index=True)
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
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class Friendships(Base):
    __tablename__ = "friendships"

    id_user1 = Column(Integer, nullable=False)
    id_user2 = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime)

    __table_args__ = (
        PrimaryKeyConstraint('id_user1', 'id_user2'),
    )

class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    nume = Column(String(255), nullable=False)
    vizibilitate = Column(String(50), default="privat")
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class AlbumPhoto(Base):
    __tablename__ = "album_photos"

    id_album = Column(Integer, ForeignKey("albums.id", ondelete="CASCADE"), primary_key=True)
    id_foto = Column(Integer, ForeignKey("fotos.id", ondelete="CASCADE"), primary_key=True)
    added_at = Column(TIMESTAMP, default=datetime.utcnow)

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    id_sender = Column(Integer, ForeignKey("users.id_user"), primary_key=True)
    id_receiver = Column(Integer, ForeignKey("users.id_user"), primary_key=True)
    status = Column(String, nullable=False, default="PENDING")
    created_at = Column(TIMESTAMP, default=datetime)
