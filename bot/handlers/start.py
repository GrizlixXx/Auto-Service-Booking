from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    name = user.first_name if user else "there"

    keyboard = [
        [InlineKeyboardButton("Visit Website", url="https://t.me/Auto_Service_BookingProject_Bot")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"Hello, *{name}*!\n\n"
        "I am the *AutoFix Service* notification bot.\n\n"
        "Notifications sent:\n"
        "- *Managers* - alerts when new users register\n"
        "- *Operators* - alerts when users request live assistance\n\n"
        "Your chat ID is: `" + str(user.id) + "`",
        parse_mode="Markdown",
        reply_markup=reply_markup,
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "*AutoFix Bot - Help*\n\n"
        "Available commands:\n"
        "/start - Show welcome message and your chat ID\n"
        "/help - Show this help message\n"
        "/requests - Show open operator requests\n"
        "/myid - Show your Telegram chat ID\n\n"
        "Notifications:\n"
        "- Managers receive alerts when new users register\n"
        "- Operators receive alerts when clients need assistance",
        parse_mode="Markdown",
    )


async def myid(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    await update.message.reply_text(
        f"Your Telegram Chat ID is:\n`{user.id}`\n\n"
        "Provide this ID to the system administrator to receive notifications.",
        parse_mode="Markdown",
    )
