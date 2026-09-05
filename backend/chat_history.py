import sqlite3
import json
import time
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "chat_history.db"
MAX_AGE_SECONDS = 30 * 24 * 60 * 60  # 30 days


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    
    # Create table with current schema
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            sources_json TEXT NOT NULL,
            keywords_used TEXT,
            timestamp REAL NOT NULL
        )
    """)
    
    columns = [row[1] for row in conn.execute("PRAGMA table_info(chat_history)").fetchall()]
    if "keywords_used" not in columns:
        conn.execute("ALTER TABLE chat_history ADD COLUMN keywords_used TEXT")
        
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_conversation_id
        ON chat_history(conversation_id)
    """)
    return conn


def new_conversation_id() -> str:
    return str(uuid.uuid4())


def save_message(conversation_id: str, question: str, answer: str, sources: list[dict], keywords_used: str | None) -> None:
    conn = _get_conn()
    conn.execute(
        """INSERT INTO chat_history
           (conversation_id, question, answer, sources_json, keywords_used, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (conversation_id, question, answer, json.dumps(sources), keywords_used, time.time()),
    )
    conn.commit()
    conn.close()


def get_conversation(conversation_id: str) -> list[dict]:
    conn = _get_conn()
    rows = conn.execute(
        """SELECT question, answer, sources_json, keywords_used, timestamp
           FROM chat_history WHERE conversation_id = ? ORDER BY timestamp ASC""",
        (conversation_id,),
    ).fetchall()
    conn.close()

    return [
        {
            "question": q,
            "answer": a,
            "sources": json.loads(s),
            "keywords_used": k,
            "timestamp": t,
        }
        for q, a, s, k, t in rows
    ]


def list_conversations() -> list[dict]:
    conn = _get_conn()
    rows = conn.execute("""
        SELECT h.conversation_id, h.question, h.keywords_used, h.timestamp AS first_ts,
               (SELECT MAX(timestamp) FROM chat_history WHERE conversation_id = h.conversation_id) AS last_ts,
               (SELECT COUNT(*) FROM chat_history WHERE conversation_id = h.conversation_id) AS message_count
        FROM chat_history h
        WHERE h.id IN (
            SELECT MIN(id) FROM chat_history GROUP BY conversation_id
        )
        ORDER BY last_ts DESC
    """).fetchall()
    conn.close()

    return [
        {
            "conversation_id": cid,
            "preview": (keywords or question)[:60],
            "last_timestamp": last_ts,
            "message_count": count,
        }
        for cid, question, keywords, first_ts, last_ts, count in rows
    ]


def delete_conversation(conversation_id: str) -> int:
    conn = _get_conn()
    cursor = conn.execute("DELETE FROM chat_history WHERE conversation_id = ?", (conversation_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount


def purge_old_chats(max_age_seconds: int = MAX_AGE_SECONDS) -> int:
    conn = _get_conn()
    cutoff = time.time() - max_age_seconds
    cursor = conn.execute("DELETE FROM chat_history WHERE timestamp < ?", (cutoff,))
    conn.commit()
    conn.close()
    return cursor.rowcount