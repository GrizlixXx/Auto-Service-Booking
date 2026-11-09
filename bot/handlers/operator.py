from telegram import Bot, Update
from telegram.ext import ContextTypes
import db


async def notify_operators(bot: Bot, payload: dict) -> int:
    user_login = payload.get("user_login", "unknown")
    reason = payload.get("reason", "No reason provided")
    user_phone = payload.get("user_phone", "N/A")
    user_email = payload.get("user_email", "N/A")

    operators = await db.get_active_operators()

    if not operators:
        print("[Bot] No active operators with Telegram chat ID found.")
        return 0

    message = (
        "*New Help Request*\n"
        "--------------------\n"
        f"*User:* `{user_login}`\n"
        f"*Email:* {user_email}\n"
        f"*Phone:* {user_phone}\n"
        f"*Reason:* {reason}\n"
        "--------------------\n"
        "Please contact the user as soon as possible."
    )

    count = 0
    seen_chat_ids = set()
    for op in operators:
        chat_id = str(op["telegram_chat_id"]).strip()
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
            print(f"[Bot] Notified operator {op['name']} (chat_id={chat_id})")
        except Exception as e:
            print(f"[Bot] Failed to notify operator {op['name']}: {e}")

    return count


async def requests_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    requests = await db.get_open_operator_requests()

    if not requests:
        await update.message.reply_text("No open requests at the moment.")
        return

    lines = ["*Open Operator Requests*\n--------------------"]
    for r in requests[:10]:
        lines.append(
            f"\n*Request #{r['id']}* - `{r['user_login']}`\n"
            f"Reason: {r['reason']}\n"
            f"Phone: {r.get('phone_number', 'N/A')} | Email: {r.get('email', 'N/A')}\n"
            f"Created: {r['created_at']}"
        )

    await update.message.reply_text(
        "\n".join(lines),
        parse_mode="Markdown",
    )
