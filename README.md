# ragsume-ui

## Overview
`ragsume-ui` is a modern web UI built with **Next.js** and **TypeScript** that provides an interactive interface for the RAGsume project. It includes a chat widget, loading spinners, and a job‑description matcher component, all styled with Tailwind CSS and ready for deployment on Vercel or any Node.js server.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
   - [Clone the Repository](#clone-the-repository)
   - [Install Dependencies](#install-dependencies)
   - [Run the Development Server](#run-the-development-server)
3. [Project Structure](#project-structure)
4. [Key Components](#key-components)
5. [Environment Variables](#environment-variables)
6. [Building for Production](#building-for-production)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [License](#license)

---

## Prerequisites
Make sure you have the following installed on your machine:

| Tool | Minimum Version |
|------|-----------------|
| Node.js | `20.x` |
| npm | `10.x` (comes with Node) |
| Git | any recent version |

The project uses **Next.js 14** with the new `app/` directory structure, so a recent Node version is required.

---

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/your-org/ragsume-ui.git
cd ragsume-ui
```

### Install Dependencies
```bash
npm ci
```
`npm ci` ensures a clean, reproducible install based on `package-lock.json`.

### Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` – the app should load with hot‑module reloading enabled.

---

## Project Structure
```
app/                # Next.js app router (pages, layout, globals)
├─ layout.tsx       # Root layout with global CSS and metadata
├─ page.tsx         # Home page entry point
└─ globals.css      # Global Tailwind styles

components/         # Re‑usable UI components
├─ chat/            # Chat widget and related UI
│  ├─ ChatWidget.tsx
│  ├─ LoadingSpinner.tsx
│  ├─ MessageBubble.tsx
│  └─ SourceTrace.tsx
├─ matcher/         # JDMatcher component for job‑description matching
│  └─ JDMatcher.tsx

lib/                # Helper utilities and API wrappers
├─ api.ts           # Functions that call the backend RAG API
├─ sse.ts           # Server‑sent events handling
└─ types.ts         # TypeScript type definitions

public/             # Static assets (logo, favicons, etc.)
```

---

## Key Components

### `ChatWidget`
The main chat interface located at `components/chat/ChatWidget.tsx`. It handles user input, displays messages, and streams responses from the backend via Server‑Sent Events.

### `LoadingSpinner`
Simple spinner component (`components/chat/LoadingSpinner.tsx`) shown while awaiting a response.

### `JDMatcher`
Component (`components/matcher/JDMatcher.tsx`) that lets users paste a job description and get a similarity score against a resume.

---

## Environment Variables
Create a `.env.local` file at the project root for any secret keys required by the backend API. Example:
```
NEXT_PUBLIC_API_BASE_URL=https://api.ragsume.com
```
The UI reads `NEXT_PUBLIC_` prefixed variables at build time.

---

## Building for Production
```bash
npm run build   # Generates an optimized production build in .next
npm start       # Starts the production server
```
The build step includes TypeScript type‑checking, ESLint linting, and CSS minification.

---

## Testing
The repository currently does not include a test suite, but you can add Jest or React Testing Library tests under a `__tests__/` directory. A typical command would be:
```bash
npx jest
```

---

## Deployment
Deploy to Vercel (recommended) by connecting the GitHub repository and selecting the default build command (`npm run build`). For other platforms, ensure the `NODE_ENV` is set to `production` and serve the `.next` directory with a Node server.

---

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Make your changes and ensure the app still builds.
4. Open a Pull Request describing the changes.

Please follow the existing code style (Prettier + ESLint) and include TypeScript typings for any new modules.

---

## License
This project is licensed under the MIT License – see the `LICENSE` file for details.
