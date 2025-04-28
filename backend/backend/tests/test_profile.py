import pytest
import datetime
from sqlalchemy import create_engine, text
from httpx import AsyncClient

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)
@pytest.mark.asyncio
async def test_get_user_profile_live():
    test_data = {
        "email": "test@example.com",
        "nume": "Test",
        "prenume": "Test",
        "bio": "Test",
        "data_nasterii": datetime.date(1990, 1, 1)
    }

    with engine.connect() as connection:
        insert_user_query = text("""
            INSERT INTO users (email, nume, prenume, bio, data_nasterii)
            VALUES (:email, :nume, :prenume, :bio, :data_nasterii)
            RETURNING id_user;
        """)
        result = connection.execute(insert_user_query, test_data)
        user_id = result.scalar()
        connection.commit()

    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get(f"/profile/{user_id}")

    assert response.status_code == 200
    response_data = response.json()

    assert response_data == {
        "id_user": user_id,
        "nume": test_data["nume"],
        "prenume": test_data["prenume"],
        "email": test_data["email"],
        "bio": test_data["bio"]
    }

    with engine.connect() as connection:
        connection.execute(text("DELETE FROM users WHERE id_user = :user_id"), {"user_id": user_id})
        connection.commit()


    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.get("/profile/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
