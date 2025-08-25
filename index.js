import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sql from 'mssql';
import cors from 'cors';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

//nuevo codigo con env
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST, // 👈 cambia DB_SERVER por DB_HOST, más estándar
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,             // necesario en GCP/Azure
    trustServerCertificate: false
  }
};
//nuevo codigo con env

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permitir peticiones sin origin (ej: Postman)

    // Expresión regular para *.ngrok-free.app o localhost
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

// Para obtener __dirname en ESModules
/* const config = {
  user: 'Lued',
  password: '70880118',
  server: 'LAPTOP-T1SUIMK1',
  database: 'bd_servicios',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}; */
//

// Endpoint para obtener todos los contratos
app.get('/contratos', async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query('SELECT * FROM Tablita');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Endpoint para obtener contratos especificos por item
app.get('/contratos/item/:item', async (req, res) => {
  const { item } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('Item', sql.NVarChar, item)
      .query('SELECT * FROM Tablita WHERE [ITEM] = @Item');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint para obtener un contrato específico por item
app.get('/contratos/pdf/:item', async (req, res) => {
  const { item } = req.params;

  try {
    // 1) Obtener datos desde SQL
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('Item', sql.NVarChar, item)
      .query('SELECT * FROM Tablita WHERE [ITEM] = @Item');

    if (result.recordset.length === 0) {
      return res.status(404).send("No se encontró el contrato con ese item");
    }

    const contrato = result.recordset[0];

    // 2) Cargar plantilla HTML
    //const templatePath = path.join(__dirname, 'templates','plantilla.html');
    const templatePath = path.join(__dirname, 'templates', 'OGRH_Plant.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // 3) Reemplazar placeholders {{CAMPO}}
    Object.keys(contrato).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, contrato[key] ?? '');
    });

    // 4) Usar Puppeteer para generar PDF
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

    // 5) Enviar el PDF como descarga
    res.download(pdfPath);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error al generar el PDF: " + err.message);
  }
});

app.listen(process.env.PORT||3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
