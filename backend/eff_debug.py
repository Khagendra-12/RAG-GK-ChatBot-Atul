import asyncio
import time
import sys

from retrieval import rerank_sources
from llm import generate_answer
from query_interpret import interpret_query
from pipeline import search_web_async, merge_sources


async def timed_run(question: str, model_override=None):
    timings = {}

    t0 = time.perf_counter()
    interpretation = interpret_query(question)
    timings["interpret"] = time.perf_counter() - t0

    if interpretation["type"] == "clarify":
        print(f"Clarify: {interpretation['message']}")
        return

    keywords = interpretation["keywords"]

    t0 = time.perf_counter()
    tasks = [search_web_async(question)]
    if keywords != question:
        tasks.append(search_web_async(keywords))
    results = await asyncio.gather(*tasks)
    timings["search"] = time.perf_counter() - t0

    sources = merge_sources(*results)

    t0 = time.perf_counter()
    reranked = rerank_sources(question, sources)
    timings["rerank"] = time.perf_counter() - t0

    t0 = time.perf_counter()
    answer = generate_answer(question, reranked, model_override=model_override)
    timings["generate"] = time.perf_counter() - t0

    total = sum(timings.values())

    print(f"\nQ: {question}")
    print(f"Keywords: {keywords}\n")
    print("--- TIMING BREAKDOWN ---")
    for stage, t in timings.items():
        pct = (t / total * 100) if total else 0
        print(f"  {stage:10s}: {t:6.2f}s  ({pct:5.1f}%)")
    print(f"  {'TOTAL':10s}: {total:6.2f}s")
    print(f"\nA: {answer}")


if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "who won the latest f1 race"
    asyncio.run(timed_run(question))