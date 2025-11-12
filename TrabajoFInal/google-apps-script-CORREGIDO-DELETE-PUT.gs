/**
 * Google Apps Script para API REST de Campeones de League of Legends
 * VERSIÓN CORREGIDA - DELETE Y PUT FUNCIONANDO
 *
 * ORDEN DE COLUMNAS EN GOOGLE SHEETS:
 * Marca temporal | Nombre | Tipo | Rol | Imagen Del Campeon | Enlace directo
 *
 * INSTRUCCIONES DE ACTUALIZACIÓN:
 * 1. Ve a tu Google Sheet
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra todo el código existente
 * 4. Copia y pega TODO este código
 * 5. Guarda (Ctrl+S o Cmd+S)
 * 6. Ve a Implementar > Administrar implementaciones
 * 7. Edita la implementación existente
 * 8. Nueva versión: Nueva versión
 * 9. Descripción: "Corrección DELETE y PUT"
 * 10. Implementar
 */

// ============================================
// CONFIGURACIÓN
// ============================================
const SHEET_ID = '1TbqK6owWvwXrLZxeCYPwXJME-o5apXQLSdMCtFV5sTc';
const SHEET_NAME = 'Respuestas de formulario 1';

// Nombres de las columnas en el Google Sheet
const COLUMN_TIMESTAMP = 'Marca temporal';
const COLUMN_NAME = 'Nombre';
const COLUMN_TYPE = 'Tipo';
const COLUMN_ROLE = 'Rol';
const COLUMN_IMAGE_URL = 'Imagen Del Campeon';
const COLUMN_IMAGE_PUBLIC_URL = 'Enlace directo';

// ============================================
// GET - Obtener todos los campeones
// ============================================
function doGet(e) {
  try {
    Logger.log('=== INICIO doGet ===');

    // Manejar ejecuciones manuales sin parámetros
    if (!e || !e.parameter) {
      Logger.log('Ejecutado manualmente sin parámetros - devolviendo lista de campeones');
      e = { parameter: {} };
    }

    // Verificar si es una petición DELETE (workaround para Android)
    if (e.parameter && (e.parameter.method === 'DELETE' || e.parameter._method === 'DELETE')) {
      Logger.log('Detectado método DELETE via GET con parámetro');
      return doDelete(e);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      Logger.log('ERROR: No se encontró la hoja: ' + SHEET_NAME);
      return createErrorResponse('No se encontró la hoja de datos');
    }

    const data = sheet.getDataRange().getValues();

    if (data.length === 0) {
      Logger.log('La hoja está vacía');
      return createResponse([]);
    }

    const headers = data[0];
    Logger.log('Encabezados encontrados: ' + JSON.stringify(headers));

    const champions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (!row[0] && !row[1]) {
        continue;
      }

      const champion = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        let value = row[j];

        if (header === COLUMN_TIMESTAMP && value instanceof Date) {
          value = Utilities.formatDate(value, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
        }

        champion[header] = value || "";
      }

      champions.push(champion);
    }

    Logger.log('Total campeones: ' + champions.length);
    return createResponse(champions);

  } catch (error) {
    Logger.log('ERROR en doGet: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createErrorResponse(error.message);
  }
}

