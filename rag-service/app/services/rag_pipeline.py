from fastapi import HTTPException
from google import genai
from groq import Groq

from app.core.config import GEMINI_API_KEY, GROQ_API_KEY

gemini_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "tu_api_key_aqui":
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    print("⚠️ GEMINI_API_KEY no configurada.")

groq_client = Groq(api_key=GROQ_API_KEY)


def generate(prompt: str, *, image=None, model: str = "gemini-2.0-flash") -> str:
    if model.startswith("gemini"):
        if not gemini_client:
            raise HTTPException(
                status_code=500,
                detail="Gemini no disponible. Configura GEMINI_API_KEY.",
            )
        try:
            if image:
                resp = gemini_client.models.generate_content(
                    model=model, contents=[image, prompt]
                )
            else:
                resp = gemini_client.models.generate_content(
                    model=model, contents=prompt
                )
            return resp.text
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error con Gemini: {e}")

    if model.startswith(("llama", "mixtral", "gemma")):
        if image:
            raise HTTPException(
                status_code=500,
                detail="Groq no soporta imágenes. Usa un modelo Gemini.",
            )
        resp = groq_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4096,
        )
        return resp.choices[0].message.content

    raise HTTPException(status_code=400, detail=f"Modelo no soportado: {model}")
