from dotenv import load_dotenv
from tavily import TavilyClient
import os

from cache import get_cached, set_cached

load_dotenv()

_api_key = os.getenv("TAVILY_API_KEY")
if not _api_key:
    raise RuntimeError(
        "TAVILY_API_KEY not found. Make sure backend/.env exists and contains "
        "TAVILY_API_KEY=your_key_here"
    )

client = TavilyClient(api_key=_api_key)


def search_web(
    query: str,
    max_results: int = 5,
    search_depth: str = "basic",
    topic: str = "news",
) -> list[dict]:
    cache_key = f"{query.lower().strip()}|{max_results}|{search_depth}|{topic}"

    cached = get_cached(cache_key)
    if cached is not None:
        print(f"[CACHE HIT] {cache_key}")
        return cached
    print(f"[CACHE MISS] {cache_key}")

    try:
        response = client.search(
            query=query,
            search_depth=search_depth,
            max_results=max_results,
            topic=topic,
            include_answer=False,
        )
    except Exception as e:
        print(f"Tavily search failed for query '{query}': {e}")
        return []

    results = []
    for r in response.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "text": r.get("content", ""),
            "published_date": r.get("published_date"),
        })

    set_cached(cache_key, results)
    return results


if __name__ == "__main__":
    import sys

    query = " ".join(sys.argv[1:]) or "who won the last F1 grand prix"
    print(f"Query: {query}\n")

    results = search_web(query)
    if not results:
        print("No results returned.")
    for r in results:
        print(f"\n{r['title']}\n{r['url']}")
        print(f"Published: {r['published_date']}")
        print(f"{r['text'][:200]}...")