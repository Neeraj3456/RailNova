from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import hashlib
import os
import re
import secrets
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

DB_PATH = os.path.join(os.path.dirname(__file__), "railnova.db")

# ─── DATABASE ────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Secure password hashing with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password, stored):
    """Verify password against stored salt:hash"""
    try:
        if ":" in stored:
            salt, hashed = stored.split(":", 1)
            return hashlib.sha256((salt + password).encode()).hexdigest() == hashed
        else:
            # Legacy sha256 without salt (for existing admin account)
            return hashlib.sha256(password.encode()).hexdigest() == stored
    except:
        return False

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS trains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        number TEXT UNIQUE NOT NULL,
        from_city TEXT NOT NULL,
        to_city TEXT NOT NULL,
        departure TEXT NOT NULL,
        arrival TEXT NOT NULL,
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        price REAL NOT NULL,
        status TEXT DEFAULT 'active'
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        train_id INTEGER NOT NULL,
        seat_number TEXT NOT NULL,
        journey_date TEXT NOT NULL,
        status TEXT DEFAULT 'confirmed',
        booking_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(train_id) REFERENCES trains(id)
    )''')

    # Seed admin — uses legacy hash so login always works
    admin_pass = hashlib.sha256("admin123".encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
              ("Admin", "admin@railnova.com", admin_pass, "admin"))

    sample_trains = [
        ("Karachi Express",  "KE-101", "Karachi",   "Lahore",     "08:00", "20:00", 120, 85, 1500.0),
        ("Green Line",       "GL-202", "Islamabad", "Karachi",    "09:30", "23:00", 200, 142, 1200.0),
        ("Tezgam",           "TZ-303", "Lahore",    "Rawalpindi", "06:00", "10:00", 150, 60, 800.0),
        ("Awam Express",     "AE-404", "Peshawar",  "Karachi",    "14:00", "06:00", 180, 110, 1800.0),
        ("Business Express", "BE-505", "Lahore",    "Islamabad",  "07:00", "11:30", 80,  30, 2500.0),
    ]
    for t in sample_trains:
        c.execute("INSERT OR IGNORE INTO trains (name,number,from_city,to_city,departure,arrival,total_seats,available_seats,price) VALUES (?,?,?,?,?,?,?,?,?)", t)

    conn.commit()
    conn.close()

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"success": False, "message": "Invalid request body"}), 400

        name     = (data.get("name") or "").strip()
        email    = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()

        # Validation
        if not name or not email or not password:
            return jsonify({"success": False, "message": "All fields are required"}), 400
        if len(name) < 2:
            return jsonify({"success": False, "message": "Name must be at least 2 characters"}), 400
        if not is_valid_email(email):
            return jsonify({"success": False, "message": "Please enter a valid email address"}), 400
        if len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
        if len(password) > 128:
            return jsonify({"success": False, "message": "Password too long"}), 400

        # Secure hash
        hashed = hash_password(password)

        conn = get_db()
        # Check if email already exists
        existing = conn.execute("SELECT id FROM users WHERE LOWER(email)=?", (email,)).fetchone()
        if existing:
            conn.close()
            return jsonify({"success": False, "message": "This email is already registered. Please login or use a different email."}), 400

        conn.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                     (name, email, hashed))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Account created successfully! Please login."})

    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "This email is already registered. Please login or use a different email."}), 400
    except Exception as e:
        return jsonify({"success": False, "message": "Registration failed. Please try again."}), 500

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"success": False, "message": "Invalid request body"}), 400

        email    = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE LOWER(email)=?", (email,)).fetchone()
        conn.close()

        if user and verify_password(password, user["password"]):
            return jsonify({"success": True, "user": {
                "id":    user["id"],
                "name":  user["name"],
                "email": user["email"],
                "role":  user["role"]
            }})

        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"success": False, "message": "Login failed. Please try again."}), 500

# ─── TRAIN ROUTES ─────────────────────────────────────────────────────────────

@app.route("/api/trains", methods=["GET"])
def get_trains():
    from_city = request.args.get("from_city", "").strip()
    to_city   = request.args.get("to_city", "").strip()
    conn = get_db()
    if from_city and to_city:
        rows = conn.execute(
            "SELECT * FROM trains WHERE from_city LIKE ? AND to_city LIKE ? AND status='active'",
            (f"%{from_city}%", f"%{to_city}%")).fetchall()
    elif from_city:
        rows = conn.execute(
            "SELECT * FROM trains WHERE from_city LIKE ? AND status='active'",
            (f"%{from_city}%",)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM trains WHERE status='active'").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/trains", methods=["POST"])
def add_train():
    try:
        d = request.json
        required = ["name","number","from_city","to_city","departure","arrival","total_seats","price"]
        for field in required:
            if not d.get(field):
                return jsonify({"success": False, "message": f"Field '{field}' is required"}), 400
        conn = get_db()
        conn.execute(
            "INSERT INTO trains (name,number,from_city,to_city,departure,arrival,total_seats,available_seats,price) VALUES (?,?,?,?,?,?,?,?,?)",
            (d["name"], d["number"], d["from_city"], d["to_city"],
             d["departure"], d["arrival"], int(d["total_seats"]), int(d["total_seats"]), float(d["price"])))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Train added successfully"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Train number already exists"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/trains/<int:tid>", methods=["DELETE"])
def delete_train(tid):
    conn = get_db()
    conn.execute("UPDATE trains SET status='inactive' WHERE id=?", (tid,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ─── BOOKING ROUTES ───────────────────────────────────────────────────────────

@app.route("/api/book", methods=["POST"])
def book_ticket():
    try:
        d = request.json
        if not d.get("user_id") or not d.get("train_id") or not d.get("journey_date"):
            return jsonify({"success": False, "message": "Missing booking details"}), 400

        conn = get_db()
        train = conn.execute("SELECT * FROM trains WHERE id=?", (d["train_id"],)).fetchone()
        if not train or train["available_seats"] < 1:
            conn.close()
            return jsonify({"success": False, "message": "No seats available on this train"}), 400

        seat_num = f"S{train['total_seats'] - train['available_seats'] + 1}"
        conn.execute(
            "INSERT INTO bookings (user_id, train_id, seat_number, journey_date) VALUES (?,?,?,?)",
            (d["user_id"], d["train_id"], seat_num, d["journey_date"]))
        conn.execute("UPDATE trains SET available_seats = available_seats - 1 WHERE id=?", (d["train_id"],))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "seat": seat_num, "message": "Ticket booked successfully!"})
    except Exception as e:
        return jsonify({"success": False, "message": "Booking failed. Please try again."}), 500

@app.route("/api/bookings/<int:user_id>", methods=["GET"])
def user_bookings(user_id):
    conn = get_db()
    rows = conn.execute('''
        SELECT b.id, b.seat_number, b.journey_date, b.status, b.booking_date,
               t.name as train_name, t.number as train_number,
               t.from_city, t.to_city, t.departure, t.arrival, t.price
        FROM bookings b JOIN trains t ON b.train_id = t.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/bookings/<int:bid>/cancel", methods=["PUT"])
