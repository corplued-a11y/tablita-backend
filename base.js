import { exec } from "child_process";

function convertirExcelAPDF(rutaExcel, rutaPDF) {
    const comando = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${path.dirname(rutaPDF)}" "${rutaExcel}"`;
    exec(comando, (error) => {
        if (error) {
            console.error("Error convirtiendo a PDF:", error);
        } else {
            console.log("PDF generado:", rutaPDF);
        }
    });
}


import { exec } from "child_process";
import path from "path";

function convertirExcelAPDF(rutaExcel, rutaPDF) {
  const excelPath = `"${process.env.PROGRAMFILES}\\Microsoft Office\\root\\Office16\\EXCEL.EXE"`;
  const comando = `${excelPath} "${rutaExcel}" /p /e`;

  exec(comando, (error) => {
    if (error) {
      console.error("Error exportando con Excel:", error);
    } else {
      console.log("Excel enviado a PDF correctamente.");
    }
  });
}

// npm install office-to-pdf
import fs from "fs";
import officeToPdf from "office-to-pdf";

async function convertirExcelAPDF(rutaExcel, rutaPDF) {
  const excelData = fs.readFileSync(rutaExcel);
  const pdfBuffer = await officeToPdf(excelData);

  fs.writeFileSync(rutaPDF, pdfBuffer);
  console.log("PDF generado en:", rutaPDF);
}

// npm install pdfmake
import PdfPrinter from "pdfmake";
import fs from "fs";

function generarPDF(datos, rutaPDF) {
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
}


import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import officeToPdf from "office-to-pdf";

async function generarReporte(datos) {
  const workbook = new ExcelJS.Workbook();

  // 📌 1. Cargar plantilla
  await workbook.xlsx.readFile(path.join(__dirname, "templates", "plantilla.xlsx"));
  const hoja = workbook.getWorksheet(1);

  // 📌 2. Reemplazar placeholders
  hoja.eachRow(row => {
    row.eachCell(cell => {
      if (typeof cell.value === "string") {
        cell.value = cell.value
          .replace("{{cliente}}", datos.APELLIDOS_Y_NOMBRES)
          .replace("{{fecha}}", datos.FECHA_PRES_1)
          .replace("{{producto1}}", datos.COMPROMISO_1)
          .replace("{{precio1}}", datos.DENOMINACIÓN_DE_LA_CONTRATACIÓN);
      }
    });
  });

  // 📌 3. Guardar Excel generado
  const nombreExcel = `reporte_${Date.now()}.xlsx`;
  const rutaExcel = path.join(__dirname, "reportes", nombreExcel);
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
}



//BASE
 async function generarReporte(datos) {
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

  return rutaExcel;
} 