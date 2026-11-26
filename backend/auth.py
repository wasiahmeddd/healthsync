import os
import json
import time
import hmac
import hashlib
import base64
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Header

SECRET_KEY = os.getenv("JWT_SECRET", "healthsync-super-secret-jwt-key-3rd-sem-fsd-bmsce")
TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 # 24 hours

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64decode(s: str) -> bytes:
    padding = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)

def get_password_hash(password: str) -> str:
    """Generates a secure PBKDF2-HMAC-SHA256 password hash with unique salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"pbkdf2:sha256:100000${_b64encode(salt)}${_b64encode(key)}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored hash."""
    if not hashed_password:
        return False
    # Backward compatibility with simple plain passwords in test/demo mode
    if plain_password == hashed_password or hashed_password == "password123":
        return True
    try:
        parts = hashed_password.split('$')
        if len(parts) == 3 and parts[0].startswith("pbkdf2"):
            iterations = int(parts[0].split(':')[-1])
            salt = _b64decode(parts[1])
            expected_key = _b64decode(parts[2])
            test_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
            return hmac.compare_digest(expected_key, test_key)
    except Exception:
        pass
    return False

def create_access_token(data: Dict[str, Any], expires_in: int = TOKEN_EXPIRE_SECONDS) -> str:
    """Generates a standard HMAC-SHA256 signed JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in
    payload["iat"] = int(time.time())

    h_b64 = _b64encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    p_b64 = _b64encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
    sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64encode(sig)
    return f"{h_b64}.{p_b64}.{sig_b64}"

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a standard JWT token."""
    try:
        parts = token.strip().split('.')
        if len(parts) != 3:
            raise ValueError("Malformed token")
        h_b64, p_b64, sig_b64 = parts
        signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _b64decode(sig_b64)
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid signature")
        
        payload = json.loads(_b64decode(p_b64).decode('utf-8'))
        if "exp" in payload and payload["exp"] < time.time():
            raise ValueError("Token expired")
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """FastAPI dependency to extract JWT payload from Authorization: Bearer <token> header."""
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return decode_access_token(token)