def cancel_booking(bid):
    conn = get_db()
    booking = conn.execute("SELECT * FROM bookings WHERE id=?", (bid,)).fetchone()
    if booking:
        conn.execute("UPDATE bookings SET status='cancelled' WHERE id=?", (bid,))
        conn.execute("UPDATE trains SET available_seats = available_seats + 1 WHERE id=?", (booking["train_id"],))
        conn.commit()
    conn.close()
    return jsonify({"success": True})

# ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    conn = get_db()
    total_users    = conn.execute("SELECT COUNT(*) FROM users WHERE role='user'").fetchone()[0]
    total_trains   = conn.execute("SELECT COUNT(*) FROM trains WHERE status='active'").fetchone()[0]
    total_bookings = conn.execute("SELECT COUNT(*) FROM bookings").fetchone()[0]
    confirmed      = conn.execute("SELECT COUNT(*) FROM bookings WHERE status='confirmed'").fetchone()[0]
    revenue        = conn.execute(
        "SELECT SUM(t.price) FROM bookings b JOIN trains t ON b.train_id=t.id WHERE b.status='confirmed'"
    ).fetchone()[0] or 0
    conn.close()
    return jsonify({
        "total_users": total_users,
        "total_trains": total_trains,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed,
        "revenue": revenue
    })

@app.route("/api/admin/bookings", methods=["GET"])
def all_bookings():
    conn = get_db()
    rows = conn.execute('''
        SELECT b.id, b.seat_number, b.journey_date, b.status, b.booking_date,
               u.name as user_name, u.email,
               t.name as train_name, t.from_city, t.to_city, t.price
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN trains t ON b.train_id = t.id
        ORDER BY b.booking_date DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/admin/users", methods=["GET"])
def all_users():
    conn = get_db()
    rows = conn.execute("SELECT id, name, email, role, created_at FROM users").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route("/api/admin/users/<int:uid>", methods=["DELETE", "OPTIONS"])
def delete_user(uid):
    if request.method == "OPTIONS":
        return jsonify({}), 200
    conn = get_db()
    user = conn.execute("SELECT role FROM users WHERE id=?", (uid,)).fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404
    if user["role"] == "admin":
        conn.close()
        return jsonify({"message": "Cannot remove admin accounts"}), 403
    # Cancel all bookings first
    conn.execute("UPDATE bookings SET status='cancelled' WHERE user_id=?", (uid,))
    conn.execute("DELETE FROM users WHERE id=?", (uid,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "User removed successfully"})

if __name__ == "__main__":
    init_db()
    print("✅ RailNova V2 backend started at http://127.0.0.1:5000")
    print("📧 Admin login: admin@railnova.com / admin123")
    app.run(debug=True, port=5000)
