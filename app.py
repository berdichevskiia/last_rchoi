from flask import Flask, jsonify, request, send_from_directory, render_template, g
import sqlite3, os
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data", "tasks.db")

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.executescript(\"\"\"
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            assignee TEXT,
            status TEXT NOT NULL DEFAULT 'todo',
            priority INTEGER DEFAULT 2,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
        INSERT INTO members (name) VALUES ('Alex'), ('Maria'), ('Ilya'), ('Sofia');
        INSERT INTO tasks (title, description, assignee, status, priority) VALUES
            ('Design landing page', 'Create initial Figma screens for marketing landing', 'Alex', 'in-progress', 1),
            ('Set up CI/CD', 'Configure GitHub Actions to run tests and deploy', 'Ilya', 'todo', 2),
            ('Write API docs', 'Document REST endpoints for frontend', 'Maria', 'todo', 3),
            ('User testing', 'Run 5 moderated sessions', 'Sofia', 'done', 2);
        \"\"\" )
        conn.commit()
        conn.close()

app = Flask(__name__, static_folder='static', template_folder='templates')
init_db()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET","POST"])
def tasks():
    db = get_db()
    cur = db.cursor()
    if request.method == "GET":
        status = request.args.get("status")
        assignee = request.args.get("assignee")
        q = "SELECT * FROM tasks WHERE 1=1"
        params = []
        if status:
            q += " AND status = ?"
            params.append(status)
        if assignee:
            q += " AND assignee = ?"
            params.append(assignee)
        cur.execute(q, params)
        rows = [dict(r) for r in cur.fetchall()]
        return jsonify(rows)
    else:
        data = request.json or {}
        title = data.get("title","Untitled")
        description = data.get("description","")
        assignee = data.get("assignee", None)
        status = data.get("status","todo")
        priority = int(data.get("priority",2))
        cur.execute("INSERT INTO tasks (title,description,assignee,status,priority) VALUES (?,?,?,?,?)",
                    (title,description,assignee,status,priority))
        db.commit()
        return jsonify({"ok": True, "id": cur.lastrowid}), 201

@app.route("/api/tasks/<int:task_id>", methods=["PUT","DELETE"])
def task_modify(task_id):
    db = get_db()
    cur = db.cursor()
    if request.method == "PUT":
        data = request.json or {}
        fields = []
        params = []
        for k in ("title","description","assignee","status","priority"):
            if k in data:
                fields.append(f"{k} = ?")
                params.append(data[k])
        if not fields:
            return jsonify({"error":"no fields"}), 400
        params.append(task_id)
        cur.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", params)
        db.commit()
        return jsonify({"ok": True})
    else:
        cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        db.commit()
        return jsonify({"ok": True})

@app.route("/api/members")
def members():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT name FROM members")
    return jsonify([r[0] for r in cur.fetchall()])

# Serve favicon or other static if needed
@app.route('/<path:filename>')
def static_proxy(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
