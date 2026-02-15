# Nalan - AI Smart Patient Triage System

Nalan is an advanced, AI-powered patient triage and healthcare management platform designed to streamline the assessment process for patients and healthcare providers. It features a multi-step chatbot-style triage flow, real-time risk classification, and multilingual support.

## 🚀 Key Features

### 1. Smart AI Triage
- **Chatbot Interface**: A patient-friendly conversational interface for symptom reporting.
- **Rule-Based Matching**: Local engine for rapid identification of common conditions.
- **AI Escalation**: Advanced analysis using OpenAI for high-risk or complex cases.
- **Symptom Autocomplete**: Intelligent search suggestions with immediate risk indicators.

### 2. Multi-Role Dashboards
- **Patient Dashboard**: View health history, medical records, and perform new assessments.
- **Doctor Portal**: Access a prioritized list of patient triage records and detailed medical history.
- **Admin Panel**: Manage facility-wide health insights and system configurations.

### 3. Multilingual & Inclusive
- **Language Support**: Seamlessly switch between **English**, **Tamil**, and **Hindi**.
- **Indic Language Optimization**: Built on `next-intl` for professional medical translations.

### 4. Emergency Ready
- **SOS Button**: Quick-access emergency trigger for immediate assistance.
- **Clear Guidance**: Precise "Dos" and "Don'ts" provided based on specific risk levels.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Shadcn UI
- **Backend**: Next.js Server Actions, NextAuth.js (Authentication)
- **Database**: Prisma ORM, SQLite (Default)
- **AI**: OpenAI API, Custom Symptom Matching Engine
- **I18n**: `next-intl` for Internationalization

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- OpenAI API Key (for advanced triage functionality)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shree1405/nalan.git
   cd nalan/temp_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the `temp_app` directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── actions/          # Server Actions for Triage, SOS, and Auth
│   ├── patient/          # Patient Dashboard and Triage Flow
│   ├── doctor/           # Doctor Management Portal
│   └── admin/            # Administrative Insights
├── components/           # Reusable UI components & Triage cards
├── lib/
│   ├── triage/           # Core Triage Logic (Engine, Data, AI)
│   ├── auth.ts           # Authentication configuration
│   └── db.ts             # Prisma client instance
├── messages/             # Localization JSON files (en, ta, hi)
└── types/                # TypeScript definitions
```

---

## 🛡 Disclaimer
Nalan is an AI-powered triage assistant. It is **not** a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health providers with any questions you may have regarding a medical condition. In case of a medical emergency, use the SOS button or contact emergency services immediately.

---

## 📝 License
This project is for demonstration and healthcare hackathon purposes. All rights reserved.
