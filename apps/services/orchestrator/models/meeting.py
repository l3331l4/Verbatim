from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID, uuid4
from datetime import datetime, timezone

class Meeting(BaseModel):
    meeting_id: UUID = Field(default_factory=uuid4, description="Unique meeting identifier")
    title: str = Field(..., description="Meeting Title")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")
    status: Literal["active", "ended"] = Field(..., description="Meeting status")
    ended_at: Optional[datetime] = Field(default=None, description="Timestamp when meeting was ended")