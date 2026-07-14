import json
import os
import random
import re
import shutil

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.core.config import UPLOAD_DIR, ALLOWED_EXTS, AVAILABLE_MODELS
from app.models.schemas import (
    HealthResponse, StatusResponse, ModelsResponse, UploadResponse,
    QuestionRequest, FlashcardRequest, QuizRequest, SummarizeRequest,
    QuizCheckRequest, QuizAdvancedRequest, QuizAdvancedCheckRequest,
    AnswerResponse, SummaryResponse, FlashcardsResponse,
    QuizPublicResponse, QuizPublicQuestion,
    QuizCheckResponse, QuizResultItem,
    QuizAdvancedPublicResponse, QuizAdvancedPublicQuestion,
    QuizAdvancedCheckResponse, QuizAdvancedResultItem,
)
from app.services.rag_pipeline import generate, gemini_client
from app.services.storage import load_text, load_metadata
from app.services.document import process_document

router = APIRouter()

MOTIVATIONAL = [
    "Cada error es un paso más cerca del éxito. ¡Sigue intentando!",
    "El conocimiento se construye con práctica. ¡No te detengas!",
    "Los grandes expertos alguna vez fueron principiantes. ¡Tú puedes!",
    "Aprender de los errores es el camino más rápido para dominar un tema.",
    "No importa cuántas veces falles, lo que importa es cuántas veces te levantas.",
    "El esfuerzo de hoy es el éxito de mañana. ¡Continúa!",
    "Cada pregunta que resuelves te hace más fuerte. ¡Sigue así!",
    "El conocimiento es poder, y tú estás acumulando mucho poder hoy.",
]


def _extract_json(text: str):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    text = re.sub(r",\s*([}\]])", r"\1", text)
    text = text.strip()
    return json.loads(text)


@router.get("/", response_model=HealthResponse)
def read_root():
    return HealthResponse(message="Servidor StudyRAG en línea")


@router.get("/status", response_model=StatusResponse)
def get_status():
    api_ready = gemini_client is not None
    transcribed = os.path.exists(UPLOAD_DIR / "documento_transcrito.txt")
    meta = load_metadata()
    preview = ""
    if transcribed:
        with open(UPLOAD_DIR / "documento_transcrito.txt", "r", encoding="utf-8") as f:
            preview = f.read(500)
    return StatusResponse(
        api_key_configured=api_ready,
        groq_configured=True,
        document_transcribed=transcribed,
        document=meta,
        preview=preview if transcribed else "Aún no has subido ningún documento",
    )


@router.get("/models", response_model=ModelsResponse)
def get_models():
    return ModelsResponse(models=AVAILABLE_MODELS, default="gemini-2.0-flash")


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no soportado. Permitidos: {', '.join(ALLOWED_EXTS)}",
        )

    filepath = os.path.join(UPLOAD_DIR, f"upload{ext}")
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = process_document(filepath, file.filename)
    return UploadResponse(**result)


@router.post("/ask", response_model=AnswerResponse)
def ask_question(req: QuestionRequest):
    document_text = load_text()
    meta = load_metadata()

    prompt = f"""Eres un asistente de estudio experto. Tu tarea es responder preguntas sobre el documento que te proveo.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE basándote en la información del documento.
- Si la respuesta NO está en el documento, di: "No encontré información sobre esto en el documento proporcionado."
- Cuando cites datos, indica de qué página o sección proviene.
- Sé claro, preciso y usa lenguaje accesible.
- Si la pregunta es ambigua, responde con la interpretación más razonable basada en el documento.

--- DOCUMENTO: {meta.get('filename', 'documento')} ---
{document_text}
--- FIN DEL DOCUMENTO ---

PREGUNTA DEL USUARIO: {req.question}

RESPUESTA:"""

    try:
        return AnswerResponse(answer=generate(prompt, model=req.model))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar el modelo: {e}")


@router.post("/summarize", response_model=SummaryResponse)
def summarize(req: SummarizeRequest = SummarizeRequest()):
    document_text = load_text()
    meta = load_metadata()

    prompt = f"""Eres un asistente de estudio. Genera un resumen completo y estructurado del siguiente documento.

El resumen debe incluir:
1. Introducción: contexto general del documento
2. Ideas principales por tema/sección
3. Conceptos clave y definiciones importantes
4. Conclusiones

Sé exhaustivo pero conciso. No omitas información importante.

--- DOCUMENTO: {meta.get('filename', 'documento')} ---
{document_text}
--- FIN DEL DOCUMENTO ---

RESUMEN:"""

    try:
        return SummaryResponse(summary=generate(prompt, model=req.model))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@router.post("/flashcards", response_model=FlashcardsResponse)
