from sentence_transformers import SentenceTransformer, util
import re

_model = SentenceTransformer("all-MiniLM-L6-v2")


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(words):
        chunks.append(" ".join(words[start:start + chunk_size]))
        start += chunk_size - overlap
    return chunks


def source_recency_bonus(text: str, max_range: int = 5) -> float:
    """Small positive bonus for sources that look like a single recent
    event, not a full override -- relevance stays the primary signal."""
    years = [int(y) for y in re.findall(r"\b(?:19|20)\d{2}\b", text)]
    if not years:
        return 0.0
    year_range = max(years) - min(years)
    return 0.08 if year_range <= max_range else 0.0  # small nudge, not a re-sort


def rerank_sources(question: str, sources: list[dict], top_k_chunks: int = 8) -> list[dict]:
    if not sources:
        return []

    all_chunks, chunk_source_map = [], []
    for i, source in enumerate(sources):
        for chunk in chunk_text(source["text"]):
            all_chunks.append(chunk)
            chunk_source_map.append(i)

    if not all_chunks:
        return sources

    question_emb = _model.encode(question, convert_to_tensor=True)
    chunk_embs = _model.encode(all_chunks, convert_to_tensor=True)
    scores = util.cos_sim(question_emb, chunk_embs)[0]

    top_k = min(top_k_chunks, len(all_chunks))
    ranked_indices = scores.argsort(descending=True).tolist()[:top_k]  # relevance order preserved

    # track each source's best relevance score and its selected chunks, in relevance order
    source_best_score = {}
    source_chunks = {}
    for idx in ranked_indices:  # NOT sorted() -- keep relevance order intact
        src_idx = chunk_source_map[idx]
        score = scores[idx].item()
        source_best_score[src_idx] = max(source_best_score.get(src_idx, 0), score)
        source_chunks.setdefault(src_idx, []).append(all_chunks[idx])

    reranked = []
    for src_idx, chunks in source_chunks.items():
        source = sources[src_idx]
        combined_score = source_best_score[src_idx] + source_recency_bonus(source["text"])
        reranked.append({
            "title": source["title"],
            "url": source["url"],
            "published_date": source.get("published_date"),
            "text": " [...] ".join(chunks),
            "_score": combined_score,  # temporary, stripped before returning
        })

    reranked.sort(key=lambda s: s["_score"], reverse=True)
    for s in reranked:
        del s["_score"]
    return reranked