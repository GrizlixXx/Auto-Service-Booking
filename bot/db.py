"""
Async MySQL database access for the Telegram bot.
Shares the same database as the Express server.
"""

import aiomysql
import asyncio
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

_pool: aiomysql.Pool | None = None


async def get_pool() -> aiomysql.Pool:
    """Get or create the connection pool."""
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            charset="utf8mb4",
            autocommit=True,
            minsize=1,
            maxsize=5,
        )
    return _pool


async def close_pool():
    """Close the pool on shutdown."""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


async def get_active_operators() -> list[dict]:
    """Return all active operators with a Telegram chat ID."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, name, telegram_chat_id FROM operators "
                "WHERE active = 1 AND telegram_chat_id IS NOT NULL"
            )
            return await cur.fetchall()


async def get_all_active_managers() -> list[dict]:
    """Return all active managers with a Telegram chat ID and their salon name."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                """
                SELECT m.id, m.name, m.telegram_chat_id, s.name AS salon_name
                FROM managers m
                JOIN salons s ON s.id = m.salon_id
                WHERE m.active = 1 AND m.telegram_chat_id IS NOT NULL
                """
            )
            return await cur.fetchall()


async def get_managers_for_salon(salon_id: int) -> list[dict]:
    """Return managers for a specific salon."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, name, telegram_chat_id FROM managers "
                "WHERE salon_id = %s AND active = 1 AND telegram_chat_id IS NOT NULL",
                (salon_id,)
            )
            return await cur.fetchall()


async def get_open_operator_requests() -> list[dict]:
    """Return all open operator requests (for Telegram command)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                """
                SELECT r.id, r.user_login, r.reason, r.created_at,
                       u.email, u.phone_number
                FROM operator_requests r
                LEFT JOIN users u ON r.user_login = u.user_login
                ORDER BY r.created_at DESC
                LIMIT 20
                """
            )
            return await cur.fetchall()
