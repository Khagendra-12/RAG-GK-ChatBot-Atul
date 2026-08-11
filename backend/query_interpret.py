
from openai import OpenAI
from config import OLLAMA_BASE_URL, OLLAMA_MODEL

client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

INTERPRET_SYSTEM_PROMPT = """You prepare a user's question for a web search.

If the question is clear enough to search for, respond with:
KEYWORDS: <timeframe> <subject> <attribute>

Where:
- <timeframe> = any recency word from the question (last, latest, current, this season, today, now) -- include only if present, otherwise omit
- <subject> = the main entity or topic the question is about
- <attribute> = what is being asked about the subject (winner, status, CEO, result, etc.)

If the question doesn't give enough detail to identify a clear subject, respond with:
CLARIFY: <a short question asking the user to specify what's missing>

- Treat words like "Last" with ambiguity, if the user asks about an ongoing series of events, last means latest. But if they refer to a single event, last means most recent.

Examples:
"who won the last f1 grand prix" -> KEYWORDS: f1 grand prix winner from the last race
"what is the current status of the trade deal" -> KEYWORDS: current trade deal status
"who is the CEO of Reliance" -> KEYWORDS: Reliance CEO
"what is going on with letterboxd takeover" -> KEYWORDS: letterboxd takeover
"who will win the election" -> CLARIFY: Which election are you asking about?
"what's the score" -> CLARIFY: Which game or match?"""


def interpret_query(question: str) -> dict:
    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": INTERPRET_SYSTEM_PROMPT},
                {"role": "user", "content": question},
            ],
            temperature=0.0,
            max_tokens=40,
        )
        raw = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[query interpretation failed, defaulting to raw question: {e}]")
        return {"type": "search", "keywords": question}

    if raw.upper().startswith("CLARIFY:"):
        return {"type": "clarify", "message": raw.split(":", 1)[1].strip()}
    elif raw.upper().startswith("KEYWORDS:"):
        return {"type": "search", "keywords": raw.split(":", 1)[1].strip()}
    return {"type": "search", "keywords": question}