import sqlite3
import sys

conn = sqlite3.connect("search_cache.db")

if len(sys.argv) > 1:
    keyword = sys.argv[1]
    cursor = conn.execute("DELETE FROM search_cache WHERE query_key LIKE ?", (f"%{keyword}%",))
    print(f"Cleared {cursor.rowcount} entries matching '{keyword}'")
else:
    cursor = conn.execute("DELETE FROM search_cache")
    print(f"Cleared all {cursor.rowcount} entries")

conn.commit()
conn.close()