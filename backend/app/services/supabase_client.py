from app.schemas.chat import ChatMessageSchema
from app.core.config import supabase  # Supabaseクライアント

def save_message_to_supabase(message: ChatMessageSchema):
    data = {
        "chat_room_id": message.chat_room_id,
        "sender_token": message.sender_token,
        "content": message.content,
        "created_at": message.created_at
    }

    response = supabase.table("messages").insert(data).execute()
    if response.error:
        raise Exception(f"Failed to save message: {response.error}")