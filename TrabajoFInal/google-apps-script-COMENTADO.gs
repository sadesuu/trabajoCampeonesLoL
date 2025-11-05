// ============================================
// 📱 GOOGLE APPS SCRIPT PARA TU APP ANDROID
// ============================================
// Este script debe estar desplegado como Web App
// Acceso: "Cualquiera" o "Cualquiera con el enlace"
// Ejecutar como: "Yo"

// ============================================
// 📤 ENDPOINT GET - Devuelve todos los personajes
// ============================================
function doGet(e) {
  try {
    // 1. Obtener la hoja de respuestas del formulario
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");

    // 2. Leer todos los datos (incluyendo encabezados)
    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // Primera fila = nombres de columnas
    const json = [];

    // 3. IMPORTANTE: Verificar que existan estas columnas en la fila 1:
    // "Marca temporal", "nombre", "fotografía", "tipo", "rol", "Enlace directo"
    Logger.log("Headers encontrados: " + headers.join(", "));

    // 4. Procesar cada fila (empezar desde índice 1, saltando el encabezado)
    for (let i = 1; i < data.length; i++) {
      const row = {};

      // 5. Para cada columna, crear una propiedad en el objeto JSON
      for (let j = 0; j < headers.length; j++) {
        let valor;

        // 6. Formatear la fecha (columna 0 = "Marca temporal")
        if (j === 0) {
          let fecha = data[i][j];
          if (fecha instanceof Date) {
            valor = Utilities.formatDate(fecha, "Europe/Madrid", "dd/MM/yyyy HH:mm:ss");
          } else {
            valor = fecha;
          }
        } else {
          valor = data[i][j];
        }

        // 7. ⚠️ CRÍTICO: El nombre de la clave DEBE coincidir con @SerializedName en Android
        // Si tu columna se llama "Nombre" (con mayúscula), el JSON tendrá "Nombre"
        // y debes cambiar en Android: @SerializedName("Nombre")
        row[headers[j]] = valor;
      }

      json.push(row);
    }

    Logger.log("Total de personajes devueltos: " + json.length);

    // 8. Devolver el JSON
    return ContentService.createTextOutput(JSON.stringify(json))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("❌ Error en doGet: " + error);

    // 9. Devolver error en formato JSON
    return ContentService.createTextOutput(JSON.stringify({
      error: "Error al obtener datos",
      message: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// 🔄 TRIGGER - Se ejecuta al enviar el formulario
// ============================================
// Este trigger debe configurarse en: Activadores → onFormSubmit
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    const lastRow = sheet.getLastRow();

    // 1. Verificar que exista la columna "Enlace directo"
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let directLinkColIndex = headers.indexOf("Enlace directo");

    // 2. Si no existe, crearla después de "Imaguen Del Campeon"
    if (directLinkColIndex === -1) {
      const fotoColIndex = getColumnIndexByName(sheet, "Imaguen Del Campeon");  // ← ACTUALIZADO
      if (fotoColIndex !== -1) {
        directLinkColIndex = fotoColIndex + 1;
        sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
        Logger.log("✅ Columna 'Enlace directo' creada en posición: " + (directLinkColIndex + 1));
      }
    }

    // 3. Obtener la URL de Google Drive de la columna "Imaguen Del Campeon"
    const fotoColIndex = getColumnIndexByName(sheet, "Imaguen Del Campeon");  // ← ACTUALIZADO

    if (fotoColIndex === -1) {
      Logger.log("❌ No se encontró la columna 'Imaguen Del Campeon'");
      return;
    }

    const fotoUrl = sheet.getRange(lastRow, fotoColIndex + 1).getValue();
    Logger.log("📸 URL de foto recibida: " + fotoUrl);

    // 4. Extraer el ID del archivo de Drive
    const fileId = extractDriveFileId(fotoUrl);
    Logger.log("🔑 File ID extraído: " + fileId);

    if (fileId) {
      try {
        // 5. Obtener el archivo y cambiar permisos
        const file = DriveApp.getFileById(fileId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        Logger.log("🔓 Permisos del archivo actualizados");

        // 6. Generar URL directa para cargar en la app
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

        // 7. Guardar en la columna "Enlace directo"
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);
        Logger.log("✅ Enlace directo guardado: " + directLink);

      } catch (error) {
        Logger.log("❌ Error al procesar el archivo de Drive: " + error);
      }
    } else {
      Logger.log("❌ No se pudo extraer el ID del archivo de la URL: " + fotoUrl);
    }

  } catch (error) {
    Logger.log("❌ Error en onFormSubmit: " + error);
  }
}

// ============================================
// 🔧 FUNCIONES AUXILIARES
// ============================================

/**
 * Extrae el ID de un archivo de Drive de diferentes formatos de URL
 */
function extractDriveFileId(url) {
  if (!url) return null;

  // Patrones comunes de URL de Google Drive
  const patterns = [
    /[-\w]{25,}/,                    // ID suelto
    /\/d\/([-\w]{25,})/,             // /d/ID/
    /id=([-\w]{25,})/,               // ?id=ID
    /\/file\/d\/([-\w]{25,})/        // /file/d/ID/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

/**
 * Obtiene el índice de una columna por su nombre
 */
function getColumnIndexByName(sheet, columnName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(columnName);
}

// ============================================
// 🧪 FUNCIONES DE PRUEBA
// ============================================

/**
 * Prueba la extracción de IDs de archivos
 * Ejecutar: testExtractFileId
 */
function testExtractFileId() {
  const testUrls = [
    "https://drive.google.com/open?id=1ABC123",
    "https://drive.google.com/file/d/1ABC123/view",
    "https://docs.google.com/file/d/1ABC123"
  ];

  testUrls.forEach(url => {
    Logger.log("URL: " + url + " → ID: " + extractDriveFileId(url));
  });
}

/**
 * Verifica los nombres de las columnas
 * Ejecutar: testHeaders
 */
function testHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  Logger.log("=== NOMBRES DE COLUMNAS ===");
  headers.forEach((header, index) => {
    Logger.log(`Columna ${index + 1}: "${header}"`);
  });

  Logger.log("\n=== VERIFICACIÓN ===");
  const required = ["Marca temporal", "Nombre", "Imaguen Del Campeon", "Tipo", "Rol"];  // ← ACTUALIZADO
  required.forEach(req => {
    const found = headers.indexOf(req) !== -1;
    Logger.log(`${found ? "✅" : "❌"} ${req}`);
  });

  // Verificar si existe "Enlace directo" (opcional)
  const hasDirectLink = headers.indexOf("Enlace directo") !== -1;
  Logger.log(`${hasDirectLink ? "✅" : "⚠️"} Enlace directo ${hasDirectLink ? "(existe)" : "(se creará automáticamente)"}`);
}

/**
 * Procesa manualmente todas las filas para generar "Enlace directo"
 * Ejecutar: procesarTodasLasFilas
 */
function procesarTodasLasFilas() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const fotoColIndex = headers.indexOf("Imaguen Del Campeon");  // ← ACTUALIZADO
  let directLinkColIndex = headers.indexOf("Enlace directo");

  // Si no existe la columna "Enlace directo", crearla
  if (directLinkColIndex === -1) {
    directLinkColIndex = fotoColIndex + 1;
    sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo");
    Logger.log("✅ Columna 'Enlace directo' creada");
  }

  if (fotoColIndex === -1) {
    Logger.log("❌ No se encontró la columna 'Imaguen Del Campeon'");
    return;
  }

  Logger.log("Procesando " + (data.length - 1) + " filas...");

  for (let i = 1; i < data.length; i++) {
    const fotoUrl = data[i][fotoColIndex];
    const fileId = extractDriveFileId(fotoUrl);

    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        sheet.getRange(i + 1, directLinkColIndex + 1).setValue(directLink);
        Logger.log(`✅ Fila ${i + 1}: ${directLink}`);
      } catch (error) {
        Logger.log(`❌ Fila ${i + 1}: Error - ${error}`);
      }
    } else {
      Logger.log(`⚠️ Fila ${i + 1}: No se pudo extraer ID de ${fotoUrl}`);
    }
  }

  Logger.log("✅ Proceso completado");
}

