"""Expenses CRUD router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.models import Expense
from app.schemas.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.routers.auth import get_user_from_bearer as get_current_user
from app.routers.crud import list_entities, get_entity, create_entity, update_entity, delete_entity
from app.services.recurring import ensure_recurring_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("", response_model=list[ExpenseOut])
async def list_expenses(
    skip: int = 0,
    limit: int = 100,
    month: int | None = None,
    year: int | None = None,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Lógica de gastos recurrentes: si toca (p. ej. día 2 del mes) y falta la
    # fila, se crea antes de devolver la lista para que la web esté al día.
    await ensure_recurring_expense(db, user.id, bool(getattr(user, "is_admin", False)))
    stmt = select(Expense).where(Expense.user_id == user.id).order_by(Expense.date.desc())
    if month and year:
        stmt = stmt.where(
            func.extract("month", Expense.date) == month,
            func.extract("year", Expense.date) == year,
        )
    elif year:
        stmt = stmt.where(func.extract("year", Expense.date) == year)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{expense_id}", response_model=ExpenseOut)
async def get_expense(expense_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    expense = await get_entity(db, Expense, expense_id, user.id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("", response_model=ExpenseOut, status_code=201)
async def create_expense(body: ExpenseCreate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await create_entity(db, Expense, user.id, body.model_dump())


@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: str, body: ExpenseUpdate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    updated = await update_entity(db, Expense, expense_id, user.id, body.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(expense_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    deleted = await delete_entity(db, Expense, expense_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Expense not found")
