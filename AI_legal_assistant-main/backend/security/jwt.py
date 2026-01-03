from datetime import datetime, timedelta
from typing import Any, Dict, Union

from jose import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


def generate_token(
    data: Union[Dict[str, Any], Any], expires_delta: timedelta = None
) -> str:
    """
    Generate a JWT token with the given data.

    Args:
        data: The data to encode in the token. Can be a dictionary or any other value.
        expires_delta: Optional parameter to specify custom expiration time.

    Returns:
        str: The generated JWT token
    """
    # 确保传入的 data 包含 'user_id'
    if isinstance(data, dict):
        to_encode = data.copy()
    else:
        to_encode = {"user_id": data}  # 直接存储 user_id

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
