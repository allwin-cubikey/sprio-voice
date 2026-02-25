# Sprio Voice Platform

A voice AI platform for building, deploying and monitoring AI phone assistants.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for analytics
- **React Router v6**

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs to /dist
npm run preview    # preview production build
```

## Demo Credentials

| Role  | Email | Password |
|-------|-------|----------|
| User  | `demo@sprio.io` | `demo1234` |
| Admin | `admin@sprio.io` | `admin1234` |

## Project Structure

```
src/
├── admin/          # Admin portal (layout + 7 pages)
├── components/     # Shared UI components
├── pages/          # User-facing pages
├── store/          # Zustand stores (auth, assistants, calls, UI)
└── data/           # Mock data
```

## Key Routes

| Path | Description |
|------|-------------|
| `/dashboard` | Main dashboard |
| `/assistants` | Assistant builder |
| `/calls` | Call logs |
| `/analytics` | Analytics + sentiment analysis |
| `/admin` | Admin console (admin only) |
