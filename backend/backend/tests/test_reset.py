import pytest
from sqlalchemy import create_engine, text
from httpx import AsyncClient
from datetime import datetime

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)

@pytest.mark.asyncio
async def test_reset_password():
    test_user = {
        "email": "test@example.com",
        "nume": "TestReset",
        "prenume": "Test",
        "hash_parola": "ParolaVeche"
    }
    with engine.connect() as connection:
        insert_user_query = text("""
            INSERT INTO users (email, nume, prenume, hash_parola)
            VALUES (:email, :nume, :prenume, :hash_parola)
            RETURNING id_user;
        """)
        result = connection.execute(insert_user_query, test_user)
        user_id = result.scalar()
        connection.commit()
    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.post(
            "/reset-password",
            json={"email": test_user["email"]}
        )
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["message"] == "Password reset successfully"
    assert len(response_data["new_password"]) > 0

    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT hash_parola FROM users WHERE id_user = :user_id"),
            {"user_id": user_id}
        )
        new_hash = result.scalar()
        assert new_hash != test_user["hash_parola"]

    async with AsyncClient(base_url="http://localhost:8000") as client:
        response = await client.post(
            "/reset-password",
            json={"email": "utilizator404@example.com"}
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "User does not exist"

    with engine.connect() as connection:
        connection.execute(text("DELETE FROM users WHERE id_user = :user_id"), {"user_id": user_id})
        connection.commit()