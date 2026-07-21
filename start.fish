#!/usr/bin/env fish

echo "=== Iniciando StudyRAG ==="

# rag-service
echo "[1/3] Iniciando rag-service (puerto 8000)..."
cd ~/Documentos/Rag-pp/rag-service
source venv/bin/activate.fish
uvicorn app.main:app --reload --port 8000 &
set RAG_PID $!

# backend
echo "[2/3] Iniciando backend (puerto 5194)..."
cd ~/Documentos/Rag-pp/backend/src
dotnet run &
set BACK_PID $!

# frontend
echo "[3/3] Iniciando frontend..."
cd ~/Documentos/Rag-pp/frontend
npm run dev &
set FRONT_PID $!

echo ""
echo "=== Todos los servicios arrancados ==="
echo "  rag-service: http://localhost:8000"
echo "  backend:     http://localhost:5194"
echo "  frontend:    http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener todos"
echo ""

wait $RAG_PID $BACK_PID $FRONT_PID
