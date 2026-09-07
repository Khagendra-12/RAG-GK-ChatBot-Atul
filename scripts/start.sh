#!/bin/bash
echo "Starting RAG GK Chatbot..."

if ! command -v ollama &> /dev/null; then
    echo "ERROR: Ollama is not installed."
    echo "Download it from https://ollama.com and try again."
    exit 1
fi

echo "Checking Ollama is running..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 3
fi

echo "Checking required models are pulled..."
if ! ollama list | grep -q "llama3.2:3b"; then
    echo "Pulling llama3.2:3b, this may take a few minutes..."
    ollama pull llama3.2:3b
fi
if ! ollama list | grep -q "qwen2.5:1.5b-instruct"; then
    echo "Pulling qwen2.5:1.5b-instruct, this may take a few minutes..."
    ollama pull qwen2.5:1.5b-instruct
fi

if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env not found."
    echo "Copy backend/.env.example to backend/.env and add your Tavily API key."
    exit 1
fi

echo "Starting backend..."
(source .ragenv/bin/activate && cd backend && uvicorn main:app --port 8000) &

sleep 4

echo "Starting frontend..."
(cd frontend && npm run dev) &

sleep 5
open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null

echo "All set. Press Ctrl+C to stop."
wait