// ============================================
// POST - Crear un nuevo campeón
// ============================================
function doPost(e) {
  try {
    Logger.log('=== INICIO doPost ===');

    // Manejar ejecuciones manuales sin datos
    if (!e || !e.postData || !e.postData.contents) {
      return createErrorResponse('No se recibieron datos. Debes enviar una petición POST con datos JSON.');
    }

    Logger.log('Datos recibidos: ' + e.postData.contents);

    // Verificar si es una petición PUT/DELETE disfrazada
    const requestData = JSON.parse(e.postData.contents);
    if (requestData._method === 'PUT') {
      Logger.log('Detectado método PUT via POST');
      return doPut(e);
    }
    if (requestData._method === 'DELETE') {
      Logger.log('Detectado método DELETE via POST');
      e.parameter = e.parameter || {};
      e.parameter.id = requestData.id || requestData[COLUMN_NAME] || requestData.name;
      return doDelete(e);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createErrorResponse('No se encontró la hoja de datos');
    }

    const champion = requestData;
    Logger.log('Champion parseado: ' + JSON.stringify(champion));

    const name = champion[COLUMN_NAME] || champion.name || "";
    if (!name) {
      return createErrorResponse('El nombre del campeón es requerido');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const nameColumnIndex = headers.indexOf(COLUMN_NAME);

    if (nameColumnIndex !== -1) {
      for (let i = 1; i < data.length; i++) {
        if (data[i][nameColumnIndex] && String(data[i][nameColumnIndex]).toLowerCase() === name.toLowerCase()) {
          return createErrorResponse('Ya existe un campeón con ese nombre');
        }
      }
    }

    const timestamp = new Date();
    const type = champion[COLUMN_TYPE] || champion.type || "";
    const role = champion[COLUMN_ROLE] || champion.role || "";
    let imageUrl = champion[COLUMN_IMAGE_URL] || champion.imageUrl || "";

    let imagePublicUrl = "";

    const imageBase64 = champion.imageBase64 || "";
    const imageFileName = champion.imageFileName || (name + ".jpg");

    if (imageBase64) {
      try {
        const blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), 'image/jpeg', imageFileName);
        const folder = DriveApp.getFolderById(DriveApp.getRootFolder().getId());
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const fileId = file.getId();
        imageUrl = 'https://drive.google.com/open?id=' + fileId;
        imagePublicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
        Logger.log('Imagen subida desde base64: ' + imagePublicUrl);
      } catch (err) {
        Logger.log('Error al crear archivo desde base64: ' + err);
      }
    } else if (imageUrl && !imagePublicUrl) {
      const fileId = extractDriveFileId(imageUrl);
      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          imagePublicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
          Logger.log('Enlace directo generado: ' + imagePublicUrl);
        } catch (error) {
          Logger.log('Error al procesar imagen: ' + error.message);
        }
      }
    }

    const newRow = [timestamp, name, type, role, imageUrl];
    sheet.appendRow(newRow);
    Logger.log('Fila agregada: ' + JSON.stringify(newRow));

    if (imagePublicUrl) {
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let directLinkColIndex = currentHeaders.indexOf(COLUMN_IMAGE_PUBLIC_URL);

      if (directLinkColIndex === -1) {
        directLinkColIndex = currentHeaders.length;
        sheet.getRange(1, directLinkColIndex + 1).setValue(COLUMN_IMAGE_PUBLIC_URL);
        Logger.log('Columna "Enlace directo" creada en posición: ' + (directLinkColIndex + 1));
      }

      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, directLinkColIndex + 1).setValue(imagePublicUrl);
      Logger.log('Enlace directo guardado en fila ' + lastRow + ', columna ' + (directLinkColIndex + 1));
    }

    return createResponse({
      success: true,
      message: 'Campeón creado exitosamente',
      data: {
        [COLUMN_TIMESTAMP]: Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"),
        [COLUMN_NAME]: name,
        [COLUMN_TYPE]: type,
        [COLUMN_ROLE]: role,
        [COLUMN_IMAGE_URL]: imageUrl,
        [COLUMN_IMAGE_PUBLIC_URL]: imagePublicUrl
      }
    });

  } catch (error) {
    Logger.log('ERROR en doPost: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createErrorResponse(error.message);
  }
}

