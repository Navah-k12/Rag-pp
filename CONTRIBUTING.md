# Contribuir a StudyRAG

Gracias por tu interés en contribuir a StudyRAG.

## Estructura del Proyecto

```
RAG-PP/
├── backend/          → ASP.NET Core (futuro)
├── rag-service/      → Python/FastAPI + LangChain (servicio RAG)
├── frontend/         → React + Vite + Tailwind CSS
├── docs/             → Documentación del proyecto
└── uploads/          → Datos de procesamiento (gitignored)
```

## Guías de Contribución

1. Crea una rama para tu feature (`git checkout -b feature/nombre`)
2. Haz commits descriptivos
3. Abre un Pull Request con una descripción clara de los cambios

## Desarrollo

### rag-service (Backend Python)

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

## Estilo de Código

- Python: sigue PEP 8
- JavaScript/JSX: usa el linter del proyecto (oxlint)
