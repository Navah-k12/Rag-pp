# StudyRAG

Aplicacion de estudio asistida por IA que utiliza RAG (Retrieval-Augmented Generation) para responder preguntas sobre documentos PDF, PowerPoint e imagenes.

## Componentes

| Servicio | Tecnologia | Puerto |
|----------|------------|--------|
| **rag-service** | Python / FastAPI | 8000 |
| **backend** | ASP.NET Core / C# | 5194 |
| **frontend** | React / Vite / Tailwind CSS | 5173 |

---

## Inicio Rapido

### Windows (PowerShell)

```powershell
# ---- rag-service ----
cd rag-service

# Crear venv (solo la primera vez)
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Iniciar rag-service
uvicorn app.main:app --reload --port 8000
```

```powershell
# ---- backend (en otra terminal) ----
cd backend\src

# Restaurar paquetes (solo la primera vez)
dotnet restore

# Iniciar backend
dotnet run
```

```powershell
# ---- frontend (en otra terminal) ----
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar frontend
npm run dev
```

### macOS / Linux (bash/zsh)

```bash
# ---- rag-service ----
cd rag-service

# Crear venv (solo la primera vez)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Iniciar rag-service
uvicorn app.main:app --reload --port 8000
```

```bash
# ---- backend (en otra terminal) ----
cd backend/src

# Restaurar paquetes (solo la primera vez)
dotnet restore

# Iniciar backend
dotnet run
```

```bash
# ---- frontend (en otra terminal) ----
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar frontend
npm run dev
```

### Todos los servicios a la vez (Fish shell)

```bash
# Solo disponible en Fish shell
./start.fish
```

---

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| rag-service (API RAG) | http://localhost:8000 |
| Backend (Auth API) | http://localhost:5194 |
| Documentacion RAG | http://localhost:8000/docs |

---

## Modelos de IA

El servicio RAG soporta los siguientes modelos:

- **Gemini 2.0 Flash** (Google) — incluye soporte de imagenes/OCR
- **LLaMA 3.3 70B** (Groq) — solo texto, mas rapido

## Documentacion

Consulta la carpeta [`docs/`](docs/) para documentos de arquitectura y guias de uso.

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para instrucciones de desarrollo.
