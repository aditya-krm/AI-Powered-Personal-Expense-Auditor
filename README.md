# 🪙 MoneyTrack: AI-Powered Personal Expense Auditor

Welcome to **MoneyTrack**! This is an intelligent, automated, and seamless personal finance auditor. It combines the ease of a Telegram Bot, the intelligence of OpenAI, the automation of Gmail parsing, and the beauty of a modern Next.js live dashboard to give you absolute control over your financial telemetry.

---

## 🎯 For Recruiters & HR Professionals

**Why does this project stand out?**
- **Modern Tech Stack:** Built using the bleeding edge of web technologies: **Next.js 15**, **React 19**, **Bun**, and **Tailwind CSS 4**.
- **AI Integration:** Leverages **OpenAI** to process natural language. You can simply text the bot "Bought coffee for 250" and it accurately categorizes, logs, and tracks the transaction.
- **Microservices & Automation:** Features an Email Processor that listens to Gmail transaction alerts and automatically drafts ledger entries for user approval via Telegram.
- **Robust Backend:** Uses **PostgreSQL** with **Prisma ORM** for type-safe database queries, managing complex relations like debts, settlements, and partial payments.
- **Premium UX/UI:** The frontend is a "Live Auditor" dashboard featuring complex animations using **Framer Motion** and **GSAP**, with a highly polished "noir" visual aesthetic.

---

## 💻 For Developers & Open Source Contributors

### 🏗 Architecture Overview

MoneyTrack is divided into two main components:
1. **Backend (`Bun` + `Telegraf` + `Express/API`):** Handles the Telegram Bot webhooks, OpenAI natural language processing, Gmail parsing, and database transactions.
2. **Frontend (`Next.js 15`):** A sleek dashboard showcasing real-time financial telemetry, built with React 19, Tailwind CSS 4, Framer Motion, and GSAP.

### ✨ Key Features
- **Natural Language Parsing:** Send text to the Telegram bot; the OpenAI integration extracts the amount, category, entity, and payment method effortlessly.
- **Automated Email Drafts:** Detects bank alert emails, parses them, and sends a Telegram inline keyboard prompt to `Approve`, `Edit`, or `Discard`.
- **Live Dashboard:** Real-time metrics on Outflow, Inflow, Network Exposure (Loans/Debts), and Category Distribution.
- **Relational Data:** Handles complex tracking for Lent/Borrowed money, including parent/child transactions for partial payments and settlements.

### 🛠 Tech Stack
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Database ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
- **AI / LLM:** OpenAI API
- **Bot Framework:** [Telegraf](https://telegraf.js.org/)
- **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router), React 19
- **Styling & Animation:** Tailwind CSS v4, Framer Motion, GSAP, Lucide React

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed locally.
- A PostgreSQL database connection string.
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather)).
- An OpenAI API Key.
- Google OAuth credentials (for Gmail integration).

### 1. Clone the Repository
```bash
git clone https://github.com/aditya-krm/AI-Powered-Personal-Expense-Auditor.git
cd AI-Powered-Personal-Expense-Auditor
```

### 2. Environment Setup
Create a `.env` file in the root directory and populate it:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/moneytrack
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
MY_TELEGRAM_ID=your_personal_telegram_chat_id
OPENAI_API_KEY=sk-your-openai-api-key
ADMIN_KEY=your_secure_dashboard_password
PORT=1337

# For Email Parsing (Optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:1337/auth/google/callback
GMAIL_TOPIC_NAME=your_pubsub_topic_name
```

### 3. Database Initialization
Generate the Prisma client and push the schema to your database:
```bash
bunx prisma generate
bunx prisma db push
```

### 4. Running the Backend
Install dependencies and run the development server:
```bash
bun install
bun dev
```
*The bot is now online and listening to your Telegram messages!*

### 5. Running the Frontend Dashboard
Open a new terminal, navigate to the frontend folder, and start the Next.js app:
```bash
cd frontend
npm install
npm run dev
```
*Access the Live Dashboard at `http://localhost:3000`.*

---

## 🤝 Contributing

We welcome contributions! Whether it's a bug fix, new feature, or documentation improvement, please feel free to open a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request