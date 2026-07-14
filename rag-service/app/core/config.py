import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
CHUNKS_DIR = STORAGE_DIR / "chunks"
META_DIR = STORAGE_DIR / "metadata"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
META_DIR.mkdir(parents=True, exist_ok=True)

TEXT_PATH = UPLOAD_DIR / "documento_transcrito.txt"
META_PATH = META_DIR / "metadata.json"
CHUNKS_PATH = CHUNKS_DIR / "chunks.json"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff"}
DOC_EXTS = {".pdf", ".pptx", ".txt"}
ALLOWED_EXTS = IMAGE_EXTS | DOC_EXTS

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

AVAILABLE_MODELS = {
    "gemini-2.0-flash": {"name": "Gemini 2.0 Flash", "provider": "Google"},
    "llama-3.3-70b-versatile": {"name": "LLaMA 3.3 70B", "provider": "Groq"},
}