def generate_flashcards(req: FlashcardRequest):
    document_text = load_text()
    meta = load_metadata()

    prompt = f"""Eres un asistente de estudio. Genera {req.count} flashcards de alto impacto basadas en el siguiente documento.

REGLAS:
- Cada flashcard debe cubrir un concepto, término o idea importante del documento.
- "front": pregunta o concepto claro y específico.
- "back": respuesta concisa pero completa.
- Distribuye las flashcards entre los diferentes temas del documento.
- Responde SOLO con un array JSON válido, sin texto adicional ni markdown.

--- DOCUMENTO: {meta.get('filename', 'documento')} ---
{document_text}
--- FIN DEL DOCUMENTO ---

ARRAY JSON:"""

    try:
        text = generate(prompt, model=req.model)
        cards = _extract_json(text)
        return FlashcardsResponse(flashcards=cards)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar flashcards: {e}")


@router.post("/quiz", response_model=QuizPublicResponse)
def generate_quiz(req: QuizRequest):
    document_text = load_text()
    meta = load_metadata()

    t_inst = ""
    if req.type == "multiple_choice":
        t_inst = "Todas las preguntas deben ser de opción múltiple con 4 opciones (A, B, C, D)."
    elif req.type == "true_false":
        t_inst = "Todas las preguntas deben ser de verdadero/falso."
    else:
        t_inst = "Mezcla preguntas de opción múltiple y verdadero/falso."

    prompt = f"""Eres un asistente de estudio. Genera un examen de {req.count} preguntas basado en el siguiente documento.
{t_inst}

REGLAS:
- Las preguntas deben cubrir diferentes temas del documento.
- "question": texto claro de la pregunta.
- "options": array de opciones (para true_false: ["Verdadero", "Falso"]).
- "answer": la respuesta correcta tal cual aparece en las opciones.
- "explanation": explicación breve de por qué es correcta.
- Responde SOLO con un array JSON válido, sin texto adicional ni markdown.

--- DOCUMENTO: {meta.get('filename', 'documento')} ---
{document_text}
--- FIN DEL DOCUMENTO ---

ARRAY JSON:"""

    try:
        text = generate(prompt, model=req.model)
        questions = _extract_json(text)
        return QuizPublicResponse(
            quiz=[
                QuizPublicQuestion(index=i, question=q["question"], options=q["options"])
                for i, q in enumerate(questions)
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar quiz: {e}")


@router.post("/quiz/check", response_model=QuizCheckResponse)
def check_quiz(req: QuizCheckRequest):
    document_text = load_text()
    meta = load_metadata()

    prompt = f"""Eres un asistente de estudio. Evalúa las respuestas del usuario sobre el siguiente documento.

 DOCUMENTO ({meta.get('filename', 'documento')}):
{document_text[:15000]}
--- FIN ---

Responde SOLO con un array JSON válido con esta estructura para CADA pregunta:
[
  {{
    "index": 0,
    "question": "texto de la pregunta",
    "selected": "respuesta que eligió el usuario",
    "correct_answer": "respuesta correcta",
    "is_correct": true/false,
    "explanation": "explicación de por qué está bien o mal, referenciando el documento"
  }}
]

PREGUNTAS Y RESPUESTAS DEL USUARIO:
{json.dumps([{"index": a.index, "selected": a.selected} for a in req.answers], ensure_ascii=False)}

ARRAY JSON:"""

    try:
        text = generate(prompt, model=req.model)
        results_raw = _extract_json(text)

        results = []
        for r in results_raw:
            results.append(QuizResultItem(
                index=r["index"],
                question=r["question"],
                selected=r["selected"],
                correct_answer=r["correct_answer"],
                is_correct=r["is_correct"],
                explanation=r["explanation"],
            ))

        score = sum(1 for r in results if r.is_correct)
        total = len(results)
        pct = round((score / total) * 100, 1) if total > 0 else 0

        if pct == 100:
            msg = "¡Perfecto! Dominas este tema. ¡Excelente trabajo!"
        elif pct >= 70:
            msg = random.choice([
                "¡Muy bien! Estás en el camino correcto.",
                "Buen trabajo. Sigue practicando para alcanzar la perfección.",
                "¡Lo lograste! Un poco más de práctica y serás un experto.",
            ])
        elif pct >= 40:
            msg = random.choice(MOTIVATIONAL)
        else:
            msg = random.choice([
                "No te desanimes. Revisa el documento y vuelve a intentarlo.",
                "El camino al éxito está lleno de intentos. ¡Tú puedes!",
                "Cada intento te acerca más. ¡Revisa el contenido y atrévete de nuevo!",
            ])

        return QuizCheckResponse(
            results=results,
            score=score,
            total=total,
            percentage=pct,
            message=msg,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al evaluar quiz: {e}")


@router.post("/quiz/advanced", response_model=QuizAdvancedPublicResponse)
def generate_advanced_quiz(req: QuizAdvancedRequest):
    document_text = load_text()
    meta = load_metadata()

    closed_count = max(1, req.count * 60 // 100)
    open_count = req.count - closed_count

    prompt = f"""Eres un asistente de estudio riguroso. Genera un examen AVANZADO de {req.count} preguntas basado en el documento.
Combina preguntas de opción múltiple (cerradas) y preguntas de respuesta abierta.

DISTRIBUCIÓN:
- {closed_count} preguntas de opción múltiple (type: "closed")
- {open_count} preguntas de respuesta abierta (type: "open")

REGLAS:
- Las preguntas cerradas deben tener 4 opciones (A, B, C, D).
- Las preguntas abiertas deben exigir que el usuario explique, compare, analice o describa conceptos del documento.
- Las preguntas abiertas NO deben tener campo "options".
- "answer": respuesta correcta (para cerradas: la opción exacta; para abiertas: una guía de lo que se espera).
- "explanation": explicación de por qué es correcta.
- Distribuye las preguntas entre diferentes temas del documento.
- Responde SOLO con un array JSON válido, sin texto adicional ni markdown.

--- DOCUMENTO: {meta.get('filename', 'documento')} ---
{document_text}
--- FIN DEL DOCUMENTO ---

ARRAY JSON:"""

    try:
        text = generate(prompt, model=req.model)
        questions = _extract_json(text)

        public_quiz = []
        for i, q in enumerate(questions):
            item = {
                "index": i,
                "type": q.get("type", "closed"),
                "question": q["question"],
            }
            if q.get("type") == "closed":
                item["options"] = q.get("options", [])
            public_quiz.append(QuizAdvancedPublicQuestion(**item))

        return QuizAdvancedPublicResponse(quiz=public_quiz)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar quiz avanzado: {e}")


@router.post("/quiz/advanced/check", response_model=QuizAdvancedCheckResponse)
def check_advanced_quiz(req: QuizAdvancedCheckRequest):
    document_text = load_text()
    meta = load_metadata()

    answers_data = []
    for a in req.answers:
        entry = {"index": a.index, "type": a.type}
        if a.type == "closed":
            entry["selected"] = a.selected
        else:
            entry["text_answer"] = a.text_answer
        answers_data.append(entry)

    prompt = f"""Eres un asistente de estudio experto y riguroso. Evalúa las respuestas del usuario sobre el siguiente documento.

--- DOCUMENTO ({meta.get('filename', 'documento')}):
{document_text[:15000]}
--- FIN ---

INSTRUCCIONES DE EVALUACIÓN:
- Para preguntas CERRADAS (option multiple): evalúa si la respuesta seleccionada es correcta. Score: 1.0 si es correcta, 0.0 si no.
- Para preguntas ABIERTAS: evalúa la respuesta del usuario contra el documento. Asigna un score del 0.0 al 1.0 según:
  - 1.0: respuesta completa y correcta
  - 0.75: respuesta mayormente correcta con detalles menores
  - 0.5: respuesta parcialmente correcta
  - 0.25: respuesta con intento pero muy incompleta
  - 0.0: respuesta incorrecta o vacía

Responde SOLO con un array JSON válido:
[
  {{
    "index": 0,
    "type": "closed" o "open",
    "question": "texto de la pregunta",
    "selected": "respuesta seleccionada (si es cerrada)",
    "text_answer": "respuesta escrita (si es abierta)",
    "correct_answer": "respuesta correcta o guía esperada",
    "is_correct": true/false (solo para cerradas),
    "score_value": 0.0-1.0 (para todas),
    "explanation": "explicación detallada referenciando el documento"
  }}
]

PREGUNTAS Y RESPUESTAS DEL USUARIO:
{json.dumps(answers_data, ensure_ascii=False)}

ARRAY JSON:"""

    try:
        text = generate(prompt, model=req.model)
        results_raw = _extract_json(text)

        results = []
        for r in results_raw:
            results.append(QuizAdvancedResultItem(
                index=r["index"],
                type=r["type"],
                question=r["question"],
                selected=r.get("selected"),
                text_answer=r.get("text_answer"),
                correct_answer=r["correct_answer"],
                is_correct=r.get("is_correct", r.get("score_value", 0) >= 0.75),
                score_value=float(r.get("score_value", 1.0 if r.get("is_correct") else 0.0)),
                explanation=r["explanation"],
            ))

        total_score = sum(r.score_value for r in results)
        total_max = len(results)
        pct = round((total_score / total_max) * 100, 1) if total_max > 0 else 0

        if pct == 100:
            msg = "¡Dominio total! Eres un experto en este tema. ¡Felicitaciones!"
        elif pct >= 75:
            msg = random.choice([
                "¡Excelente! Demuestras un sólido entendimiento del tema.",
                "Muy buen resultado. Tu conocimiento es sólido.",
                "¡Impresionante! Estás muy cerca de dominar este tema.",
            ])
        elif pct >= 50:
            msg = random.choice([
                "Buen avance. Las preguntas abiertas son un reto, pero vas por buen camino.",
                "Entendimiento parcial. Revisa las secciones que te costaron.",
                "Sigue así. Cada práctica te acerca más al dominio del tema.",
            ])
        else:
            msg = random.choice([
                "Es un tema difícil, pero no te rindas. Revisa el documento y vuelve a intentarlo.",
                "Las preguntas abiertas requieren práctica. ¡Tú puedes mejorar!",
                "El camino al conocimiento tiene altibajos. ¡Reintenta con más preparación!",
            ])

        return QuizAdvancedCheckResponse(
            results=results,
            score=round(total_score, 2),
            total=total_max,
            percentage=pct,
            message=msg,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al evaluar quiz avanzado: {e}")
