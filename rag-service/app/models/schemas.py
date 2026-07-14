from pydantic import BaseModel


# ── Requests ──────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str
    model: str = "gemini-2.0-flash"


class FlashcardRequest(BaseModel):
    count: int = 5
    model: str = "gemini-2.0-flash"


class QuizRequest(BaseModel):
    count: int = 5
    type: str = "multiple_choice"
    model: str = "gemini-2.0-flash"


class SummarizeRequest(BaseModel):
    model: str = "gemini-2.0-flash"


# ── Responses ─────────────────────────────────────────────────

class HealthResponse(BaseModel):
    message: str


class StatusResponse(BaseModel):
    api_key_configured: bool
    groq_configured: bool
    document_transcribed: bool
    document: dict
    preview: str


class ModelsResponse(BaseModel):
    models: dict
    default: str


class UploadResponse(BaseModel):
    message: str
    chunks: int
    chars: int


class AnswerResponse(BaseModel):
    answer: str


class SummaryResponse(BaseModel):
    summary: str


class FlashcardItem(BaseModel):
    front: str
    back: str


class FlashcardsResponse(BaseModel):
    flashcards: list[FlashcardItem]


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str
    explanation: str


class QuizResponse(BaseModel):
    quiz: list[QuizQuestion]


class QuizPublicQuestion(BaseModel):
    index: int
    question: str
    options: list[str]


class QuizPublicResponse(BaseModel):
    quiz: list[QuizPublicQuestion]


class QuizCheckItem(BaseModel):
    index: int
    selected: str


class QuizCheckRequest(BaseModel):
    answers: list[QuizCheckItem]
    model: str = "gemini-2.0-flash"


class QuizResultItem(BaseModel):
    index: int
    question: str
    selected: str
    correct_answer: str
    is_correct: bool
    explanation: str


class QuizCheckResponse(BaseModel):
    results: list[QuizResultItem]
    score: int
    total: int
    percentage: float
    message: str


# ── Advanced Quiz ────────────────────────────────────────────

class QuizAdvancedRequest(BaseModel):
    count: int = 7
    model: str = "gemini-2.0-flash"


class QuizAdvancedPublicQuestion(BaseModel):
    index: int
    type: str
    question: str
    options: list[str] | None = None


class QuizAdvancedPublicResponse(BaseModel):
    quiz: list[QuizAdvancedPublicQuestion]


class QuizAdvancedCheckItem(BaseModel):
    index: int
    type: str
    selected: str | None = None
    text_answer: str | None = None


class QuizAdvancedCheckRequest(BaseModel):
    answers: list[QuizAdvancedCheckItem]
    model: str = "gemini-2.0-flash"


class QuizAdvancedResultItem(BaseModel):
    index: int
    type: str
    question: str
    selected: str | None = None
    text_answer: str | None = None
    correct_answer: str
    is_correct: bool
    score_value: float
    explanation: str


class QuizAdvancedCheckResponse(BaseModel):
    results: list[QuizAdvancedResultItem]
    score: float
    total: float
    percentage: float
    message: str
