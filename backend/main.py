import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cache import purge_expired
from pipeline import answer_question
from config import check_ollama_available, TIER_MODELS
from cache import _get_conn
from fastapi import HTTPException
from chat_history import save_message, get_conversation, list_conversations, delete_conversation, purge_old_chats, new_conversation_id

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
    
@app.on_event("startup")
async def startup_check():
    check_ollama_available()
    purged_cache = purge_expired()
    purged_chats = purge_old_chats()
    if purged_cache:
        print(f"Purged {purged_cache} expired cache entries.")
    if purged_chats:
        print(f"Purged {purged_chats} chat messages older than 30 days.")


class QueryRequest(BaseModel):
    question: str
    model_tier: str | None = None
    conversation_id: str | None = None


class Source(BaseModel):
    title: str
    url: str
    published_date: str | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]
    keywords_used: str | None = None


@app.post("/chat", response_model=QueryResponse)
async def chat(req: QueryRequest):
    tier = req.model_tier if req.model_tier in TIER_MODELS else None
    conv_id = req.conversation_id or new_conversation_id()

    try:
        result = await answer_question(req.question, model_override=tier)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

    save_message(conv_id, req.question, result["answer"], result["sources"], result["keywords_used"])
    result["conversation_id"] = conv_id
    return result


@app.post("/clear-cache")
async def clear_cache():
    conn = _get_conn()
    cursor = conn.execute("DELETE FROM search_cache")
    conn.commit()
    conn.close()
    return {"cleared_entries": cursor.rowcount}


@app.get("/models")
async def list_models():
    return {"available_tiers": list(TIER_MODELS.keys())}

@app.get("/conversations")
async def get_conversations():
    return list_conversations()

@app.get("/conversations/{conversation_id}")
async def get_conversation_messages(conversation_id: str):
    return get_conversation(conversation_id)

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.delete("/conversations/{conversation_id}")
async def delete_conversation_route(conversation_id: str):
    deleted = delete_conversation(conversation_id)
    return {"deleted_messages": deleted}