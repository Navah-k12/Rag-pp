# StudyRAG

Aplicación de estudio asistida por IA que utiliza RAG (Retrieval-Augmented Generation) para responder preguntas sobre documentos PDF, PowerPoint e imágenes.

## Componentes

| Servicio | Tecnología | Puerto |
|----------|------------|--------|
| **rag-service** | Python / FastAPI | 8000 |
| **frontend** | React / Vite / Tailwind CSS | 5173 |
| **backend** | ASP.NET Core | _(por definir)_ |

## Inicio Rápido

### rag-service

```bash
cd rag-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Modelos de IA

El servicio RAG soporta los siguientes modelos:

- **Gemini 2.0 Flash** (Google) — incluye soporte de imágenes/OCR
- **LLaMA 3.3 70B** (Groq) — solo texto, más rápido

## Documentación

Consulta la carpeta [`docs/`](docs/) para documentos de arquitectura y guías de uso.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para instrucciones de desarrollo.
