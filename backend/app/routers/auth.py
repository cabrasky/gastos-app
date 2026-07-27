"""Google OAuth authentication router."""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt
from httpx import AsyncClient

from app.config import settings
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import GoogleAuthRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


async def verify_google_token(code: str, redirect_uri: str) -> Optional[dict]:
    """Exchange authorization code for user info from Google."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    async with AsyncClient() as client:
        resp = await client.post(token_url, data=data)
        if resp.status_code != 200:
            return None
        tokens = resp.json()
        id_token = tokens.get("id_token")
        if not id_token:
            return None
        # Decode the JWT id_token to get user info
        from jose import jws
        # Google id_token is a JWS (not encrypted)
        try:
            user_info = jws.verify(id_token, None, algorithms=["RS256"])
            return user_info if isinstance(user_info, dict) else None
        except Exception:
            # Fallback: call userinfo endpoint
            access_token = tokens.get("access_token")
            user_resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if user_resp.status_code == 200:
                return user_resp.json()
            return None


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except Exception:
        return None


async def get_current_user(
    token: str = Depends(lambda: None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from the Authorization header."""
    # This is a placeholder — real extraction happens via the dependency override in main.py
    raise HTTPException(status_code=401, detail="Not authenticated")


async def get_user_from_bearer(authorization: str, db: AsyncSession) -> User:
    """Helper to extract user from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google OAuth code."""
    google_user = await verify_google_token(body.code, body.redirect_uri)
    if google_user is None:
        raise HTTPException(status_code=401, detail="Google authentication failed")

    google_id = str(google_user.get("id", ""))
    email = google_user.get("email", "")
    name = google_user.get("name", "User")
    avatar = google_user.get("picture", "")

    if not google_id:
        raise HTTPException(status_code=400, detail="Could not retrieve Google profile")

    # Find or create user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user:
        user.last_login = datetime.utcnow()
        user.email = email
        user.name = name
        if avatar:
            user.avatar_url = avatar
    else:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            avatar_url=avatar,
        )
        db.add(user)

    await db.flush()
    access_token = create_access_token(user.id)

    return TokenResponse(
        access_token=access_token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(authorization: str = Depends(lambda: None), db: AsyncSession = Depends(get_db)):
    """Get current user profile."""
    user = await get_user_from_bearer(authorization, db)
    return UserOut.model_validate(user)