// ============================================
// PUT - Actualizar un campeón existente
// ============================================
function doPut(e) {
  try {
    Logger.log('=== INICIO doPut ===');

    // Manejar ejecuciones manuales
    if (!e) {
      return createErrorResponse('No se recibieron datos. Debes enviar una petición PUT con datos JSON.');
    }

    Logger.log('Tipo de petición: ' + (e.postData ? 'POST' : 'PUT'));
    Logger.log('Datos recibidos: ' + (e.postData ? e.postData.contents : 'sin postData'));

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return createErrorResponse('No se encontró la hoja de datos');
    }

    const champion = e.postData ? JSON.parse(e.postData.contents) : e.parameter;
    Logger.log('Champion parseado: ' + JSON.stringify(champion));

    const originalName = (champion.originalName || '').toString().trim();
    const targetName = (champion[COLUMN_NAME] || champion.name || '').toString().trim();

    // Elegir el nombre por el que se buscará en la hoja: originalName si fue enviado
    const searchName = originalName || targetName;
    Logger.log('Buscando campeón con nombre: "' + searchName + '" (originalName="' + originalName + '", targetName="' + targetName + '")');

    if (!searchName) {
      return createErrorResponse('El nombre del campeón es requerido para actualizar');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const nameColumnIndex = headers.indexOf(COLUMN_NAME);
    const typeColumnIndex = headers.indexOf(COLUMN_TYPE);
    const roleColumnIndex = headers.indexOf(COLUMN_ROLE);
    const imageUrlColumnIndex = headers.indexOf(COLUMN_IMAGE_URL);
    const imagePublicUrlColumnIndex = headers.indexOf(COLUMN_IMAGE_PUBLIC_URL);

    Logger.log('Índices de columnas - Nombre: ' + nameColumnIndex + ', Tipo: ' + typeColumnIndex + ', Rol: ' + roleColumnIndex);

    if (nameColumnIndex === -1) {
      return createErrorResponse('No se encontró la columna de nombres');
    }

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const cellName = String(data[i][nameColumnIndex] || '').trim();
      if (cellName.toLowerCase() === searchName.toLowerCase()) {
        rowIndex = i + 1;
        Logger.log('¡Campeón encontrado en fila: ' + rowIndex + '!');
        break;
      }
    }

    if (rowIndex === -1) {
      Logger.log('Campeón NO encontrado. Nombres en la hoja:');
      for (let i = 1; i < data.length; i++) {
        Logger.log('  Fila ' + (i+1) + ': "' + data[i][nameColumnIndex] + '"');
      }
      return createErrorResponse('No se encontró el campeón a actualizar: ' + searchName);
    }

    const type = champion[COLUMN_TYPE] || champion.type || '';
    const role = champion[COLUMN_ROLE] || champion.role || '';
    let imageUrl = champion[COLUMN_IMAGE_URL] || champion.imageUrl || data[rowIndex - 1][imageUrlColumnIndex] || '';
    let imagePublicUrl = champion[COLUMN_IMAGE_PUBLIC_URL] || champion.imagePublicUrl || data[rowIndex - 1][imagePublicUrlColumnIndex] || '';

    const imageBase64 = champion.imageBase64 || '';
    const imageFileName = champion.imageFileName || (targetName + '.jpg');

    if (imageBase64) {
      try {
        const blob = Utilities.newBlob(Utilities.base64Decode(imageBase64), 'image/jpeg', imageFileName);
        const folder = DriveApp.getFolderById(DriveApp.getRootFolder().getId());
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const fileId = file.getId();
        imageUrl = 'https://drive.google.com/open?id=' + fileId;
        imagePublicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
        Logger.log('Nueva imagen subida: ' + imagePublicUrl);
      } catch (err) {
        Logger.log('Error al crear archivo desde base64 (PUT): ' + err);
      }
    } else if (imageUrl && !imagePublicUrl) {
      const fileId = extractDriveFileId(imageUrl);
      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          imagePublicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
        } catch (error) {
          Logger.log('Error al procesar imagen (PUT): ' + error.message);
        }
      }
    }

    Logger.log('Actualizando fila ' + rowIndex + ' con: Nombre="' + targetName + '", Tipo="' + type + '", Rol="' + role + '"');

    // Si el nombre cambió (originalName diferente a targetName), actualizar la columna Nombre
    if (originalName && targetName && originalName.toLowerCase() !== targetName.toLowerCase()) {
      sheet.getRange(rowIndex, nameColumnIndex + 1).setValue(targetName);
    }

    if (typeColumnIndex !== -1) sheet.getRange(rowIndex, typeColumnIndex + 1).setValue(type);
    if (roleColumnIndex !== -1) sheet.getRange(rowIndex, roleColumnIndex + 1).setValue(role);
    if (imageUrlColumnIndex !== -1) sheet.getRange(rowIndex, imageUrlColumnIndex + 1).setValue(imageUrl);
    if (imagePublicUrlColumnIndex !== -1) sheet.getRange(rowIndex, imagePublicUrlColumnIndex + 1).setValue(imagePublicUrl);

    Logger.log('✅ Campeón actualizado exitosamente');

    return createResponse({
      success: true,
      message: 'Campeón actualizado exitosamente',
      data: champion
    });

  } catch (error) {
    Logger.log('ERROR en doPut: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createErrorResponse(error.message);
  }
}

