# LifeOS - Preventive Health Intelligence Platform

> **Major Project** submitted in partial fulfillment of the requirements for the degree at **Sai Vidya Institute Of Technology**.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5.0-119eff?style=flat-square&logo=capacitor)](https://capacitorjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 🏛️ Academic Affiliation

| Detail | Information |
| :--- | :--- |
| **Institution** | **Sai Vidya Institute Of Technology** |
| **Project Type** | **Major Project** |
| **Platform** | LifeOS Frontend (Web & Mobile) |
| **Focus Area** | Preventive Healthcare, Machine Learning Risk Stratification, Digital Health Twins & Multi-Agent AI Coaching |

---

## 🌟 Overview

**LifeOS** is an intelligent, preventive healthcare decision-support and lifestyle management ecosystem designed to identify health risks long before disease patterns take hold. 

By unifying multi-condition machine learning models, explainable AI (SHAP-based feature attribution), digital health twin modeling, real-time sensor ingestion, and a conversational AI coach, LifeOS empowers users and clinicians to make proactive, evidence-based lifestyle interventions.

This repository houses the **LifeOS Frontend**, a modern web application and hybrid mobile client built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Capacitor**.

---

## ✨ Key Features

### 1. 🩺 Multi-Condition Risk Prediction & Clinical Assessment
- **Explainable Lifestyle Risk Models**: Stratify risk for chronic lifestyle conditions including:
  - **Type 2 Diabetes**
  - **Cardiovascular / Heart Disease**
  - **Hypertension**
  - **Obesity & Metabolic Syndromes**
  - **Chronic Kidney Disease (CKD)**
- **Explainable AI (XAI)**: Visualizes feature attribution and contributing risk factors to ensure decisions remain transparent, interpretable, and clinician-friendly.
- **Risk Fusion Engine**: Aggregates multi-organ risk scores into a unified health composite score.

### 2. 🤖 Multi-Agent AI Assistant & Personalized Coach
- **Conversational Health Coach**: Context-aware AI assistant delivering tailored recommendations, dietary adaptations, and habit nudges.
- **Service Boundaries**: Prediction, coaching, lifestyle recommendations, and IoT telemetry are structured cleanly across distinct agents.

### 3. 📊 Holistic Lifestyle & Wellness Tracking
- **Stress Intelligence V2**: Advanced biometric and subjective stress tracking, autonomic nervous system indicators, and wellness scoring.
- **Sleep Architecture & Sleep Debt**: Sleep quality tracking, debt computation, and restorative phase analysis.
- **Activity & Metabolic Calculator**: Calorie expenditure calculation, METs breakdown, and activity goals.
- **Nutrition Analytics**: Micro- and macro-nutrient logging, dietary balance metrics, and intelligent meal insights.

### 4. 📈 Interactive Demo Lab & Clinical Reports
- **Demo Lab**: Real-time simulation testing with benchmark datasets (Pima Indians Diabetes, Framingham Heart Study, NHANES, UCI CKD).
- **Model Inspection**: View model metrics, confusion matrices, ROC curves, and sensitivity/robustness evaluations.
- **Export & PDF Reports**: Generate comprehensive health assessment summaries and clinical PDFs.

### 5. 📱 Cross-Platform Hybrid Mobile Client (Capacitor)
- Packaged as a native **Android application** (`com.lifeos.health`) using Capacitor.
- Integrated **native push and local notifications** (`@capacitor/local-notifications`) for health nudges, medication alerts, and assessment reminders.

### 6. 🎨 Modern Glassmorphic SaaS Interface
- Polished, responsive user experience utilizing glassmorphism, Framer Motion animations, Recharts data visualizations, and Tailwind CSS.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15.1.7](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: [React 19.0.0](https://react.dev/)
- **Language**: [TypeScript 5.5.4](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4.10](https://tailwindcss.com/) with PostCSS & Autoprefixer
- **Motion & Animations**: [Framer Motion 11.3.30](https://www.framer.com/motion/)
- **Charts & Visualizations**: [Recharts 2.12.7](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Data Fetching**: [TanStack React Query 5.51.1](https://tanstack.com/query/latest) & [SWR 2.2.5](https://swr.vercel.app/)
- **Form Management & Validation**: [React Hook Form 7.52.2](https://react-hook-form.com/) + [Zod 3.23.8](https://zod.dev/)
- **Mobile Runtime**: [Capacitor 8.5.0](https://capacitorjs.com/) (`@capacitor/android`, `@capacitor/core`, `@capacitor/local-notifications`)
- **Containerization**: [Docker](https://www.docker.com/) (Node 20 Alpine)

---

## 📁 Repository Structure

```text
lifeos_frontend/
├── android/                   # Capacitor native Android project
├── app/                       # Next.js 15 App Router directory
│   ├── (app)/                 # Protected application routes
│   │   ├── activity/          # Activity tracking & METs calculator
│   │   ├── admin/             # System administration dashboard
│   │   ├── assessments/       # Health risk assessment forms & results
│   │   ├── assistant/         # Conversational AI assistant
│   │   ├── coach/             # Personalized AI health coach
│   │   ├── dashboard/         # Main user health twin & wellness dashboard
│   │   ├── history/           # Historical health logs & report details
│   │   ├── notifications/     # Health alerts & user notifications
│   │   ├── nutrition/         # Nutrition logging & dietary analytics
│   │   ├── reports/           # Demo Lab, datasets, model performance & system health
│   │   ├── sensors/           # Telemetry & IoT sensor integration
│   │   ├── settings/          # User preferences & account configuration
│   │   ├── sleep/             # Sleep quality & sleep debt analytics
│   │   └── stress/            # Stress Intelligence V2 module
│   ├── (auth)/                # Authentication routes (login, register, forgot-password)
│   ├── globals.css            # Tailwind & global glassmorphic design tokens
│   ├── layout.tsx             # Root layout and theme providers
│   └── page.tsx               # LifeOS landing page
├── components/                # Reusable UI component library
│   ├── charts/                # Recharts wrappers & custom data graphs
│   ├── dashboard/             # Dashboard widgets & metric cards
│   ├── forms/                 # Form inputs, selectors, and assessment controls
│   ├── layout/                # Navbars, sidebars, headers & page wrappers
│   └── ui/                    # Primitive design system components (buttons, cards, badges)
├── lib/                       # Core utility functions & state helpers
│   ├── api.ts                 # Type-safe API client for backend communication
│   ├── demo-lab-data.ts       # Benchmark lab datasets & mock fixtures
│   ├── mappers/               # Clinical data normalization & request mappers
│   ├── services/              # Notification & client-side helper services
│   ├── types.ts               # Shared TypeScript schemas & interfaces
│   └── utils.ts               # Styling helpers (clsx, twMerge) & URL utilities
├── capacitor.config.json      # Capacitor mobile bridge configuration
├── Dockerfile                 # Container specification for production deployment
├── next.config.mjs            # Next.js build & routing configuration
├── tailwind.config.ts         # Tailwind design tokens & theme configuration
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher recommended
- **npm**: v10.x or higher
- **Android Studio** (optional, for native Android builds via Capacitor)

### 1. Installation

Clone the repository and install project dependencies:

```bash
git clone <repository-url>
cd lifeos_frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env.local
```

Configure your backend API base URL:

```env
# LifeOS Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

*(For production, point `NEXT_PUBLIC_API_BASE_URL` to your live API instance).*

### 3. Development Server

Start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Production Build

To test or generate a production build:

```bash
npm run build
npm run start
```

---

## 🐳 Docker Deployment

The application is containerized using Docker:

```bash
# Build the Docker image
docker build -t lifeos-frontend:latest .

# Run the container on port 3000
docker run -d -p 3000:3000 --name lifeos-frontend-app lifeos-frontend:latest
```

---

## 📱 Mobile App (Android via Capacitor)

LifeOS can be built and deployed as a native Android application:

1. **Build the static web output**:
   ```bash
   npm run build
   ```

2. **Sync the web build to the native Android container**:
   ```bash
   npx cap sync android
   ```

3. **Open the project in Android Studio**:
   ```bash
   npx cap open android
   ```

From Android Studio, you can test on an Android emulator or build the release APK/AAB.

---

## 🔬 Clinical Disclaimer

LifeOS is an academic research and engineering prototype built as a **major project at Sai Vidya Institute Of Technology**. It is intended solely for **preventive lifestyle guidance, health literacy, and clinical decision support**. It does not constitute a certified medical diagnosis and should not replace professional medical advice, diagnosis, or treatment.

---

## 🎓 Academic Credits & Acknowledgments

- **Institution**: **Sai Vidya Institute Of Technology** (SVIT)
- **Project**: Major Project
- We express our sincere gratitude to our project guides, faculty members, and the Department at Sai Vidya Institute Of Technology for their guidance and support throughout the design and realization of this project.
