# ResumeAI – AI-Powered Career Platform

> Semantic search + RAG pipeline + generative AI + knowledge graph to help job seekers land their next role faster.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://render.com)

---

## What is ResumeAI?

ResumeAI is a full-stack AI career platform that combines **vector embeddings**, **semantic search**, **graph-based recommendations**, and a **RAG (Retrieval-Augmented Generation) pipeline** to help job seekers tailor their resumes, generate cover letters, prepare for interviews, and discover matching job opportunities — all powered by Google Gemini.

---

## Architecture Overview

```
User Upload (PDF/DOCX/TXT)
      │
      ▼
Text Extraction
      │
      ▼
Embedding Generation (Gemini)
      │
 ┌────┴────────────┐
 ▼                 ▼
MongoDB         Qdrant
(metadata)     (vectors)
   │              │
   └──────┬───────┘
          ▼
Vector Search (semantic similarity)
          │
          ▼
Retrieved Chunks (top-k)
          │
          ▼
Prompt + Context → Gemini → AI Output
          │
          ▼
Neo4j Knowledge Graph (skill recommendations)
          │
          ▼
Return tailored resume + graph insights

```

---

## Features

### Resume Upload & Management
Upload PDF, DOCX, or TXT files. The system extracts text, chunks it, generates embeddings, and stores metadata in MongoDB with vectors in Qdrant.

### Semantic Resume Search
Describe your ideal candidate or role in plain English. The app embeds the query and performs vector similarity search to return the most relevant resumes from your collection.

### AI Resume Tailoring (RAG + Knowledge Graph)
Paste a job description. The system:
1. Extracts skills from the JD and your resume
2. Queries Neo4j for related skills (skill co‑occurrence graph)
3. Embeds the JD and resume, retrieves relevant chunks
4. Injects both retrieved context and graph insights into a structured prompt
5. Returns a tailored resume with match score, key changes, suggestions, and a collapsible graph insights section showing related skills

### Cover Letter Generator
Generate a personalised cover letter grounded in your actual resume content and the job description. Save, copy, or export as PDF.

### Interview Insights
Get 10 technical and behavioural questions tailored to the specific role and your resume profile. Save question sets for later practice.

### Job Matcher
Add job descriptions manually. The system embeds them (rate-limited to 10/day) and matches against your resume using vector similarity scores.

### Knowledge Graph Skill Recommendations
A Neo4j graph stores skill relationships (e.g., `React → Redux`, `Node.js → Express`). When a job description mentions certain skills, the graph returns related skills that are not already present, providing data‑driven suggestions for career growth.

### Dashboard
Central view of all saved tailored resumes, cover letters, and interview question sets. See match scores, AI analysis, and graph‑derived skill insights.

### PDF Export
Download any generated content as a PDF using `html2pdf.js`.

### Dark / Light Theme
Toggle between themes with preference persisted in localStorage.

### Secure Authentication
JWT + HTTP-only cookie auth with Redis-backed token blacklisting for instant logout/revocation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Framer Motion, React Router, Axios, html2pdf.js |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Redis, Qdrant, Bull MQ, Neo4j |
| **AI** | Google Gemini API (embeddings + content generation) |
| **Storage** | Cloudinary (files), MongoDB (metadata), Qdrant (vectors), Neo4j (knowledge graph) |
| **Auth** | JWT, bcrypt, HTTP-only cookies, Redis token blacklist |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Key Engineering Decisions

**Why Qdrant?**  
Qdrant offers efficient approximate nearest neighbour (ANN) search with metadata filtering — critical for per-user vector isolation without cross-contaminating search results across accounts.

**Why Neo4j?**  
Skill relationships are inherently graph‑shaped. Neo4j allows us to traverse connections (e.g., “people with React also know Redux”) and feed those insights into the RAG pipeline, turning raw data into actionable recommendations.

**Why Bull MQ?**  
Embedding generation and LLM calls are slow. Offloading them to a job queue decouples the API response from the heavy lifting, enabling retries, progress tracking, and graceful failure handling.

**Why RAG over naive prompting?**  
Injecting retrieved resume and JD chunks as context grounds the LLM output in the user's actual content, reducing hallucination and improving relevance. Chunk size is tuned to 300–500 tokens with 50-token overlap to preserve sentence boundaries.

**Rate limiting**  
Per-user rate limiting on embedding endpoints (10 JD embeddings/day) prevents API cost overrun while keeping the free tier viable.

**Auth security**  
Token blacklisting in Redis ensures that logout is immediate and stateless JWTs cannot be replayed after revocation.

---

## Project Structure


```
resume-ai/
├── frontend/ # React application
│ ├── src/
│ │ ├── components/
│ │ └── utils/
│ ├── public/
│ └── package.json
├── backend/ # Node.js + Express API
│ ├── controllers/ # Route handlers
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express routers
│ ├── services/ # Business logic (embeddings, RAG, LLM, Neo4j)
│ ├── config/ # DB, Redis, Qdrant, Neo4j connections
│ ├── queues/ # Bull MQ job definitions
│ ├── middleware/ # Auth, rate limiting, error handling
│ ├── validators/ # Input validation (express-validator)
│ ├── tests/ # Jest + Supertest
│ └── index.js
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- Qdrant (cloud)
- Neo4j (AuraDB free tier)
- Google Gemini API key
- Cloudinary account

### Environment Variables

```env
# Backend
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_PASS=your_redis_password
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
DAILY_EMBEDDING_LIMIT=10
NEO4J_URI=your_neo4j_uri
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Frontend
VITE_API_URL=http://localhost:3000
### Installation

# Clone the repo
git clone https://github.com/yourusername/resume-ai.git
cd resume-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Seed Neo4j graph (one time)
cd backend && node scripts/seedNeo4j.js

# Start backend
npm run dev

# Start frontend (in another terminal)
cd frontend && npm run dev

---

Roadmap
Retrieval evaluation metrics (precision@k, relevance scoring)

Streaming LLM responses to frontend

Re-ranking retrieved chunks with cross-encoder

Observability dashboard (job durations, queue depth, failure rates)

Graph update via user feedback (e.g., “this skill recommendation was helpful”)

External job API integration (Adzuna) to auto‑populate job matcher

---