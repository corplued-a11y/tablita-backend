import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';  // 👈 importante: usar promesas
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configuración MySQL con .env
const config = {
  host: process.env.DB_HOST,   // servidor (localhost, IP, etc)
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

// Crear pool de conexiones (más eficiente que abrir/cerrar en cada query)
const pool = mysql.createPool(config);

// Probar conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT NOW() AS FechaServidor");
    console.log("✅ Conectado a MySQL:", rows);
    connection.release();
  } catch (err) {
    console.error("❌ Error de conexión:", err.message);
  }
}
testConnection();

// Middleware CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
      /^http:\/\/localhost(:[0-9]+)?$/
    ];

    if (allowed.some(regex => regex.test(origin))) {
      return callback(null, true);
    } else {
      return callback(new Error("Origen no permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ====================== ENDPOINTS ======================  

// Obtener todos los contratos
app.get('/contratos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bd_tercero');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Obtener contratos por item
app.get('/contratos/item/:item', async (req, res) => {
  const { item } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM bd_tercero WHERE ITEM = ?', [item]);
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Generar PDF por item
app.get('/contratos/pdf/:item', async (req, res) => {
  const { item } = req.params;

  try {
    // 1) Consultar contrato
    const [rows] = await pool.query('SELECT * FROM bd_tercero WHERE ITEM = ?', [item]);

    if (rows.length === 0) {
      return res.status(404).send("No se encontró el contrato con ese item");
    }

    const contrato = rows[0];

    // 2) Cargar plantilla HTML
    const templatePath = path.join(__dirname, 'templates', 'OGRH_Plant.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // 3) Reemplazar placeholders
    Object.keys(contrato).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, contrato[key] ?? '');
    });

    // 4) Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, `contrato_${item}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true
    });
    await browser.close();

    // 5) Enviar PDF
    res.download(pdfPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error al generar el PDF: " + err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
