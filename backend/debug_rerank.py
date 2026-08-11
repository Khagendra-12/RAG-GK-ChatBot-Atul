from search import search_web
from retrieval import rerank_sources

question = "Who won the last F1 grand prix?"
sources = search_web("latest f1 grand prix winner")

print(f"--- {len(sources)} raw sources ---")
for s in sources:
    print(f"{s['title']}\n{s['text'][:150]}...\n")

reranked = rerank_sources(question, sources)

print(f"\n--- {len(reranked)} reranked sources (what the LLM actually sees) ---")
for s in reranked:
    print(f"{s['title']}\n{s['text']}\n")