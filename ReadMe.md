# RAG General Knowledge Chatbot

A locally-run chatbot that answers general knowledge questions about **news, politics, stocks, laws, and current events** using live web search with cited sources.

Runs entirely on your own machine — **no cloud deployment and no paid APIs required**.

---

## What You Need Before Starting

Before setting up the project, install the following:

1. **Python 3.11+** — [python.org](https://www.python.org/)
2. **Node.js (LTS)** — [nodejs.org](https://nodejs.org/)
3. **Ollama** — [ollama.com](https://ollama.com/)
   Ollama runs the AI models locally on your machine.
4. **A free Tavily API key** — [tavily.com](https://tavily.com/)
   No credit card required.

---

# Setup

## 1. Install Ollama Models

Open a terminal and run:

```bash
ollama pull llama3.2:3b
ollama pull qwen2.5:1.5b-instruct
```

This downloads the AI models to your machine.

The models only need to be downloaded **once**.

---

## 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .ragenv
```

Activate it:

### Windows

```bash
.ragenv\Scripts\activate
```

### Mac/Linux

```bash
source .ragenv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. Add Your Tavily API Key

Copy:

```text
backend/.env.example
```

and create a new file named:

```text
backend/.env
```

Add your Tavily API key:

```env
TAVILY_API_KEY=your_actual_key_here
MODEL_TIER=standard
```

---

## 4. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

---

# Running the App

## Easiest Method

From the project root, run:

### Windows

```bash
scripts\start.bat
```

### Mac/Linux

```bash
bash scripts/start.sh
```

This starts the backend and frontend and opens the application in your browser.

---

## Manual Method

If the startup script does not work, open **two terminals**.

### Terminal 1 — Backend

```bash
cd backend
```

Activate the virtual environment:

### Windows

```bash
.ragenv\Scripts\activate
```

### Mac/Linux

```bash
source .ragenv/bin/activate
```

Then start the backend:

```bash
uvicorn main:app --port 8000
```

---

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

in your browser.

---

# Model Tiers

The application provides two locally-running model tiers that can be switched from the top bar.

## Lite

**Model:** Qwen2.5 1.5B

* Faster responses
* Lower hardware requirements
* Suitable for quick and simple questions

## Standard

**Model:** Llama 3.2 3B

* Better answer quality
* More accurate responses
* Recommended as the default option

For the research and evaluation behind this model selection, see:

```text
docs/model_selection.md
```

---

# Troubleshooting

## "Can't reach Ollama"

Make sure the Ollama application is running.

Check your system tray, or start Ollama manually:

```bash
ollama serve
```

---

## Backend Won't Start

Check that:

* `backend/.env` exists
* Your Tavily API key is valid
* The virtual environment is activated
* All dependencies have been installed

You can reinstall dependencies with:

```bash
pip install -r requirements.txt
```

---

## Frontend Shows a Connection Error

Make sure the backend is running correctly.

The backend terminal should show Uvicorn running on:

```text
http://0.0.0.0:8000
```

Also check that there are no errors in the backend terminal.

---

# Features

* Live web search for current information
* Source-backed answers with citations
* Local AI model inference using Ollama
* Support for general knowledge and current events
* Questions about news, politics, stocks, laws, and more
* Multiple model tiers for different hardware capabilities
* No paid AI APIs required
* Fully local frontend and backend execution

---

## Project Structure

```text
RAG-GK-ChatBot/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
│
├── frontend/
│   ├── package.json
│   └── ...
│
├── scripts/
│   ├── start.bat
│   └── start.sh
│
├── docs/
│   └── model_selection.md
│
└── README.md
```

---

## License

This project is intended for educational and research purposes.
