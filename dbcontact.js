require('dotenv').config(); 
const express = require('express'); 
const mysql = require('mysql'); // MySQL database module
const bodyParser = require('body-parser'); 
const cors = require('cors'); 

const app = express(); // Maak een nieuwe Express applicatie aan
const port = 3000; // Poortnummer voor de server

app.use(cors());
app.use(bodyParser.json());

// Database connectie
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "projecten" 
});

db.connect(err => {
    if (err) {
        console.error("Database connectie mislukt:", err);
        return;
    }
    console.log("Verbonden met MySQL Database via phpMyAdmin!");
});

// Endpoint om formulierdata op te slaan
app.post('/submit-form', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Alle velden zijn verplicht!" });
    }

    const sql = "INSERT INTO contact (naam, email, aanvraag) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error("Database fout:", err);
            return res.status(500).json({ error: "Er ging iets mis bij het opslaan." });
        }
        res.json({ success: "Bericht succesvol opgeslagen!" });
    });
});

// Server starten
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.send("Server is actief! Gebruik het contactformulier om data te verzenden.");
});