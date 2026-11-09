from telegram import Bot
import db


async def notify_managers(bot: Bot, payload: dict) -> int:
    user_login = payload.get("user_login", "unknown")
    user_email = payload.get("user_email", "N/A")
    user_phone = payload.get("user_phone", "N/A")

    managers = await db.get_all_active_managers()

    if not managers:
        print("[Bot] No active managers with Telegram chat ID found.")
        return 0

    message = (
        "*New User Registration*\n"
        "--------------------\n"
        f"*Login:* `{user_login}`\n"
        f"*Email:* {user_email}\n"
        f"*Phone:* {user_phone}\n"
        "--------------------\n"
        "A new client has registered on the platform.\n"
        "They may contact your salon for a booking soon."
    )

    count = 0
    seen_chat_ids = set()
    for mgr in managers:
        chat_id = str(mgr["telegram_chat_id"]).strip()
        if not chat_id or chat_id in seen_chat_ids:
            continue
        seen_chat_ids.add(chat_id)
        try:
            await bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode="Markdown",
            )
            count += 1
            print(f"[Bot] Notified manager {mgr['name']} (salon: {mgr['salon_name']}, chat_id={chat_id})")
        except Exception as e:
            print(f"[Bot] Failed to notify manager {mgr['name']}: {e}")

    return count
