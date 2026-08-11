import sqlite3
import json
import time
from pathlib import Path

DB_PATH = Path(__file__).parent / "search_cache.db"
TTL_SECONDS = 1800

def purge_expired(max_age_seconds: int = 86500) -> int:
    conn = _get_conn()
    cutoff = time.time() - max_age_seconds
    cursor = conn.execute("DELETE FROM search_cache WHERE timestamp < ?", (cutoff,))
    conn.commit()
    conn.close()
    return cursor.rowcount

def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS search_cache (
            query_key TEXT PRIMARY KEY,
            results_json TEXT NOT NULL,
            timestamp REAL NOT NULL
        )
    """)
    return conn


def get_cached(query_key: str) -> list[dict] | None:
    conn = _get_conn()
    row = conn.execute(
        "SELECT results_json, timestamp FROM search_cache WHERE query_key = ?", (query_key,)
    ).fetchone()
    conn.close()

    if row is None:
        print(f"[CACHE] no row exists for key: {query_key}")
        return None

    results_json, timestamp = row
    age = time.time() - timestamp
    if age > TTL_SECONDS:
        print(f"[CACHE] row found but expired -- age={age:.0f}s, TTL={TTL_SECONDS}s")
        return None

    print(f"[CACHE] hit -- age={age:.0f}s")
    return json.loads(results_json)


def set_cached(query_key: str, results: list[dict]) -> None:
    conn = _get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO search_cache (query_key, results_json, timestamp) VALUES (?, ?, ?)",
        (query_key, json.dumps(results), time.time()),
    )
    conn.commit()
    conn.close()