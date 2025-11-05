function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const json = [];

    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        let valor;
        if(j === 0) {
          // Formatear la fecha
          let fecha = data[i][j];
          if (fecha instanceof Date) {
            valor = Utilities.formatDate(fecha, "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");
          } else {
            valor = fecha;
          }
        } else {
          valor = data[i][j];
        }

        row[headers[j]] = valor;
      }
      json.push(row);
    }

    return ContentService.createTextOutput(JSON.stringify(json))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error en doGet: " + error);
    return ContentService.createTextOutput(JSON.stringify({
      error: "Error al obtener datos",
      message: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    const lastRow = sheet.getLastRow();

    // Asegurar que existe la columna "Enlace directo"
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let directLinkColIndex = headers.indexOf("Enlace directo");

    // Si no existe, crearla después de la columna "fotografía"
    if (directLinkColIndex === -1) {
      const fotoColIndex = getColumnIndexByName(sheet, "fotografía");
      if (fotoColIndex !== -1) {
        directLinkColIndex = fotoColIndex + 1;
        sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
      }
    }

    const fotoColIndex = getColumnIndexByName(sheet, "fotografía");

    if (fotoColIndex === -1) {
      Logger.log("No se encontró la columna 'fotografía'");
      return;
    }

    const fotoUrl = sheet.getRange(lastRow, fotoColIndex + 1).getValue();
    const fileId = extractDriveFileId(fotoUrl);
    Logger.log("File ID extraído: " + fileId);

    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);
        Logger.log("Enlace directo guardado: " + directLink);
      } catch (error) {
        Logger.log("Error al procesar el archivo de Drive: " + error);
      }
    } else {
      Logger.log("No se pudo extraer el ID del archivo de la URL: " + fotoUrl);
    }
  } catch (error) {
    Logger.log("Error en onFormSubmit: " + error);
  }
}

function extractDriveFileId(url) {
  if (!url) return null;

  // Intentar varios patrones de URL de Google Drive
  const patterns = [
    /[-\w]{25,}/,
    /\/d\/([-\w]{25,})/,
    /id=([-\w]{25,})/,
    /\/file\/d\/([-\w]{25,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

function getColumnIndexByName(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(columnName);
}

// Función auxiliar para probar manualmente
function testExtractFileId() {
  const testUrls = [
    "https://drive.google.com/open?id=1ABC123",
    "https://drive.google.com/file/d/1ABC123/view",
    "https://docs.google.com/file/d/1ABC123"
  ];

  testUrls.forEach(url => {
    Logger.log("URL: " + url + " -> ID: " + extractDriveFileId(url));
  });
}

