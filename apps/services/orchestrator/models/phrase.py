from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime, timezone

class Phrase(BaseModel):
    phrase_id: UUID = Field(default_factory=uuid4, description="Unique phrase identifier")
    meeting_id: UUID = Field(..., description="Identifier of the meeting this phrase belongs to")
    phrase: str = Field(..., description="Transcribed text of the phrase")
    processed: bool = Field(default=False, description="Whether this phrase has been included in a summary")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp when phrase was saved")