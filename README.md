# 📊 FinanceFlowAI

**FinanceFlowAI** is a premium, secure, and end-to-end digital banking and micro-lending portal built to digitize and scale the lending operations of **Bhalchandra Finance Pvt Ltd** (Jintoor, Parbhani, Maharashtra). 

The platform features a modern, responsive user portal with interactive calculators, active investment booking, and a secure KYC document vault, coupled with an advanced administration dashboard for real-time portfolio tracking, instant underwriting, and context-aware multilingual voice AI support.

---

## 🚀 Key Features

### 👤 Customer Portal & Dashboard
- **Dual-Tab Layout**:
  - **Account Overview**: Real-time stats showing active loans, outstanding dues, and a smooth amortization timeline tracking installment milestones.
  - **KYC & Document Vault**: An encrypted file vault displaying the audit status of submitted Aadhaar cards, PAN cards, and salary slips, alongside a drag-and-drop file upload container.
- **Smart Financial Calculators**:
  - **EMI & Gold Loan Calculators**: Computes monthly schedules and redirects to loan application forms with pre-filled amounts and tenures.
  - **Fixed Deposit (FD) Booking**: Real-time calculator to open active FD investments directly yielding statistics updates on the administration board.
- **Secure Card Repayments**: Checkout gateway validating 10-digit registered mobile numbers with secure browser alerts simulating SMS OTP verification (`123456`).
- **Header Notifications Center**: Scrollable notification bell drawer dispatching system alerts, payment logs, and approval warnings, running on lightweight api polling.

### 👑 Administration Control Center
- **Real-Time KPI Tracking**: Monitors total active users, gross loan volume, overall outstanding bank debt (excluding FDs), and target investment metrics.
- **Filtered Live Ledger**: Console listing pending approvals and active accounts, searchable by Customer Name, Email, App Code, or Loan Schemes, and filterable by status.
- **Underwriting KYC Dialog**: Admin review drawer showing employment details, guarantor summaries, monthly income limits, and clickable KYC verification file lists.
- **Reports & Exports**: 
  - **Export CSV**: Instant downloads of transaction ledgers.
  - **Generate PDF**: Direct browser viewport reports rendering active statistics and Recharts SVG graphics while ignoring screen buttons.

### 🤖 Context-Aware Voice AI Assistant (Intercom Style)
- **Persistent Bottom-Right FAB**: Locked to the viewport using React Portals, morphing smoothly between the chat icon and close (`X`) buttons on open/close transitions.
- **Multilingual Support**: Supports queries in **English**, **Hindi (Hinglish)**, and **Marathi**.
- **Voice Recognition (STT)**: Integrated Web Speech API microphone input with language toggle buttons (`ENG` | `हिंदी` | `मराठी`) and auto-send features.
- **Vocal Readback (TTS)**: Native browser voice synthesis (`speechSynthesis`) dynamically matching languages (utilizing Devanagari pronunciation profiles for Hindi/Marathi).
- **Rule-Engine Fallback**: Offline fallback logic to ensure continuous support on financial topics even if external OpenAI connections are missing.

---

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons, Recharts (SVG Charting).
- **Backend**: Node.js, Express, Postgres (Neon Serverless database client), Drizzle ORM.
- **AI Engine**: OpenAI API (`gpt-4o-mini` model) with native browser Web Speech listeners.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- A Neon PostgreSQL Database Instance (or any PostgreSQL connection string)
- OpenAI API Developer Key (Optional, fallback mock assistant provided)

### 2. Environment Configurations
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_database_connection_string
JWT_SECRET=your_super_secure_jwt_token_secret
OPENAI_API_KEY=your_optional_openai_api_developer_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migration
Push schema models to your live Neon database client:
```bash
npm run db:push
```

### 5. Running the Application
Start the development backend and Vite frontend hot reload servers:
```bash
npm run dev
```

### 6. Building for Production
To compile clean static builds:
```bash
npm run build
```

---

## 📁 Repository Structure
```
├── backend/            # Express server API endpoints and OpenAI Service
├── frontend/src/       # React layouts, charts, dashboards, and AI ChatBot
│   ├── components/     # UI elements (Header, ChatBot, Modals)
│   ├── pages/          # Layout pages (Hero, Calculators, Dashboards)
│   └── lib/            # TanStack Query configurations
├── shared/             # Drizzle database pgTable schemes
└── package.json        # Project scripts and configurations
```

---

## 🛡️ License
Proprietary operational systems configured for **Bhalchandra Finance Pvt Ltd**.
