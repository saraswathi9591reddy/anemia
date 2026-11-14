# AnemiaAI — AI-Based Early Detection and Screening of Anemia During Pregnancy

AnemiaAI is a clinical rule-based preliminary screening and health monitoring web application for pregnant women based on official **WHO 2011 guidelines (WHO/NMH/NHD/MNM/11.1)**.

---

## Tech Stack
- **Frontend**: React 19, Vite 8, React Router DOM 7, Recharts, Lucide React, Tesseract.js, PDF.js
- **Backend**: Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Helmet, Multer, PDFKit
- **Database**: MongoDB

---

## Getting Started on Windows

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port 27017

### 2. Run the Backend
Open a PowerShell terminal:
```powershell
cd "C:\Users\Suresh Reddy\OneDrive\Desktop\anemia-project\backend"
npm install
npm start
```
The backend API will run on `http://localhost:5000`.  
Check health status: `http://localhost:5000/api/health`.

### 3. Run the Frontend
Open a second PowerShell terminal:
```powershell
cd "C:\Users\Suresh Reddy\OneDrive\Desktop\anemia-project\frontend"
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Clinical Screening Rules (WHO 2011)
- **Normal (No Anemia)**: Hb ≥ 11.0 g/dL
- **Mild Anemia**: Hb 10.0 – 10.9 g/dL
- **Moderate Anemia**: Hb 7.0 – 9.9 g/dL
- **Severe Anemia**: Hb < 7.0 g/dL

*Disclaimer: This is a preliminary clinical screening tool and does NOT replace professional medical diagnosis, laboratory testing, or physician consultation.*
