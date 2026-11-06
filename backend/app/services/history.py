import uuid
from datetime import datetime, timezone
from typing import List
from app.schemas import HistoryItem, PredictResponse

class HistoryService:
    def __init__(self, max_items: int = 50):
        self.max_items = max_items
        self._history: List[HistoryItem] = []

    def add_entry(self, prediction: PredictResponse) -> HistoryItem:
        item = HistoryItem(
            id=str(uuid.uuid4())[:8],
            timestamp=datetime.now(timezone.utc).isoformat(),
            username=prediction.username,
            riskScore=prediction.riskScore,
            riskLevel=prediction.riskLevel,
            prediction=prediction.prediction
        )
        self._history.insert(0, item)
        if len(self._history) > self.max_items:
            self._history = self._history[:self.max_items]
        return item

    def get_history(self) -> List[HistoryItem]:
        return list(self._history)

    def clear(self):
        self._history.clear()

history_service = HistoryService()
