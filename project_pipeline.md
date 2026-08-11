# RAG General-Knowledge Chatbot — Project Pipeline Reference

**Constraints locked in with supervisor:**
- No paid APIs
- No cloud deployment — must run on-premise, locally
- No provided compute/GPU — dev/research on Colab/Kaggle, final system runs CPU-only
- Model size/choice is open, expected to be research-justified
- Timeline: 2 months

**Core architecture:**
```
User → React frontend (localhost) → FastAPI backend (localhost)
                                          ├── Tavily (web search, live sources)
                                          ├── sentence-transformers (local embeddings)
                                          ├── ChromaDB (local, in-query reranking)
                                          └── Ollama (local LLM, tiered model config)
```

---

## Phase 0 — Environment setup (2-3 days)

- [ ] Install Python 3.11+, Node.js, Git
- [ ] Install Ollama locally (ollama.com), confirm `ollama run llama3.2:3b` works and responds
- [ ] Create GitHub repo with folders: `backend/`, `frontend/`, `notebooks/`, `docs/`
- [ ] Set up Colab/Kaggle account, confirm free GPU runtime works
- [ ] Create HuggingFace account + token (needed for gated models like Llama)
- [ ] Sign up for Tavily, get free API key, confirm a test call works
- [ ] Set up a `.env` file convention (never commit API keys — add to `.gitignore`)

**Deliverable:** working local Ollama install, working Tavily key, empty repo scaffolded.

---

## Phase 1 — Model research & benchmarking (Week 1-2)

- [ ] Run the Colab benchmark notebook across candidate models (Llama 3.2 1B/3B, Qwen2.5 3B, Phi-3.5-mini)
- [ ] Score each on grounding, citation accuracy, conflict handling, insufficient-info handling (see rubric in notebook)
- [ ] Pull GGUF Q4 versions of the top 1-2 candidates into Ollama, re-benchmark tok/s on your actual laptop CPU
- [ ] Decide on tiered model config: `lite` (1B, guaranteed to run anywhere), `standard` (3B, your default), optionally `pro` (7-8B, opt-in for stronger hardware)
- [ ] Write up findings in `docs/model_selection.md` — this is your evidence for the supervisor's "research to be done" ask

**Deliverable:** documented model choice with benchmark data, `docs/model_selection.md`, Ollama running your chosen default model locally.

---

## Phase 2 — Core pipeline skeleton (Week 2-3)

- [ ] `backend/search.py`: Tavily wrapper — given a query string, return list of `{title, url, text, published_date}`
- [ ] `backend/llm.py`: Ollama client wrapper (Ollama exposes an OpenAI-compatible endpoint at `localhost:11434/v1`, so this is a near drop-in replacement for what a cloud client would look like)
- [ ] `backend/pipeline.py`: wire together query → search → build context → generate answer, no reranking yet, no UI — just a CLI/script you can run and read output from
- [ ] Get one full end-to-end answer with citations working before anything else

**Deliverable:** a script you can run from terminal — `python run_query.py "who won the election"` — that prints a cited, source-grounded answer.

---

## Phase 3 — Retrieval quality (Week 3-4)

- [ ] `backend/retrieval.py`: chunk retrieved page text (e.g. ~300-500 tokens per chunk, with overlap)
- [ ] Embed chunks + query using `sentence-transformers` (`all-MiniLM-L6-v2`), rank by cosine similarity, keep top ~6
- [ ] Add query reformulation step: one LLM call turns the user's question into 2-3 targeted search queries, run concurrently via `asyncio.gather`
- [ ] Add a simple cache (SQLite or in-memory dict, keyed on normalized query, short TTL) to protect your Tavily quota
- [ ] Test against tricky cases: ambiguous questions, questions needing multiple sources, questions with no good online answer

**Deliverable:** pipeline now handles multi-query search, reranking, and caching — noticeably better answer quality than Phase 2's naive version.

---

## Phase 4 — Local model integration & config (Week 4)

- [ ] Implement `config.py` with the `MODEL_TIER` env var pattern from the plan above
- [ ] Confirm all tiers actually run on your machine (at least `lite` and `standard`)
- [ ] Add a startup health-check: on backend boot, verify Ollama is running and the configured model is pulled; give a clear error message if not
- [ ] Write `docs/model_requirements.md` — a RAM/tier table for the README

**Deliverable:** backend cleanly swaps model tier via one env var, with helpful errors if Ollama/model isn't available.

---

## Phase 5 — Frontend build (Week 5-6)

- [ ] Design the chat UI in v0/Claude — prompt it with your exact API contract (`QueryRequest`/`QueryResponse` schema, SSE stream shape from earlier)
- [ ] Polish with reactbits.dev components — loading states, source cards, animated citations
- [ ] Wire the FastAPI `/chat` streaming endpoint into the frontend (sources arrive first, then streamed tokens)
- [ ] Add a "searching the web..." state while search/retrieval runs, before generation starts
- [ ] Add clickable [n] citation markers that scroll to/highlight the matching source card

**Deliverable:** working chat UI, running against your local backend, streaming answers with visible sources.

---

## Phase 6 — Integration pass (Week 6)

- [ ] Full end-to-end test: type a question in the UI, confirm search → retrieval → generation → streamed cited answer all work together
- [ ] Test the conflicting-sources and insufficient-info cases through the actual UI, not just the notebook
- [ ] Handle error states in the UI: Tavily quota exceeded, Ollama not running, no results found
- [ ] Basic conversation history (optional, nice-to-have if time allows)

**Deliverable:** a demo-able, working chatbot end to end.

---

## Phase 7 — Deployment packaging (Week 7)

- [ ] Write a startup script (`start.bat` for Windows, `start.sh` for Mac/Linux) that: starts `ollama serve`, starts the FastAPI backend (serving the built frontend), opens the browser to `localhost`
- [ ] Write a clear `README.md`: setup steps, model tier table, how to run, screenshots
- [ ] *(Optional stretch goal, only if time allows)*: Docker Compose setup for one-command startup
- [ ] Test the whole setup on a fresh checkout — pretend you're someone else cloning the repo for the first time

**Deliverable:** anyone can clone your repo, follow the README, and have the chatbot running locally within a few minutes.

---

## Phase 8 — Testing, eval, and demo prep (Week 8)

- [ ] Build a small eval set (15-20 GK questions spanning stocks/politics/laws/wars/general facts) with manual correctness/grounding checks
- [ ] Document known limitations honestly (e.g. small model reasoning limits, search quota limits, latency on low-end CPUs)
- [ ] Prepare a short demo script/walkthrough for your supervisor
- [ ] Final write-up: architecture summary, model research findings, constraints and how you addressed each one (this maps directly back to their 3 original answers — good structure for a report)

**Deliverable:** submission-ready project, eval results, final report.

---

## Things to keep flagging with your supervisor as you go

- Confirm Tavily/live-search cloud calls are acceptable under "no cloud" (likely yes, since it's the literal point of the project, but get it in writing/chat)
- Once you have a working demo, check whether an actual on-premise server will eventually be provided, or whether "runs on any machine locally" is the permanent target
