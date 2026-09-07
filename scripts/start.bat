@echo off
echo Starting RAG GK Chatbot...
echo.

where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Ollama is not installed or not on PATH.
    echo Download it from https://ollama.com and try again.
    pause
    exit /b 1
)

echo Checking Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>nul
if %errorlevel% neq 0 (
    echo Starting Ollama...
    start "" ollama serve
    timeout /t 3 /nobreak >nul
)

echo Checking required models are pulled...
ollama list | findstr "llama3.2:3b" >nul
if %errorlevel% neq 0 (
    echo Pulling llama3.2:3b, this may take a few minutes...
    ollama pull llama3.2:3b
)
ollama list | findstr "qwen2.5:1.5b-instruct" >nul
if %errorlevel% neq 0 (
    echo Pulling qwen2.5:1.5b-instruct, this may take a few minutes...
    ollama pull qwen2.5:1.5b-instruct
)

if not exist "backend\.env" (
    echo.
    echo WARNING: backend\.env not found.
    echo Copy backend\.env.example to backend\.env and add your Tavily API key.
    pause
    exit /b 1
)

echo Starting backend...
start "Backend" cmd /k ".ragenv\Scripts\activate && cd backend && uvicorn main:app --port 8000"

timeout /t 4 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo All set. Two terminal windows are running the backend and frontend.
echo Close both windows to stop the app.
pause