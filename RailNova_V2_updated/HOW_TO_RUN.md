# RailNova V2 — Windows Setup Guide

## ⚡ SABSE ASAN TARIKA (One Click)

ZIP extract karne ke baad:
1. `START_BACKEND.bat` par double-click karo
2. Naya window khulega — wait karo jab tak `Running on http://127.0.0.1:5000` dikhe
3. `START_FRONTEND.bat` par double-click karo  
4. Browser automatically khulega http://localhost:3000 par

**BAS! Done.**

---

## Manual CMD Tarika

### Backend:
```
cd C:\path\to\RailNova_V2\backend
pip install flask flask-cors
python app.py
```

### Frontend (naya CMD):
```
cd C:\path\to\RailNova_V2\frontend
npm install
npm start
```

---

## Login Details

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@railnova.com     | admin123 |
| User  | Register karke login   | Apna     |

---

## V2 Me Kya Fix Hua

- ✅ Koi bhi email se register kar sakta hai (unlimited)
- ✅ Admin login persistent (browser close hone pe bhi)  
- ✅ Animated trains on home page
- ✅ Password strength meter
- ✅ Show/hide password
- ✅ Protected routes (admin/bookings)
- ✅ Salted password hashing