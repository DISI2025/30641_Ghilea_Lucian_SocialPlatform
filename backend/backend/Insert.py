from sqlalchemy import create_engine, text
from datetime import date, datetime, timedelta

DATABASE_URL = "postgresql://postgres:admin@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)

users = [
    # {
    #     "id_user": 12345,
    #     "nume": "Popescu",
    #     "prenume": "Andrei",
    #     "email": "andrei.popescu@example.com",
    #     "hash_parola": "parola",
    #     "data_nasterii": date(1990, 5, 15),
    #     "id_poza_profil": None,
    #     "bio": "Salut, sunt Andrei!",
    #     "moderator": False
    # },
    # {
    #     "id_user": 12346,
    #     "nume": "Dragomir",
    #     "prenume": "Maria",
    #     "email": "maria.dragomir@example.com",
    #     "hash_parola": "parola123",
    #     "data_nasterii": date(1992, 8, 22),
    #     "id_poza_profil": None,
    #     "bio": "Bună, eu sunt Maria!",
    #     "moderator": False
    # },
    # {
    #     "id_user": 12347,
    #     "nume": "Ghilea",
    #     "prenume": "Marius",
    #     "email": "marius.ghilea@example.com",
    #     "hash_parola": "parola456",
    #     "data_nasterii": date(1988, 3, 10),
    #     "id_poza_profil": None,
    #     "bio": "Bună, eu sunt Marius!",
    #     "moderator": False
    # }
    {
        "id_user": 12348,
        "nume": "Dance",
        "prenume": "Andreea",
        "email": "andreea.dance@example.com",
        "hash_parola": "parola123",
        "data_nasterii": date(2000, 5, 15),
        "id_poza_profil": None,
        "bio": "Salut, sunt Andreea!",
        "moderator": False
    },
]

insert_user_query = text("""
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


# friend_requests = [
#     {
#         "id": 1,
#         "id_sender": 12347,  # Marius
#         "id_receiver": 12345,
#         "status": "pending",
#         "created_at": datetime.now() - timedelta(days=2)
#     },
#     {
#         "id": 2,
#         "id_sender": 12346,  # Maria
#         "id_receiver": 12345,
#         "status": "pending",
#         "created_at": datetime.now() - timedelta(days=1)
#     }
# ]
#
# insert_friend_request_query = text("""
#     INSERT INTO friend_requests (
#         id,
#         id_sender,
#         id_receiver,
#         status,
#         created_at
#     ) VALUES (
#         :id,
#         :id_sender,
#         :id_receiver,
#         :status,
#         :created_at
#     )
# """)

with engine.connect() as conn:
    for user in users:
        conn.execute(insert_user_query, user)

    # for request in friend_requests:
    #     conn.execute(insert_friend_request_query, request)

    conn.commit()
    print("Utilizatori și cereri de prietenie adăugate ")