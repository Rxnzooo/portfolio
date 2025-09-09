require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'projecten',
});

db.connect((err) => {
  if (err) {
    console.error('Database connectie mislukt:', err.message);
    return;
  }
  console.log('Verbonden met MySQL');

  const createTable = `
    CREATE TABLE IF NOT EXISTS contact (
      id INT AUTO_INCREMENT PRIMARY KEY,
      naam VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      aanvraag TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  db.query(createTable, (err2) => {
    if (err2) console.error('Tabel aanmaken mislukt:', err2.message);
  });
});

// Nodemailer transporter
function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE; // bijv. 'gmail', 'hotmail'

  if ((!host || !user || !pass) && !service) {
    console.warn('SMTP niet geconfigureerd. Zet SMTP_* en MAIL_TO in .env om e-mails te versturen.');
    return null;
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transporter = buildTransporter();
if (transporter) {
  transporter.verify((err, success) => {
    if (err) {
      console.error('SMTP verificatie mislukt:', err.message);
    } else {
      console.log('SMTP klaar om te verzenden');
    }
  });
}

// Healthcheck
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Contact API actief' });
});

// Submit endpoint
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body || {};

  // Server-side validatie
  const errors = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!name || name.length < 3 || name.length > 100) errors.push('Ongeldige naam.');
  if (!email || !emailRegex.test(String(email))) errors.push('Ongeldig e-mailadres.');
  if (!message || message.length < 10 || message.length > 1000) errors.push('Ongeldig bericht.');

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const sql = 'INSERT INTO contact (naam, email, aanvraag) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], async (err, result) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ success: false, error: 'Opslaan mislukt' });
    }

    // E-mail versturen (indien geconfigureerd)
    const mail = { configured: !!transporter, sent: false };
    try {
      if (!transporter) {
        mail.reason = 'SMTP niet geconfigureerd';
      } else if (!process.env.MAIL_TO) {
        mail.reason = 'MAIL_TO ontbreekt in .env';
      } else {
        const from = process.env.MAIL_FROM || process.env.SMTP_USER;
        await transporter.sendMail({
          from,
          to: process.env.MAIL_TO,
          subject: 'Nieuw contactformulier bericht',
          text: `Naam: ${name}\nE-mail: ${email}\n\nBericht:\n${message}`,
          html: `<p><strong>Naam:</strong> ${name}</p>
                 <p><strong>E-mail:</strong> ${email}</p>
                 <p><strong>Bericht:</strong></p>
                 <p style="white-space:pre-line;">${message}</p>`,
          replyTo: email,
        });
        mail.sent = true;
        console.log('Mail verzonden naar', process.env.MAIL_TO);

        // Optionele bevestiging naar inzender
        if (process.env.MAIL_REPLY === 'true') {
          await transporter.sendMail({
            from,
            to: email,
            subject: 'Dank voor je bericht',
            text: 'We hebben je bericht ontvangen en nemen snel contact op.',
            replyTo: process.env.MAIL_TO,
          });
        }
      }
    } catch (mailErr) {
      console.error('E-mail fout:', mailErr.message);
      mail.reason = mailErr.message;
    }

    res.json({ success: true, id: result.insertId, mail });
  });
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
