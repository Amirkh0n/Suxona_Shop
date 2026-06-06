class ServiceError(Exception):
    default_message = "Service error."

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.default_message)
