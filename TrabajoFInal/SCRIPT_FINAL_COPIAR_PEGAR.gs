function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({error: "No se encontró la hoja"})).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const json = [];

    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        if (j === 0 && data[i][j] instanceof Date) {
          row[headers[j]] = Utilities.formatDate(data[i][j], "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");
        } else {
          row[headers[j]] = data[i][j];
        }
      }
      json.push(row);
    }

    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    let imagenColIndex = headers.indexOf("Imagen Del Campeon");
    if (imagenColIndex === -1) return;

    let directLinkColIndex = headers.indexOf("Enlace directo");
    if (directLinkColIndex === -1) {
      directLinkColIndex = imagenColIndex + 1;
      sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
    }

    const imagenUrl = sheet.getRange(lastRow, imagenColIndex + 1).getValue();
    const fileId = extractDriveFileId(imagenUrl);

    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);
        Logger.log("Enlace creado: " + directLink);
      } catch (error) {
        Logger.log("Error: " + error);
      }
    }
  } catch (error) {
    Logger.log("Error en onFormSubmit: " + error);
  }
}

function extractDriveFileId(url) {
  if (!url) return null;
  url = String(url);

  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/^([a-zA-Z0-9_-]{25,40})$/);
  if (match) return match[1];

  return null;
}

function procesarFilasExistentes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let imagenColIndex = headers.indexOf("Imagen Del Campeon");
  let directLinkColIndex = headers.indexOf("Enlace directo");

  if (directLinkColIndex === -1) {
    directLinkColIndex = imagenColIndex + 1;
    sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
  }

  const lastRow = sheet.getLastRow();
  let procesados = 0;

  for (let i = 2; i <= lastRow; i++) {
    const imagenUrl = sheet.getRange(i, imagenColIndex + 1).getValue();
    if (imagenUrl) {
      const fileId = extractDriveFileId(imagenUrl);
      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
          sheet.getRange(i, directLinkColIndex + 1).setValue(directLink);
          procesados++;
        } catch (error) {
          Logger.log(`Fila ${i}: ${error}`);
        }
      }
    }
  }

  Logger.log(`Completado: ${procesados} enlaces creados`);
}

