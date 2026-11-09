# AutoFix Service

AutoFix Service is a full-stack web platform for booking automotive maintenance services across multiple cities and service centers. Includes a React SPA, Express REST API, MySQL database with automated migrations, an AI-style onsite chatbot, and an async Python Telegram Bot for real-time staff notifications.

## Features

- Multi-step booking wizard — service selection, salon and date/time, confirmation summary
- 16 automotive services with real-time price calculation and Lucide SVG icons
- 6 service centers across 5 cities with working hours and dynamic available time slots
- Fully booked date warning when all slots on a selected day are taken
- Onsite ChatBot for checking availability, reviewing bookings, and contacting an operator
- Telegram Bot that instantly notifies managers on new registrations and operators on help requests
- JWT-based auth with bcrypt password hashing and role-based access (client, operator, manager, admin)
- Avatar upload with Sharp image compression stored in `/uploads`
- Operator dashboard for managing open help requests
- Automated idempotent MySQL migration runner (`npm run migrate`)
- CLI Role Giver — assign user roles directly from the terminal without writing SQL

## CLI Role Giver

After registering on the site, assign a role to any account via the terminal:

```bash
npm run set-role <username> operator
# or: client | manager | admin
```

The script connects to the configured MySQL database, runs a parameterized `UPDATE users SET role = ?` query, and exits cleanly. No manual SQL required.

## Technologies

- **Frontend:** React 19, React Router 7, Vite 8, Lucide React, Axios
- **Backend:** Node.js, Express 5, mysql2, bcryptjs, jsonwebtoken, Multer, Sharp, dotenv
- **Telegram Bot:** Python 3.10+, python-telegram-bot 21, aiohttp, aiomysql
- **Database:** MySQL 8
- **Styling:** CSS3 with Glassmorphism

## Project Structure

```
bot/              Async Python Telegram Bot
  handlers/       Notification handlers (operator, manager, start)
  config.py       Environment config
  db.py           Async MySQL pool
  main.py         Bot entry point and aiohttp listener
frontend/         React 19 SPA
  src/
    api/          Axios instance
    components/   Navbar, Footer, ChatBot, ProtectedRoute, ScrollToTop
    context/      AuthContext — global auth state
    hooks/        useLocationsCache — sessionStorage-cached locations
    pages/        Home, Services, SignIn, Register, UserAccount, OperatorPanel
server/           Express backend
  middleware/     JWT verification and role-checking middleware
  migrations/     SQL migration files (run once via migrate.js)
  routes/         auth, orders, locations, slots, operator, user
  db.js           MySQL pool
  migrate.js      Migration runner
  server.js       Express entry point
  set-role.js     CLI tool to assign user roles
uploads/          User avatar storage
Procfile          Process definitions for deployment
```

## Requirements

- Node.js 18+
- Python 3.10+
- MySQL 8+

## Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend

# Install bot dependencies
pip install -r bot/requirements.txt
```

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=auto_service_booking_db
PORT=4200

JWT_SECRET=your_secret_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
BOT_INTERNAL_PORT=5050
```

Run database migrations to create tables and seed all cities, salons, and services:

```bash
npm run migrate
```

Build the frontend and start the server:

```bash
npm run build
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

Start the Telegram Bot in a separate terminal (optional):

```bash
python bot/main.py
```
