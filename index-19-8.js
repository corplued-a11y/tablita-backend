import express from 'express';
//import ExcelJS from 'exceljs';
//import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sql from 'mssql';
import cors from 'cors';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

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
const config = {
  user: 'Lued',
  password: '70880118',
  server: 'LAPTOP-T1SUIMK1',
  database: 'bd_servicios',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
//
/* 
exec(`java -jar jasperstarter.jar process ${reportPath} -o ${outputPath} -f pdf`, 
(error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    console.log(`Reporte generado en: ${outputPath}`);
});
//generar reporte
const jasperConfig = {
  path: path.join(__dirname, 'reportes'), // donde está reporte1.jasper
  reports: {
    reporte1: {
      jasper: 'reporte1.jasper',
      conn: 'json'
    }
  }
};const jasperApp = jasper(jasperConfig); */
/* 
app.get('/contratos/jasper/:item', async (req, res) => {
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

    const contrato = result.recordset; // Jasper necesita array, no solo objeto

    // 2) Generar PDF con Jasper
    const pdf = jasperApp.pdf({
      report: 'repoOGRH_Plant',
      data: contrato
    });

    // 3) Enviar como descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato_${item}.pdf`);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando el reporte Jasper: " + err.message);
  }
}); */
// Función para rellenar Excel con datos
/* async function generarReporte(datos) {
  const workbook = new ExcelJS.Workbook();

  // Cargar plantilla
  await workbook.xlsx.readFile(path.join(__dirname, 'templates', 'plantilla.xlsx'));
  const hoja = workbook.getWorksheet(1);

  // Reemplazar placeholders
  hoja.eachRow(row => {
    row.eachCell(cell => {
      if (typeof cell.value === 'string') {
        cell.value = cell.value
          .replace('{{cliente}}', datos.APELLIDOS_Y_NOMBRES)
          .replace('{{fecha}}', datos.FECHA_PRES_1)
          .replace('{{producto1}}', datos.COMPROMISO_1)
          .replace('{{precio1}}', datos.DENOMINACIÓN_DE_LA_CONTRATACIÓN);
      }
    });
  });

  // Guardar Excel generado
  const nombreExcel = `reporte_${Date.now()}.xlsx`;
  const rutaExcel = path.join(__dirname, 'reportes', nombreExcel);
  await workbook.xlsx.writeFile(rutaExcel);

  // 📌 4. Convertir Excel → PDF
  const excelBuffer = fs.readFileSync(rutaExcel);
  const pdfBuffer = await officeToPdf(excelBuffer);

  const nombrePDF = nombreExcel.replace(".xlsx", ".pdf");
  const rutaPDF = path.join(__dirname, "reportes", nombrePDF);
  fs.writeFileSync(rutaPDF, pdfBuffer);

  console.log("✅ PDF generado en:", rutaPDF);

  // 📌 5. Retornar rutas
  return {
    excel: rutaExcel,
    pdf: rutaPDF
  };
}export default generarReporte; */


/*  export async function generarReporte(datos) {
    const plantillaPath = path.join(__dirname,'templates','plantilla.xlsm'); // Tu plantilla con macro
    const nombreArchivo = `${datos.APELLIDOS_Y_NOMBRES}.xlsm`;
    const rutaDestino = path.join(__dirname, 'reportes', nombreArchivo);

    // 📌 Copiar plantilla a destino
    fs.copyFileSync(plantillaPath, rutaDestino);

    // 📌 Modificar celdas con ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(rutaDestino);

    const hoja = workbook.getWorksheet(1);
    hoja.getCell('C4').value = datos.APELLIDOS_Y_NOMBRES;
    hoja.getCell('C6').value = datos.FECHA_PRES_1;
    hoja.getCell('C9').value = datos.DENOMINACIÓN_DE_LA_CONTRATACIÓN;
    hoja.getCell('C10').value = datos.COMPROMISO_1;

    await workbook.xlsx.writeFile(rutaDestino);

    // 📌 Ejecutar Excel con macro
    const comando = `"${process.env.PROGRAMFILES}\\Microsoft Office\\root\\Office16\\EXCEL.EXE" "${rutaDestino}" /mMacroExportarPDF`;
    exec(comando, (error) => {
        if (error) {
            console.error(`Error ejecutando macro: ${error.message}`);
        } else {
            console.log("Excel y PDF generados correctamente.");
        }
    });

    return rutaDestino;
} */

// Endpoint para generar y descargar el PDF
/* app.post('/reporte-excel', async (req, res) => {
  try {
    const datos = req.body;
    const rutaExcel = await generarReporte(datos);
    res.download(rutaExcel);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando el reporte');
  }
}); */

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
//get metodo completo reporte excel
/* app.get('/reporte-excel/:item', async (req, res) => {
  const { item } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('Item', sql.NVarChar, item)
      .query('SELECT * FROM Tablita WHERE [ITEM] = @Item');

    if (result.recordset.length === 0) {
      return res.status(404).send('No encontrado');
    }

    const datos = {
      APELLIDOS_Y_NOMBRES: result.recordset[0].APELLIDOS_Y_NOMBRES,
      FECHA_PRES_1: result.recordset[0].FECHA_PRES_1,
      DENOMINACIÓN_DE_LA_CONTRATACIÓN: result.recordset[0].DENOMINACIÓN_DE_LA_CONTRATACIÓN,
      COMPROMISO_1: result.recordset[0].COMPROMISO_1
    };

    const rutaExcel = await generarReporte(datos);
    res.download(rutaExcel);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando el reporte');
  }
}); */

/* app.get('/generar-reportes/:item', async (req, res) => {
  const { item } = req.params;
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('Item', sql.NVarChar, item)
      .query('SELECT * FROM Tablita WHERE [ITEM] = @Item');

    if (result.recordset.length === 0) {
      return res.status(404).send('No encontrado');
    }

    const datos = {
      APELLIDOS_Y_NOMBRES: result.recordset[0].APELLIDOS_Y_NOMBRES,
      FECHA_PRES_1: result.recordset[0].FECHA_PRES_1,
      DENOMINACIÓN_DE_LA_CONTRATACIÓN: result.recordset[0].DENOMINACIÓN_DE_LA_CONTRATACIÓN,
      COMPROMISO_1: result.recordset[0].COMPROMISO_1
    };

    await generarReporte(datos);
    res.json({ mensaje: "Excel y PDF generados correctamente en carpeta reportes" });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generando reportes backend');
  }
});
 */
//usando libre-office
/* function convertirExcelAPDF(rutaExcel, rutaPDF) {
  const comando = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${path.dirname(rutaPDF)}" "${rutaExcel}"`;
  exec(comando, (error) => {
    if (error) {
      console.error("Error convirtiendo a PDF:", error);
    } else {
      console.log("PDF generado:", rutaPDF);
    }
  });
} */

//usando excel office
/* function convertirExcelAPDF1(rutaExcel, rutaPDF) {
  const excelPath = `"${process.env.PROGRAMFILES}\\Microsoft Office\\root\\Office16\\EXCEL.EXE"`;
  const comando = `${excelPath} "${rutaExcel}" /p /e`;

  exec(comando, (error) => {
    if (error) {
      console.error("Error exportando con Excel:", error);
    } else {
      console.log("Excel enviado a PDF correctamente.");
    }
  });
} */

//usando npm install office-to-pdf

/* function convertirExcelAPDF2(rutaExcel, rutaPDF) {
  const excelData = fs.readFileSync(rutaExcel);
  const pdfBuffer = await officeToPdf(excelData);

  fs.writeFileSync(rutaPDF, pdfBuffer);
  console.log("PDF generado en:", rutaPDF);
} */

//usando npm install pdfmake
/* function generarPDF(datos, rutaPDF) {
  const fonts = { Roboto: { normal: "node_modules/pdfmake/fonts/Roboto-Regular.ttf" } };
  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      { text: "Reporte", style: "header" },
      `Nombre: ${datos.APELLIDOS_Y_NOMBRES}`,
      `Fecha: ${datos.FECHA_PRES_1}`,
      `Contratación: ${datos.DENOMINACIÓN_DE_LA_CONTRATACIÓN}`,
      `Compromiso: ${datos.COMPROMISO_1}`
    ]
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(rutaPDF));
  pdfDoc.end();
} */

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



app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
