import asyncio
import logging
from aiohttp import web
from telegram import Bot
from telegram.ext import Application, CommandHandler

from config import TELEGRAM_BOT_TOKEN, BOT_INTERNAL_PORT
import db
from handlers.start import start, help_command, myid
from handlers.operator import notify_operators, requests_command
from handlers.manager import notify_managers

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


def make_http_app(bot: Bot) -> web.Application:
    app = web.Application()

    async def handle_notify_operator(request: web.Request) -> web.Response:
        try:
            payload = await request.json()
        except Exception:
            return web.Response(status=400, text="Invalid JSON")

        count = await notify_operators(bot, payload)
        logger.info(f"[HTTP] Notified {count} operator(s)")
        return web.json_response({"notified": count})

    async def handle_notify_manager(request: web.Request) -> web.Response:
        try:
            payload = await request.json()
        except Exception:
            return web.Response(status=400, text="Invalid JSON")

        count = await notify_managers(bot, payload)
        logger.info(f"[HTTP] Notified {count} manager(s)")
        return web.json_response({"notified": count})

    async def handle_health(request: web.Request) -> web.Response:
        return web.json_response({"status": "ok", "bot": "AutoFix Service Bot"})

    app.router.add_post("/notify/operator", handle_notify_operator)
    app.router.add_post("/notify/manager", handle_notify_manager)
    app.router.add_get("/health", handle_health)

    return app


async def main():
    logger.info("Starting AutoFix Telegram Bot...")

    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("myid", myid))
    application.add_handler(CommandHandler("requests", requests_command))

    bot: Bot = application.bot

    bot_info = await bot.get_me()
    logger.info(f"Bot verified: @{bot_info.username} ({bot_info.first_name})")

    http_app = make_http_app(bot)
    runner = web.AppRunner(http_app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", BOT_INTERNAL_PORT)
    await site.start()
    logger.info(f"Internal HTTP server running on http://127.0.0.1:{BOT_INTERNAL_PORT}")

    logger.info("Starting Telegram polling...")
    await application.initialize()
    await application.start()
    await application.updater.start_polling(drop_pending_updates=True)

    logger.info("Bot is running. Press Ctrl+C to stop.")

    try:
        await asyncio.Event().wait()
    except (asyncio.CancelledError, KeyboardInterrupt):
        pass
    finally:
        logger.info("Shutting down...")
        await application.updater.stop()
        await application.stop()
        await application.shutdown()
        await runner.cleanup()
        await db.close_pool()
        logger.info("Bot stopped cleanly.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
