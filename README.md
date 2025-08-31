# Resume Checker App

AI-powered resume analysis and improvement tool.

## 🚀 Deploy to Vercel

### Quick Setup:
1. **Push to GitHub** your code
2. **Connect to Vercel** (vercel.com)
3. **Set Environment Variable**: `GOOGLE_API_KEY`
4. **Deploy** - Vercel handles the rest!

### Project Structure:
```
├── api/upload.js          # Serverless function
├── frontend/              # React app
├── vercel.json            # Vercel config
└── README.md
```

### Environment Variables:
- `GOOGLE_API_KEY`: Your Google AI API key

### Features:
- PDF resume upload
- AI-powered analysis
- Professional tips
- Improved resume generation
- Word document download
- Responsive design

## Local Development:
```bash
# Frontend
cd frontend
npm install
npm run dev

# API (for local testing with Vercel CLI)
cd api
npm install
vercel dev
```

## Tech Stack:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini
- **File Processing**: PDF parsing
- **Document Generation**: DOCX export
