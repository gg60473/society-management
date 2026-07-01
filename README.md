# SocietyOS — Society Management Frontend

React frontend for the Society Management System.

Backend 🔗👉🏼https://github.com/gg60473/AI-Driven-Resident-Insights-Backend
## Setup

```bash
cd society-frontend
npm install
npm start
```

Opens at http://localhost:3000

## Backend Required

Start the Python FastAPI backend first:

```bash
pip install fastapi uvicorn python-multipart
uvicorn main:app --reload
```

Backend runs at http://localhost:8000
API docs at http://localhost:8000/docs

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | /dashboard | Stats, AI insights, activity feed |
| Towers & Flats | /towers | Add/manage towers, visual flat grid |
| Flat Registry | /flats | Search & view all flats, owner details |
| Residents | /residents | Add/view residents, dues tracking |
| Visitor Gate | /visitors | Log visitors, approve/deny entry |
| Maintenance | /maintenance | Track & manage repair requests |
| Notices | /notices | Post notices to residents |
| Finances | /expenses | Expense tracking & breakdown |
| AI Insights | /ai | AI health score & recommendations |

## Tech Stack

- React 18
- Axios (API calls)
- Recharts (charts)
- Lucide React (icons)
- React Hot Toast (notifications)
- Google Fonts: Syne + DM Sans
# SocietyOS