// ============================================
// DELETE - Eliminar un campeón
// ============================================
function doDelete(e) {
  try {
    Logger.log('=== INICIO doDelete ===');

    // Manejar ejecuciones manuales
    if (!e || !e.parameter) {
      return createErrorResponse('No se recibieron parámetros. Debes enviar el parámetro "id" con el nombre del campeón.');
    }

    Logger.log('Parámetros recibidos: ' + JSON.stringify(e.parameter));

    const name = e.parameter.id || e.parameter.name || e.parameter[COLUMN_NAME];
    Logger.log('Nombre a eliminar: "' + name + '"');

    if (!name) {
      return createErrorResponse('El nombre del campeón es requerido para eliminar');
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createErrorResponse('No se encontró la hoja de datos');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const nameColumnIndex = headers.indexOf(COLUMN_NAME);

    Logger.log('Índice de columna nombre: ' + nameColumnIndex);

    if (nameColumnIndex === -1) {
      return createErrorResponse('No se encontró la columna de nombres');
    }

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const cellName = String(data[i][nameColumnIndex] || "").trim();
      const searchName = name.trim();
      Logger.log('Comparando fila ' + (i+1) + ': "' + cellName + '" vs "' + searchName + '"');

      if (cellName.toLowerCase() === searchName.toLowerCase()) {
        rowIndex = i + 1;
        Logger.log('¡Campeón encontrado en fila: ' + rowIndex + '!');
        break;
      }
    }

    if (rowIndex === -1) {
      Logger.log('Campeón NO encontrado. Nombres en la hoja:');
      for (let i = 1; i < data.length; i++) {
        Logger.log('  Fila ' + (i+1) + ': "' + data[i][nameColumnIndex] + '"');
      }
      return createErrorResponse('No se encontró el campeón a eliminar: ' + name);
    }

    sheet.deleteRow(rowIndex);
    Logger.log('✅ Campeón eliminado de fila: ' + rowIndex);

    return createResponse({
      success: true,
      message: 'Campeón eliminado exitosamente'
    });

  } catch (error) {
    Logger.log('ERROR en doDelete: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createErrorResponse(error.message);
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Extrae el ID de archivo de una URL de Google Drive
 */
function extractDriveFileId(url) {
  if (!url) return null;
  url = String(url);

  let patterns = [
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /\/uc\?.*id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{25,})$/
  ];

  for (let pattern of patterns) {
    let match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Crea una respuesta exitosa en formato JSON
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Crea una respuesta de error en formato JSON
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      error: true,
      message: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// FUNCIÓN DE PRUEBA
// ============================================

/**
 * Función de prueba para verificar la configuración
 */
function testConfig() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      Logger.log('❌ ERROR: No se encontró la hoja "' + SHEET_NAME + '"');
      Logger.log('📋 Hojas disponibles:');
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const sheets = ss.getSheets();
      sheets.forEach(s => Logger.log('   - ' + s.getName()));
      return;
    }

    Logger.log('✅ Conexión exitosa al Sheet');
    Logger.log('📊 Nombre de la hoja: ' + sheet.getName());

    const data = sheet.getDataRange().getValues();
    Logger.log('📝 Total de filas: ' + data.length);

    if (data.length > 0) {
      Logger.log('📋 Encabezados encontrados:');
      data[0].forEach((header, index) => {
        Logger.log('   Columna ' + (index + 1) + ': "' + header + '"');
      });

      Logger.log('\n📋 Orden esperado de columnas:');
      Logger.log('   1. Marca temporal');
      Logger.log('   2. Nombre');
      Logger.log('   3. Tipo');
      Logger.log('   4. Rol');
      Logger.log('   5. Imagen Del Campeon');
      Logger.log('   6. Enlace directo (opcional)');
    }

    if (data.length > 1) {
      Logger.log('\n📄 Campeones encontrados:');
      const headers = data[0];
      const nameIndex = headers.indexOf(COLUMN_NAME);
      for (let i = 1; i < data.length; i++) {
        Logger.log('   ' + i + '. ' + data[i][nameIndex]);
      }
    }

    Logger.log('\n✅ Configuración correcta');
    Logger.log('🚀 Puedes implementar el script como aplicación web');

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * Trigger automático cuando se envía el formulario
 */
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const imageUrlColIndex = headers.indexOf(COLUMN_IMAGE_URL);
    let directLinkColIndex = headers.indexOf(COLUMN_IMAGE_PUBLIC_URL);

    if (imageUrlColIndex === -1) {
      Logger.log('No se encontró la columna de imagen');
      return;
    }

    if (directLinkColIndex === -1) {
      directLinkColIndex = headers.length;
      sheet.getRange(1, directLinkColIndex + 1).setValue(COLUMN_IMAGE_PUBLIC_URL);
    }

    const imageUrl = sheet.getRange(lastRow, imageUrlColIndex + 1).getValue();
    const fileId = extractDriveFileId(imageUrl);

    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);
        Logger.log('Enlace directo creado: ' + directLink);
      } catch (error) {
        Logger.log('Error al procesar archivo: ' + error.message);
      }
    }
  } catch (error) {
    Logger.log('Error en onFormSubmit: ' + error.message);
  }
}
