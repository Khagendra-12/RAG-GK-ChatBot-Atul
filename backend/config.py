import os
from dotenv import load_dotenv

load_dotenv()

MODEL_TIER = os.getenv("MODEL_TIER", "standard")

TIER_MODELS = {
    "lite": "qwen2.5:1.5b-instruct",
    "standard": "llama3.2:3b"
}

if MODEL_TIER not in TIER_MODELS:
    raise ValueError(f"Unknown MODEL_TIER '{MODEL_TIER}'. Must be one of: {list(TIER_MODELS.keys())}")

OLLAMA_MODEL = TIER_MODELS[MODEL_TIER]
OLLAMA_BASE_URL = "http://localhost:11434/v1"


import requests

def check_ollama_available():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL.replace('/v1', '')}/api/tags", timeout=3)
        response.raise_for_status()
        available_models = [m["name"] for m in response.json().get("models", [])]
        if OLLAMA_MODEL not in available_models:
            raise RuntimeError(
                f"Ollama is running, but model '{OLLAMA_MODEL}' isn't pulled. "
                f"Run: ollama pull {OLLAMA_MODEL}"
            )
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            "Can't reach Ollama at localhost:11434. Is it running? "
            "Start it via the Ollama app, or run: ollama serve"
        )