## ResumeAI – AI-Powered Career Platform
ResumeAI is a full‑stack web application that helps job seekers optimize their resumes, generate tailored cover letters, prepare for interviews, and match their profiles with relevant jobs. It leverages semantic search, vector embeddings (Qdrant), and generative AI (Gemini) to provide intelligent, personalised career support.

## ✨ Features
Resume Upload & Management
Upload PDF, DOCX, or TXT files. The system extracts text, generates embeddings, and stores them in MongoDB + Qdrant.

# Semantic Resume Search
Describe your ideal candidate in natural language. The app returns the most relevant resumes from your collection using vector similarity.

# AI Resume Tailoring
Paste a job description. The AI rewrites your resume to highlight matching skills, suggests improvements, and outputs a tailored version. You can save it with a custom name and description.

# Cover Letter Generator
Generate a personalised cover letter based on your resume and a job description. Save, copy, or export as PDF.

# Interview Insights
Get 10 technical/behavioural questions tailored to the job and your resume. Save the questions for later practice.

# Job Matcher
Add job descriptions manually (or via an external API). The system embeds them (up to 10 per day due to API limits) and matches them against your resume to show the best‑fitting opportunities.

# Dashboard
View all your saved tailored resumes, cover letters, and interview questions in one place. See match scores and detailed AI analysis.

# Dark / Light Theme
Toggle between themes – your preference is saved in localStorage.

# PDF Export
Download any generated content (tailored resume, cover letter) as a PDF.

# Secure Authentication
JWT + cookie‑based auth with token blacklisting using Redis.

## 🧰 Tech Stack
Frontend	React 18, Tailwind CSS, Framer Motion, React Router, Axios, html2pdf.js
Backend	    Node.js, Express, MongoDB (Mongoose), Redis, Qdrant (vector DB), Bull (queue)
AI Services	Google Gemini API (embeddings + content generation)
Storage	    Cloudinary (resume files), MongoDB (metadata), Qdrant (vectors)
Auth	    JWT, bcrypt, HTTP‑only cookies, Redis token blacklist
Deployment	Frontend: Vercel   |   Backend: Render


## 📁 Project Structure (Monorepo)
resume-ai/
├── frontend/               # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/                # Node.js + Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── config/
│   ├── index.js
│   └── ...
├── .gitignore
└── README.md