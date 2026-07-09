import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv
from google import genai

# 1. Cargar las variables de entorno desde el archivo .env
load_dotenv()

# 2. Configurar rutas absolutas para los archivos del documento
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGE_PATH = os.path.join(BASE_DIR, "doc_rag", "img_rag")
TEXT_PATH = os.path.join(BASE_DIR, "doc_rag", "documento_transcrito.txt")

# 3. Inicializar la app de FastAPI
app = FastAPI(title="StudyRAG Backend API")

# Habilitar CORS para que el frontend pueda consultar este servidor sin problemas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Inicializar el cliente de Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key and api_key != "tu_api_key_aqui":
    client = genai.Client(api_key=api_key)
else:
    print("⚠️ ADVERTENCIA: GEMINI_API_KEY no configurada. Por favor actualiza tu archivo .env")

# Modelos de datos para las peticiones
class QuestionRequest(BaseModel):
    question: str

# Función para transcribir la imagen una sola vez
def transcribir_imagen_si_no_existe():
    global client
    if not client:
        return "Cliente Gemini no configurado. Falta la API Key en el archivo .env"
    
    if os.path.exists(TEXT_PATH):
        return "El documento ya está transcrito."

    if not os.path.exists(IMAGE_PATH):
        raise FileNotFoundError(f"No se encontró la imagen en {IMAGE_PATH}")

    print("📄 Transcribiendo la imagen del documento usando Gemini...")
    try:
        # Abrimos la imagen usando Pillow (PIL)
        imagen = Image.open(IMAGE_PATH)
        
        # Le pedimos a Gemini que extraiga todo el contenido
        prompt = (
            "Transcribe de forma exacta todo el texto contenido en esta imagen. "
            "Mantén el formato original, listas, títulos y estructura. "
            "No agregues explicaciones tuyas, solo el texto transcrito directamente."
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[imagen, prompt]
        )
        
        # Guardamos el resultado en un archivo .txt
        os.makedirs(os.path.dirname(TEXT_PATH), exist_ok=True)
        with open(TEXT_PATH, "w", encoding="utf-8") as f:
            f.write(response.text)
        
        print("✅ Transcripción guardada con éxito en documento_transcrito.txt")
        return "Transcripción realizada con éxito."
    except Exception as e:
        print(f"❌ Error al transcribir la imagen: {e}")
        return f"Error en la transcripción: {e}"

# Evento al iniciar el servidor
@app.on_event("startup")
async def startup_event():
    try:
        transcribir_imagen_si_no_existe()
    except Exception as e:
        print(f"⚠️ No se pudo inicializar la transcripción en el inicio: {e}")

# Endpoint de prueba para saber si el servidor está en línea
@app.get("/")
def read_root():
    return {"message": "Servidor StudyRAG en línea"}

# Endpoint para saber el estado de la transcripción
@app.get("/status")
def get_status():
    api_ready = client is not None
    transcribed = os.path.exists(TEXT_PATH)
    
    preview = ""
    if transcribed:
        with open(TEXT_PATH, "r", encoding="utf-8") as f:
            preview = f.read(500)  # Muestra los primeros 500 caracteres
            
    return {
        "api_key_configured": api_ready,
        "document_transcribed": transcribed,
        "preview": preview if transcribed else "Pendiente de transcripción"
    }

# Endpoint principal: El RAG para hacer preguntas
@app.post("/ask")
def ask_question(req: QuestionRequest):
    global client
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key no configurada en el servidor.")
    
    # Nos aseguramos de tener la transcripción hecha
    if not os.path.exists(TEXT_PATH):
        # Intentamos transcribir en caliente
        try:
            transcribir_imagen_si_no_existe()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"No se pudo leer el documento: {e}")
            
    if not os.path.exists(TEXT_PATH):
        raise HTTPException(status_code=500, detail="El documento no ha sido transcrito aún.")
        
    # Leemos la transcripción
    with open(TEXT_PATH, "r", encoding="utf-8") as f:
        document_text = f.read()
        
    # Creamos el prompt para el RAG
    prompt = f"""Eres un asistente de estudio útil. Tu tarea es responder la pregunta del usuario basándote ÚNICAMENTE en el documento provisto a continuación. 

Si la respuesta a la pregunta no se encuentra en el documento, di claramente: "La respuesta a esta pregunta no se encuentra en el documento proporcionado." No inventes información fuera del texto.

--- INICIO DEL DOCUMENTO ---
{document_text}
--- FIN DEL DOCUMENTO ---

Pregunta: {req.question}
Respuesta:"""

    try:
        # Consultamos a Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar el modelo: {e}")
