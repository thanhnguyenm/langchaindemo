import uuid

def is_valid_uuid(uuid_string: str) -> bool:
    """Check if a string is a valid UUID format"""
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False