# AutoFix Service — Telegram Bot

A standalone Python Telegram bot for the AutoFix Service booking platform.

## Features

- 📢 **Manager Notifications** — sends a Telegram message to all active managers when a new user registers
- 🎧 **Operator Notifications** — sends a Telegram message to all active operators when a user requests help via the chatbot
- 💬 **Commands**: `/start`, `/help`, `/myid`, `/requests`
- 🌐 **Internal HTTP server** on port `5050` — receives trigger requests from the Express backend

## Setup

### 1. Install Python dependencies

```bash
cd bot
pip install -r requirements.txt
```

### 2. Configure `.env` (root directory)

The bot reads from the root `.env` file automatically:

```env
TELEGRAM_BOT_TOKEN=your_token_here
BOT_INTERNAL_PORT=5050
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=auto_service_booking_db
```

### 3. Add Telegram Chat IDs to the database

To receive notifications, operators and managers must set their `telegram_chat_id` in the DB:

1. Start the bot: `python main.py`
2. Send `/start` or `/myid` to your bot on Telegram
3. Copy your Chat ID from the response
4. Update the database:

```sql
-- For an operator:
UPDATE operators SET telegram_chat_id = '123456789' WHERE name = 'Operator Alice';

-- For a manager:
UPDATE managers SET telegram_chat_id = '987654321' WHERE name = 'Manager of AutoFix Northgate Central';
```

### 4. Run the bot

```bash
cd bot
python main.py
```

## Architecture

```
Express (Node.js, port 4200)
    │
    ├── POST http://localhost:5050/notify/manager  ← new user registered
    └── POST http://localhost:5050/notify/operator ← user needs help

Bot (Python, port 5050 internal HTTP + Telegram polling)
    │
    ├── Queries DB for active operators/managers with telegram_chat_id
    └── Sends Telegram messages via Bot API
```

## Telegram Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + your Chat ID |
| `/help` | List of available commands |
| `/myid` | Show your Telegram Chat ID |
| `/requests` | Show open operator requests (from DB) |

## Bot Link

[@Auto_Service_BookingProject_Bot](https://t.me/Auto_Service_BookingProject_Bot)
