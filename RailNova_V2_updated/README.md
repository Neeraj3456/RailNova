# 🚂 RailNova – Smart Train Traveller Management System

**Group Members:** Neeraj Kumar, Rishi Kumar, Muhammad Asad, Pardeep Kumar, Nandni Laxman  
**University:** SZABIST | ZAB-FEST Project

---

## 📁 Project Structure

```
railnova/
├── backend/
│   ├── app.py              ← Flask REST API (all routes)
│   ├── requirements.txt    ← Python dependencies
│   └── railnova.db         ← SQLite database (auto-created)
│
└── frontend/
    ├── public/
    │   └── index.html      ← HTML entry point
    ├── src/
    │   ├── App.js          ← Main app + routing
    │   ├── index.js        ← React entry
    │   ├── index.css       ← All global styles
    │   ├── api.js          ← Axios API calls
    │   ├── components/
    │   │   └── Navbar.js   ← Navigation bar
    │   └── pages/
    │       ├── Home.js     ← Landing page
    │       ├── Login.js    ← Login form
    │       ├── Register.js ← Register form
    │       ├── Trains.js   ← Search & book trains
    │       ├── Bookings.js ← User's booking history
    │       └── Admin.js    ← Admin dashboard
    └── package.json
```

---

## ⚙️ Setup Instructions (VS Code)

### Step 1 — Open in VS Code
1. Open VS Code
2. File → Open Folder → select `railnova/`

---

### Step 2 — Backend Setup

Open VS Code Terminal (`Ctrl + `` ` ``) and run:

```bash
# Go to backend folder
cd backend

# Create Python virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

✅ Backend runs at: `http://localhost:5000`

---

### Step 3 — Frontend Setup

Open a **new terminal** (`Ctrl+Shift+5` or click `+` in terminal):

```bash
# Go to frontend folder
cd frontend

# Install Node packages (first time only)
npm install

# Start React app
npm start
```

✅ Frontend opens at: `http://localhost:3000`

---

## 🔐 Demo Login

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@railnova.com    | admin123  |
| User  | Register a new account | any       |

---

## 🎯 Features

### User Side
- ✅ Register & Login
- ✅ Search trains by city route
- ✅ Real-time seat availability
- ✅ Book tickets with date selection
- ✅ View booking history
- ✅ Cancel bookings

### Admin Side
- ✅ Dashboard with stats & revenue
- ✅ Add / Remove trains
- ✅ View all bookings
- ✅ Manage passenger records

---

## 🛠 Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18, React Router 6 |
| Styling  | Custom CSS (no framework)|
| Backend  | Python Flask             |
| Database | SQLite (via sqlite3)     |
| API      | RESTful JSON API         |

---

## 📌 Requirements

- **Python** 3.8 or higher
- **Node.js** 18 or higher
- **npm** (comes with Node.js)
