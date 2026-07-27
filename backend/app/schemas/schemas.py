"""Pydantic schemas for API request/response validation."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: str = ""
    is_admin: bool = False

    model_config = {"from_attributes": True}


class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str = ""


# ── Admin / OAuth ─────────────────────────────────────────────────────────────

class OAuthConfigOut(BaseModel):
    provider: str
    client_id: str
    redirect_uri: str
    enabled: bool

    model_config = {"from_attributes": True}


class OAuthConfigUpdate(BaseModel):
    provider: str = "google"
    client_id: str = ""
    client_secret: str = ""
    redirect_uri: str = ""
    enabled: bool = False


# ── Expenses ──────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    date: date
    description: str
    amount: float = Field(gt=0)
    purpose: str = ""
    motive: str = ""
    tipo: str = ""
    method: str = ""
    ajeno: bool = False
    deudores: str = ""
    deuda_metodo: str = ""
    devuelto: bool = False
    me_corresponde: float = 0.0
    viaje: str = ""


class ExpenseUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    purpose: Optional[str] = None
    motive: Optional[str] = None
    tipo: Optional[str] = None
    method: Optional[str] = None
    ajeno: Optional[bool] = None
    deudores: Optional[str] = None
    deuda_metodo: Optional[str] = None
    devuelto: Optional[bool] = None
    me_corresponde: Optional[float] = None
    viaje: Optional[str] = None


class ExpenseOut(BaseModel):
    id: str
    user_id: str
    date: date
    description: str
    amount: float
    purpose: str
    motive: str
    tipo: str
    method: str
    ajeno: bool
    deudores: str
    deuda_metodo: str
    devuelto: bool
    me_corresponde: float
    viaje: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Incomes ───────────────────────────────────────────────────────────────────

class IncomeCreate(BaseModel):
    date: date
    description: str
    amount: float = Field(gt=0)
    category: str = ""


class IncomeUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = None


class IncomeOut(BaseModel):
    id: str
    user_id: str
    date: date
    description: str
    amount: float
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Goals ─────────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    name: str
    target_amount: float = Field(gt=0)
    current_amount: float = 0.0
    deadline: Optional[date] = None
    category: str = ""
    notes: str = ""


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, gt=0)
    current_amount: Optional[float] = Field(default=None, ge=0)
    deadline: Optional[date] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class GoalOut(BaseModel):
    id: str
    user_id: str
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[date]
    category: str
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Subscriptions ─────────────────────────────────────────────────────────────

class SubscriptionCreate(BaseModel):
    name: str
    amount: float = Field(gt=0)
    billing_cycle: str = "monthly"  # weekly, monthly, quarterly, yearly
    next_billing: date
    category: str = ""
    active: bool = True


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = Field(default=None, gt=0)
    billing_cycle: Optional[str] = None
    next_billing: Optional[date] = None
    category: Optional[str] = None
    active: Optional[bool] = None


class SubscriptionOut(BaseModel):
    id: str
    user_id: str
    name: str
    amount: float
    billing_cycle: str
    next_billing: date
    category: str
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
