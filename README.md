<div align="center">
  <a href="https://veralogix.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://iili.io/KUXIzXV.png">
      <source media="(prefers-color-scheme: light)" srcset="https://iili.io/KUXIxzQ.png">
      <img alt="Veralogix Logo" src="https://iili.io/KUXIxzQ.png" width="300">
    </picture>
  </a>
  
  <br />

  # VeraLogix SecureConnect™

  **Proactive Autonomous Security Ecosystem & Smart Community Platform**

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
  [![POPIA Compliant](https://img.shields.io/badge/Compliance-POPIA-success.svg)]()
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

  *VeraLogix SecureConnect empowers estates, property managers, and security teams with AI-driven access control, automated incident resolution, and seamless resident experiences.*

  ⭐ **Please Star this repository if you find it valuable!** ⭐
</div>

---

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Key Features](#-key-features)
- [See It In Action](#-see-it-in-action)
- [How VeraLogix Transforms Communities](#-how-veralogix-transforms-communities)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [CI](#-ci)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License & Community](#-license--community)

---

## 🚀 Quick Start

Getting started with the VeraLogix SecureConnect prototype environment is simple. 

### Prerequisites
- Node.js 20+
- Docker (for the self-hosted backend stack)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/VeralogixCatalyst/VeraLogix-SecureConnect-App.git
cd VeraLogix-SecureConnect-App

# 2. Install dependencies (frontend + backend workspaces)
npm install

# 3. Configure Environment
cp .env.example .env.local
cp backend/.env.example backend/.env

# 4. Start backend stack (Postgres, Keycloak, Redis, MinIO, API)
npm run docker:up

# 5. Migrate + seed (from another terminal if API container already migrates)
npm run db:migrate
npm run db:seed

# 6. Start the Next.js app
npm run dev
```

> App UI: `http://localhost:9002` · API docs: `http://localhost:3000/docs`  
> See [`backend/README.md`](backend/README.md), [`docs/ci.md`](docs/ci.md), [`docs/secrets.md`](docs/secrets.md), and [`docs/migration-firebase.md`](docs/migration-firebase.md).

Demo login (Keycloak): `admin@veralogix.com` / `secureconnect`  
Local API bypass: set `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` and `DEV_AUTH_BYPASS=true`.

---

## 🧪 CI

GitHub Actions runs typecheck, backend unit tests/coverage, and a **CI Health** aggregator on `main` / PRs. No secrets are required.

```bash
npm ci
npm run typecheck
npm test --workspace=@veralogix/secureconnect-api
```

Full local parity, troubleshooting, and branch-protection check names: [`docs/ci.md`](docs/ci.md).  
Full architecture/product audit (2026-07-24): [`docs/COMPREHENSIVE_REPO_ANALYSIS.md`](docs/COMPREHENSIVE_REPO_ANALYSIS.md).

---

## ⚡ Key Features

- 🛡️ **Agent Command Center (CMD):** A holistic, real-time dashboard for security agents to monitor live access streams, handle perimeter breaches, and manage visitor flows.
- 📱 **Resident App (TEN):** Empowers residents with digital keys (Tap-to-Open), visitor pass generation, digital wallets, and maintenance requests.
- 🏛️ **Trustee Portal (TRU):** High-level governance, voting resolutions, and financial oversight for estate trustees and HOA members.
- 🔧 **Vendor Portal (VEN):** Seamlessly converts maintenance tickets into actionable work orders, complete with invoicing and evidence handover.
- 🤖 **Autonomous AI Agents:** Genkit-powered micro-agents that automatically summarize security incidents, predict maintenance failures, and draft response protocols.

---

## 🎥 See It In Action

### Walkthrough Video
Watch a comprehensive 5-minute deep dive into the platform's capabilities:

<div align="center">
  <a href="https://www.youtube.com/watch?v=VIDEO_ID">
    <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="VeraLogix Walkthrough Video" width="800"/>
  </a>
  <br/>
  <em>Click above to watch the VeraLogix Platform Walkthrough</em>
</div>

### Visual Gallery

#### 1. Agent Command Center
*Live telemetry, door status monitoring, and instant incident response for security personnel.*
<div align="center">
  <img src="docs/screenshots/cmd-dashboard.png" alt="Command Center Dashboard" width="800" />
</div>

#### 2. Resident Digital Keys
*Frictionless mobile access, Tap-to-Open functionality, and secure visitor pass management.*
<div align="center">
  <img src="docs/screenshots/resident-keys.png" alt="Resident Digital Keys" width="800" />
</div>

#### 3. Trustee Governance & Resolutions
*Transparent voting and financial oversight for estate management.*
<div align="center">
  <img src="docs/screenshots/trustee-portal.png" alt="Trustee Portal" width="800" />
</div>

#### 4. Vendor Work Orders
*End-to-end maintenance tracking from ticket creation to invoice submission.*
<div align="center">
  <img src="docs/screenshots/vendor-orders.png" alt="Vendor Work Orders" width="800" />
</div>

---

## 🏛️ How VeraLogix Transforms Communities

VeraLogix SecureConnect is built from the ground up to solve the fragmented security and communication problems in modern estates and smart communities.

### Before vs. After VeraLogix

| Metric | Before VeraLogix | After VeraLogix |
|--------|-----------------|-----------------|
| **Access Control** | Disconnected physical remotes, vulnerable to cloning. | **Secure Digital Keys** with real-time revocation and audit trails. |
| **Incident Response** | Manual logbooks and delayed radio communication. | **Instant AI Summarization** and automated SOP protocols for agents. |
| **Data Privacy** | Unsecured physical visitor books risking POPIA violations. | **100% POPIA Compliant** cloud infrastructure with strict RBAC. |
| **Maintenance** | Messy email chains between residents, trustees, and vendors. | **Unified Workflow Pipeline** tracking tickets, evidence, and payments. |

### Targeted Impact
- **For Property Managers:** Drastically reduce administrative overhead. Automate the generation of incident reports and maintenance logs.
- **For Security Teams:** Transition from reactive guarding to proactive, AI-assisted monitoring.
- **For Residents:** Experience true frictionless living with mobile-first access and transparent community governance.

---

## 🛠️ Architecture & Tech Stack

VeraLogix SecureConnect utilizes a highly scalable, modern, and self-hosted open-source stack (no Firebase):

```mermaid
graph TD
    A[Next.js App Router UI] --> B(Backend Client SDK)
    B --> C[Fastify API]
    C --> D[Postgres + Realtime NOTIFY]
    C --> E[Keycloak OIDC]
    C --> F[MinIO S3]
    C --> G[Redis / BullMQ Workers]
```

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 18, Tailwind, shadcn/ui |
| API | Fastify 5, Zod, OpenAPI |
| Auth | Keycloak (self-hosted) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Realtime | LISTEN/NOTIFY + WebSockets |
| Storage | MinIO |
| Jobs | BullMQ + Redis |
| Edge | Caddy |
| Observability | Prometheus + Grafana (optional profile) |

---

## 🗺️ Roadmap

- [x] High-Fidelity UI Scaffolding & Shared Components
- [x] Self-hosted backend (Keycloak + Postgres + MinIO + BullMQ) replacing Firebase
- [x] RBAC, POPIA export/deletion, OpenAPI, Docker Compose
- [x] Frontend cutover for auth, doors, and access logs
- [ ] Wire remaining portal pages to live CRUD APIs
- [ ] Optional Genkit AI flows (independent of Firebase)
- [ ] Expand automated coverage toward ≥85% on all backend modules

---

## 🤝 Contributing

We welcome contributions from the community to help us build the future of smart access!

Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and set up your development environment.

---

## ⚖️ License & Community

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Join the movement for frictionless access and intelligent community operations.**
- 📧 Contact us: [admin@veralogix.com](mailto:admin@veralogix.com)
- 🌐 Website: [veralogix.com](https://veralogix.com)

<div align="center">
  <sub>Built with precision in South Africa.</sub>
</div>
