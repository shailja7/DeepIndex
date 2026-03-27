# DeepIndex: Semantic AI Video Search Engine 🌿✨

**DeepIndex** is a "Cottagecore Tech" search platform that enables research-focused video exploration. Unlike traditional keyword searches, DeepIndex uses **Neural Embeddings** to understand the *meaning* of what’s being said, allowing you to find specific moments in a video using natural language.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7B9E72?style=for-the-badge)](https://deep-index.vercel.app/)

---

## 🌻 Key Features

- **Semantic Neural Search**: Search for concepts, not just words. (e.g., search for "renewable energy" to find a segment discussing solar panels).
- **AI Transcription**: Integrated with **OpenAI Whisper** for high-precision audio-to-text conversion.
- **RAG for Video**: Uses a **Pinecone Vector Database** to store and retrieve semantic embeddings for instant navigation.
- **"Cottagecore Tech" Aesthetic**: A warm, unique UI inspired by hand-drawn notebooks, built with **Framer Motion** for smooth interactions.
- **The Buzz & Notebook Summaries**: AI-generated "Vibe Checks" and key takeaways for every video.

---

## 🛠️ The Tech Stack

### Frontend
- **React 19 + Vite** (Fast, modern SPA)
- **Tailwind CSS** (Utility-first styling)
- **Framer Motion** (Whimsical micro-animations)
- **Lucide-React** (Aesthetic icons)

### Backend
- **Node.js & Express** (Scalable API)
- **MongoDB + Mongoose** (Video metadata storage)
- **Pinecone** (Vector searching & neural indexing)
- **OpenAI API** (Whisper transcription & GPT summaries)

---

## 🚀 Local Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/shailja7/DeepIndex.git
   cd DeepIndex
   ```

2. **Backend Configuration**:
   - Navigate to `backend/` and run `npm install`.
   - Create a `.env` file with your `MONGODB_URI`, `OPENAI_API_KEY`, and `PINECONE_API_KEY`.
   - Run `npm start`.

3. **Frontend Configuration**:
   - Navigate to `frontend/` and run `npm install`.
   - Run `npm run dev`.

---

## 👩‍💻 Project Purpose
Built as a high-impact portfolio piece to demonstrate competence in **asynchronous media processing**, **vector databases**, and **Aesthetic UI Development**.

---
> [!NOTE]
> *“Find what you need, like a bee finding the perfect flower.”* 🌻🐝
