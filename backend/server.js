const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",   // change if needed
    user: "root",        // your MySQL username
    password: "finsight",        // your MySQL password
    database: "finsight" // your database name
});

// 2. Test DB connection
db.connect(err => {
    if (err) throw err;
    console.log("✅ MySQL Connected");
});

// 3. Signup Route
app.post("/signup", async (req, res) => {
    const { full_name, email_add, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const sql = "INSERT INTO users (full_name, email_add, password_hash) VALUES (?, ?, ?)";
    db.query(sql, [full_name, email_add, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error creating user" });
        }
        res.json({ message: "User registered!" });
    });
});

// 4. Login Route
app.post("/login", (req, res) => {
    const { email_add, password } = req.body;

    const sql = "SELECT * FROM users WHERE email_add = ?";
    db.query(sql, [email_add], async (err, results) => {
        if (err) return res.status(500).json({ message: "Error on login" });
        if (results.length === 0) return res.status(400).json({ message: "User not found" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            res.json({ message: "Login successful", user_id: user.user_id });
        } else {
            res.status(401).json({ message: "Invalid password" });
        }
    });
});

// 5. Start Server
app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
