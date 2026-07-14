import json
import os

from fastapi import HTTPException

from app.core.config import TEXT_PATH, CHUNKS_PATH
from app.services.rag_pipeline import gemini_client
from app.services.chunking import extract_text, chunk_text
from app.services.storage import save_metadata


def process_document(filepath: str, filename: str) -> dict:
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Ninguna API key configurada.")

    ext = os.path.splitext(filename)[1].lower()
    print(f"📄 Procesando {filename}...")

    try:
        text = extract_text(filepath, ext)
        if not text.strip():
            raise ValueError("No se pudo extraer texto del documento.")

        chunks = chunk_text(text)

        with open(TEXT_PATH, "w", encoding="utf-8") as f:
            f.write(text)
        with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
            json.dump(chunks, f)
        save_metadata(filename, ext)

        print(f"✅ Documento procesado: {len(chunks)} chunks, {len(text)} caracteres")
        return {
            "message": "Documento procesado con éxito",
            "chunks": len(chunks),
            "chars": len(text),
        }
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
