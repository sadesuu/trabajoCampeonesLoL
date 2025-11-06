// Script de Google Apps Script para la API de Campeones de LoL
// Este script devuelve los datos del Google Sheet y procesa las imágenes de Drive

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "No se encontró la hoja 'Respuestas de formulario 1'"
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const json = [];

    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        let valor;

        if (j === 0) {
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

    // Obtener headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Buscar la columna "Imagen Del Campeon"
    let imagenColIndex = headers.indexOf("Imagen Del Campeon");

    if (imagenColIndex === -1) {
      Logger.log("No se encontró la columna 'Imagen Del Campeon'");
      return;
    }

    // Buscar o crear la columna "Enlace directo"
    let directLinkColIndex = headers.indexOf("Enlace directo");

    if (directLinkColIndex === -1) {
      // Crear la columna "Enlace directo" después de "Imagen Del Campeon"
      directLinkColIndex = imagenColIndex + 1;
      sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
    }

    // Obtener la URL de la imagen
    const imagenUrl = sheet.getRange(lastRow, imagenColIndex + 1).getValue();
    Logger.log("URL de imagen: " + imagenUrl);

    if (!imagenUrl) {
      Logger.log("No hay URL de imagen en la última fila");
      return;
    }

    // Extraer el ID de Drive
    const fileId = extractDriveFileId(imagenUrl);
    Logger.log("File ID extraído: " + fileId);

    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);

        // Cambiar permisos para que sea público
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // Crear enlace directo
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

        // Guardar en la columna "Enlace directo"
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);

        Logger.log("Enlace directo creado y guardado: " + directLink);
      } catch (error) {
        Logger.log("Error al procesar el archivo de Drive: " + error);
      }
    } else {
      Logger.log("No se pudo extraer el ID del archivo de la URL: " + imagenUrl);
    }
  } catch (error) {
    Logger.log("Error en onFormSubmit: " + error);
  }
}

// Función para extraer el ID de archivo de Google Drive de diferentes formatos de URL
function extractDriveFileId(url) {
  if (!url) return null;

  // Convertir a string por si acaso
  url = String(url);

  // Patrón 1: https://drive.google.com/open?id=FILE_ID
  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Patrón 2: https://drive.google.com/file/d/FILE_ID/
  match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Patrón 3: https://drive.google.com/uc?id=FILE_ID
  match = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  // Patrón 4: Solo el ID (25-40 caracteres alfanuméricos, guiones y guiones bajos)
  match = url.match(/^([a-zA-Z0-9_-]{25,40})$/);
  if (match) return match[1];

  return null;
}

// Función auxiliar para obtener el índice de una columna por su nombre
function getColumnIndexByName(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(columnName);
}

// FUNCIÓN MANUAL: Ejecuta esto MANUALMENTE para procesar todas las filas existentes
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
  let errores = 0;

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
          Logger.log(`Fila ${i}: Procesada correctamente`);
        } catch (error) {
          errores++;
          Logger.log(`Fila ${i}: Error - ${error}`);
        }
      }
    }
  }

  Logger.log(`Proceso completado: ${procesados} filas procesadas, ${errores} errores`);
}

