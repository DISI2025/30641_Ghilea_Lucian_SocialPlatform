from sqlalchemy import create_engine, text
from datetime import date

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)

insert_query = text("""
    INSERT INTO users (
        id_user,
        nume,
        prenume,
        email,
        hash_parola,
        data_nasterii,
        id_poza_profil,
        bio,
        moderator
    ) VALUES (
        :id_user,
        :nume,
        :prenume,
        :email,
        :hash_parola,
        :data_nasterii,
        :id_poza_profil,
        :bio,
        :moderator
    )
""")

params = {
    "id_user": "123456",
    "nume": "Popescu6",
    "prenume": "Andrei6",
    "email": "andrei6.popescu@example.com",
    "hash_parola": "parola6",
    "data_nasterii": date(1990, 5, 15),
    "id_poza_profil": None,
    "bio": "Salut, sunt Andrei!",
    "moderator": False
}

with engine.connect() as conn:
    conn.execute(insert_query, params)
    conn.commit()
    print("✅ Utilizator adăugat cu succes!")
