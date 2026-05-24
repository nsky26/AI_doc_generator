# AI Document Generator

AI-powered document and content generation suite built with **React 19**, **TypeScript**, **Vite**, **Express 5**, and **Google Gemini 2.5-flash**.

> This project is **open source** — contributions, issues, and feature requests are welcome! Star ⭐ this repository, fork it, or submit a pull request.

---

## ✨ Features

### 🏠 Dashboard — Document Generator
Full glassmorphism document generator with:
- **Text prompt** input
- **Image attachment** (PNG/JPG/WEBP up to 5 MB)
- **File attachment** (TXT/MD/CSV up to 2 MB)
- **Voice input** via Web Speech API (Chrome/Edge)
- **8 document types**: Auto, Report, Email, Essay, Letter, Summary, Proposal, Meeting Notes, Blog Post

### 💬 AI Chatbot (`/chatbot`)
Full-page ChatGPT-style interface:
- Permanent left-side chat history panel
- Multi-session support with auto-titling
- Image attachment support (multimodal)
- Suggested prompt chips on empty state
- Copy button on every AI response

### 🛠️ Utility Tools

| Tool | Route | Description |
|---|---|---|
| Text Summarizer | `/summarizer` | 3–5 bullet point summaries |
| Tone Converter | `/tone-converter` | Professional / Friendly / Formal / Casual |
| Caption Generator | `/caption-generator` | Instagram, LinkedIn, General captions |
| Resume Booster | `/resume-booster` | Metrics-driven achievement bullets |
| Certificate Writer | `/certificate-generator` | Formal award citations with download |
| Theme Suggestion | `/theme-suggestions` | Color palette, fonts, CSS background |

---

## 🎨 UI Design

- **Space background** — Canvas-rendered animated stars + drifting asteroids on every page
- **Nebula blobs** — Animated violet/indigo/blue glow blobs behind all content
- **Glassmorphism** — `backdrop-blur` + semi-transparent cards throughout
- **Color palette** — Deep space `#03050f` base · Violet `#7c3aed` · Indigo `#4f46e5` accents
- **Sidebar** — Hamburger-triggered drawer on all screen sizes

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS (CDN), custom CSS animations |
| Backend | Express 5, tsx |
| AI | Google Gemini 2.5-flash (`@google/genai`) |
| Auth | Client-side localStorage session |
| Routing | React Router v7 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Install
```bash
npm install
```

### Configure
Create a `.env.local` file in the project root and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```
Get a free key at: https://aistudio.google.com/apikey

### Run
```bash
npm run dev
```
App runs at **http://localhost:3000**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         Navbar, Sidebar
│   └── shared/         Button, Card, Input, Textarea, Loader,
│                       CopyButton, ToolHeader, SpaceBackground
├── contexts/           Auth context + AuthGuard / GuestGuard
├── pages/              Dashboard, ChatbotPage, + 7 tool pages
│                       + LoginPage, SignUpPage, ProfilePage
├── routes/             AppRoutes.tsx (space bg + nebula + layout)
├── services/           gemini.ts — all 8 API calls
├── types/              Shared TypeScript interfaces
└── utils/              helpers, history, prompts, copy
server.ts               Express + Vite middleware + 8 AI API routes
```

---

## 🔑 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/chat` | Multimodal chat with history |
| POST | `/api/summarize` | Text summarization |
| POST | `/api/tone-convert` | Tone rewriting |
| POST | `/api/generate-captions` | Social media captions |
| POST | `/api/resume-boost` | Resume bullet enhancement |
| POST | `/api/certificate-generator` | Certificate citation |
| POST | `/api/theme-suggestion` | UI theme schema |
| POST | `/api/generate-document` | Full document generation |

---

## 📝 Notes

- Auth is local-only — credentials persist in `localStorage`
- Chat history is stored per user email in `localStorage`
- Voice input requires Chrome or Edge (Web Speech API)
- The sidebar is a hamburger-triggered drawer on all screen sizes
- All 8 API routes use `gemini-2.5-flash` model
