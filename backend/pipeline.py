import asyncio
import traceback
from search import search_web
from llm import generate_answer
from retrieval import rerank_sources
from query_interpret import interpret_query
from config import check_ollama_available


async def search_web_async(query, max_results=5):
    return await asyncio.to_thread(search_web, query, max_results)


async def answer_question(question: str, model_override: str | None = None) -> dict:
    try:
        interpretation = interpret_query(question)
    except Exception as e:
        print(f"\n[STAGE FAILED: interpret_query] {repr(e)}")
        traceback.print_exc()
        raise

    if interpretation["type"] == "clarify":
        return {"answer": interpretation["message"], "sources": [], "keywords_used": None}

    keywords = interpretation["keywords"]

    try:
        tasks = [search_web_async(question)]
        if keywords != question:
            tasks.append(search_web_async(keywords))
        results = await asyncio.gather(*tasks)
    except Exception as e:
        print(f"\n[STAGE FAILED: search] {repr(e)}")
        traceback.print_exc()
        raise

    sources = merge_sources(*results)

    try:
        reranked_sources = rerank_sources(question, sources)
        print(f"\n[SENDING {len(reranked_sources)} SOURCES TO MODEL, IN THIS ORDER]")
        for i, s in enumerate(reranked_sources, 1):
            print(f"  {i}. {s['title']}")
    except Exception as e:
        print(f"\n[STAGE FAILED: rerank] {repr(e)}")
        traceback.print_exc()
        raise

    try:
        answer = generate_answer(question, reranked_sources, model_override=model_override)
    except Exception as e:
        print(f"\n[STAGE FAILED: generate] {repr(e)}")
        traceback.print_exc()
        raise

    return {"answer": answer, "sources": reranked_sources, "keywords_used": keywords}


def merge_sources(*result_lists, max_total=6):
    seen_urls = set()
    merged = []
    for results in result_lists:
        for r in results:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                merged.append(r)
    return merged[:max_total]


if __name__ == "__main__":
    import sys
    check_ollama_available()
    question = " ".join(sys.argv[1:]) or "Latest AI updates"
    result = asyncio.run(answer_question(question))

    print(f"\nQ: {question}")
    if result["keywords_used"]:
        print(f"Keywords extracted: {result['keywords_used']}")
    print(f"\nA: {result['answer']}\n")

    if result["sources"]:
        print("Sources:")
        for i, s in enumerate(result["sources"], 1):
            print(f"  [{i}] {s['title']} — {s['url']}")