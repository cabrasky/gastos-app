"""Authentication router: register, login, Google OAuth, JWT."""
import secrets
import re
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from jose import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.models import User, OAuthConfig
from app.schemas.schemas import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserOut,
    OAuthConfigUpdate,
    OAuthConfigOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_jwt(user_id: str, email: str, is_admin: bool = False) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "admin": is_admin,
        "exp": datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _verify_jwt(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except Exception:
        return None


def _generate_code(length: int = 16) -> str:
    return secrets.token_hex(length // 2).upper()[:length]


def _validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract current user from Bearer token. Raises 401 if invalid."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado")

    token = auth.split(" ", 1)[1]
    payload = _verify_jwt(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    return user


async def require_admin(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Require admin role. Raises 403 if not admin."""
    user = await get_current_user(request, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Acceso denegado")
    return user


# ── Auth Endpoints ────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email + password."""
    email = body.email.strip().lower()
    password = body.password
    name = body.name.strip()

    if not _validate_email(email):
        raise HTTPException(status_code=400, detail="Email inválido")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    if not name:
        raise HTTPException(status_code=400, detail="Se requiere un nombre")

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email ya registrado")

    user = User(
        email=email,
        password_hash=password_hash,
        name=name,
        code=_generate_code(16),
    )
    db.add(user)
    await db.flush()

    token = _make_jwt(user.id, user.email, user.is_admin)
    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email + password."""
    email = body.email.strip().lower()
    password = body.password

    if not _validate_email(email) or not password:
        raise HTTPException(status_code=400, detail="Credenciales inválidas")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    user.last_login = datetime.utcnow()
    token = _make_jwt(user.id, user.email, user.is_admin)
    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/google")
async def google_login(request: Request, db: AsyncSession = Depends(get_db)):
    """Redirect to Google OAuth consent screen."""
    result = await db.execute(
        select(OAuthConfig).where(
            OAuthConfig.provider == "google",
            OAuthConfig.enabled == True,
        )
    )
    config = result.scalar_one_or_none()
    if not config or not config.client_id:
        raise HTTPException(status_code=400, detail="Google OAuth no está configurado")

    redirect_uri = config.redirect_uri or f"{settings.app_url}/api/auth/google/callback"
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": config.client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
    }
    qs = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{qs}")


@router.get("/google/callback")
async def google_callback(
    code: str = "",
    state: str = "",
    error: str = "",
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth callback."""
    if error:
        raise HTTPException(status_code=400, detail=f"Google OAuth error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    result = await db.execute(
        select(OAuthConfig).where(OAuthConfig.provider == "google")
    )
    config = result.scalar_one_or_none()
    if not config or not config.client_id:
        raise HTTPException(status_code=400, detail="Google OAuth no configurado")

    redirect_uri = config.redirect_uri or f"{settings.app_url}/api/auth/google/callback"

    try:
        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": config.client_id,
                    "client_secret": config.client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            token_data = resp.json()
            if "error" in token_data:
                raise HTTPException(status_code=400, detail="Error al obtener token de Google")

            # Get user info
            resp2 = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            user_info = resp2.json()
            if "error" in user_info:
                raise HTTPException(status_code=400, detail="Error al obtener datos de usuario")

            google_id = user_info["sub"]
            email = user_info.get("email", "").lower()
            name = user_info.get("name", email.split("@")[0])
            avatar = user_info.get("picture", "")

            if not email:
                raise HTTPException(status_code=400, detail="Google no proporcionó email")

            # Find or create user
            result = await db.execute(
                select(User).where(
                    (User.google_id == google_id) | (User.email == email)
                )
            )
            user = result.scalar_one_or_none()

            if user:
                user.last_login = datetime.utcnow()
                user.name = name
                if not user.google_id:
                    user.google_id = google_id
                if avatar:
                    user.avatar_url = avatar
            else:
                user = User(
                    email=email,
                    name=name,
                    google_id=google_id,
                    avatar_url=avatar,
                    code=_generate_code(16),
                )
                db.add(user)

            await db.flush()
            token = _make_jwt(user.id, user.email, user.is_admin)
            # Redirect back to frontend with token
            return RedirectResponse(f"{settings.frontend_url}/?token={token}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en autenticación con Google: {e}")


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current user profile."""
    return UserOut.model_validate(current_user)


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/oauth")
async def get_oauth_config(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get OAuth configuration (admin only)."""
    result = await db.execute(
        select(OAuthConfig).order_by(OAuthConfig.provider)
    )
    configs = result.scalars().all()
    return {"configs": [OAuthConfigOut.model_validate(c) for c in configs]}


@router.put("/admin/oauth")
async def update_oauth_config(
    body: OAuthConfigUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update OAuth configuration (admin only)."""
    result = await db.execute(
        select(OAuthConfig).where(OAuthConfig.provider == body.provider)
    )
    config = result.scalar_one_or_none()

    if config:
        config.client_id = body.client_id
        config.client_secret = body.client_secret
        config.redirect_uri = body.redirect_uri
        config.enabled = body.enabled
        config.updated_at = datetime.utcnow()
    else:
        config = OAuthConfig(
            provider=body.provider,
            client_id=body.client_id,
            client_secret=body.client_secret,
            redirect_uri=body.redirect_uri,
            enabled=body.enabled,
        )
        db.add(config)

    await db.flush()
    return {"status": "updated"}
