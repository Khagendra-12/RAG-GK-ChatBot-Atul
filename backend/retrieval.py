import re
from datetime import datetime
from sentence_transformers import SentenceTransformer, util

_model = SentenceTransformer("all-MiniLM-L6-v2")

def chunk_text(text: str, chunk_size: int = 250, overlap: int = 25) -> list[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(words):
        chunks.append(" ".join(words[start:start + chunk_size]))
        start += chunk_size - overlap
    return chunks

def source_recency_bonus(source: dict) -> float:
    """Boost sources that are recently published to fix LLM recency bias issues."""
    pub_date = source.get("published_date") or ""
    text = source.get("text", "")
    
    current_year = datetime.now().year
    last_year = current_year - 1
    
    # Massive boost for current year to ensure it overrides older highly-relevant texts
    if str(current_year) in pub_date:
        return 0.6
    if str(last_year) in pub_date:
        return 0.3
        
    # Fallback to year detection in text
    years = [int(y) for y in re.findall(r"\b(?:20)\d{2}\b", text)]
    if years:
        max_year = max(years)
        if max_year >= current_year:
            return 0.4
        elif max_year == last_year:
            return 0.2
            
    return 0.0

def rerank_sources(question: str, sources: list[dict], top_k_chunks: int = 5) -> list[dict]:
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
    ranked_indices = scores.argsort(descending=True).tolist()[:top_k]
    
    source_best_score = {}
    source_chunks = {}
    for idx in ranked_indices:
        src_idx = chunk_source_map[idx]
        score = scores[idx].item()
        source_best_score[src_idx] = max(source_best_score.get(src_idx, 0), score)
        source_chunks.setdefault(src_idx, []).append(all_chunks[idx])
    
    reranked = []
    for src_idx, chunks in source_chunks.items():
        source = sources[src_idx]
        combined_score = source_best_score[src_idx] + source_recency_bonus(source)
        reranked.append({
            "title": source["title"],
            "url": source["url"],
            "published_date": source.get("published_date"),
            "text": " [...] ".join(chunks),
            "_score": combined_score,
        })
    reranked.sort(key=lambda s: s["_score"], reverse=True)
    for s in reranked:
        del s["_score"]
    return reranked