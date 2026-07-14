import json
import os

from fastapi import HTTPException

from app.core.config import TEXT_PATH, META_PATH


def load_text() -> str:
    if not os.path.exists(TEXT_PATH):
        raise HTTPException(status_code=400, detail="Primero sube un documento con POST /upload")
    with open(TEXT_PATH, "r", encoding="utf-8") as f:
        return f.read()


def load_metadata() -> dict:
    if os.path.exists(META_PATH):
        with open(META_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_metadata(filename: str, filetype: str) -> None:
    meta = {"filename": filename, "filetype": filetype}
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f)
