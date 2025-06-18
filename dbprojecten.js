const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

// Database connectie
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projecten'
});

db.connect(err => {
    if (err) {
        console.error("Database connectie mislukt:", err);
        return;
    }
    console.log("Verbonden met de database 'projecten'");
});

// Endpoint om projecten op te halen en gesorteerd op views
app.get('/api/projects', (req, res) => {
    const category = req.query.category;

    let query = 'SELECT id, name, image_url, views, site FROM projecten';

    if (category) {
        query += ' WHERE category = ?';
    }

    query += ' ORDER BY views DESC';
node
    db.query(query, [category], (err, results) => {
        if (err) {
            console.error("Database query fout:", err);
            res.status(500).json({ error: "Database query mislukt." });
            return;
        }
        res.json(results);
    });
});

// Endpoint om een specifiek project op te halen
app.get('/api/projects/:id', (req, res) => {
    const projectId = req.params.id;

    const query = 'SELECT * FROM projecten WHERE id = ?';

    db.query(query, [projectId], (err, results) => {
        if (err) {
            console.error("Database query fout:", err);
            return res.status(500).json({ error: "Fout bij ophalen projectgegevens." });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "Project niet gevonden." });
        }
    });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`ProjectServer draait op http://localhost:${PORT}`));