from openai import OpenAI
from config import TIER_MODELS, OLLAMA_MODEL, OLLAMA_BASE_URL

client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

SYSTEM_PROMPT = """You are a factual research assistant. Answer in detailed concise answers. All answers need to be derived from the provided sources.

Rules:
- The source containg the most recent dates and details gets the highest priority. Prioritze answering from the sources which contain the most recenet dates.
- With the answer give additional information necessary to understand the context.
- Cite every claim with a plain bracketed number. eg [1] or [2][3]. State the source you derieve your answer from and then your answer.
- No reasoning required, don't list rulled out sources, don't list how you got the answer, just give the answer and cite the source(s).
- If sources conflict, say so in one sentence and state which you're relying on and why.
- If sources don't cover the question, say so plainly.
- If sources only partially answer the question, present what's there and note the gap.
- Never combine or calculate across facts to produce an answer not explicitly stated in one source."""

def generate_answer(question: str, sources: list[dict], model_override: str | None = None) -> str:
    model = TIER_MODELS.get(model_override, OLLAMA_MODEL)  # falls back to default if override is invalid/None

    if not sources:
        return "I don't have enough current information to answer this confidently — no search results were found."

    context = build_context(sources)
    user_prompt = f"Sources:\n{context}\n\nQuestion: {question}"

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.0,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"[LLM generation failed: {e}]"

    
def build_context(sources: list[dict]) -> str:
    blocks = []
    for i, s in enumerate(sources, 1):
        date_str = f" ({s['published_date']})" if s.get("published_date") else ""
        blocks.append(f"[{i}] {s['title']}{date_str}\n{s['text']}")
    return "\n\n".join(blocks)

if __name__ == "__main__":
    
    fake_sources = [
        {"title": "Test Source", "url": "http://example.com", "text": "The sky is blue due to Rayleigh scattering.", "published_date": None}
    ]
    print(generate_answer("Why is the sky blue?", fake_sources))