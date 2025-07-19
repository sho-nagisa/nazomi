# app/schemas/match.py

from pydantic import BaseModel

class MatchCreate(BaseModel):
    user_id_1: str
    user_id_2: str
