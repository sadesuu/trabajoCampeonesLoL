/**
 * Google Apps Script para API REST de Campeones de League of Legends
 * CONFIGURADO PARA TU GOOGLE SHEET
 *
 * INSTRUCCIONES:
 * 1. Ve a tu Google Sheet: https://docs.google.com/spreadsheets/d/1TbqK6owWvwXrLZxeCYPwXJME-o5apXQLSdMCtFV5sTc/edit
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra todo el código que aparezca
 * 4. Copia y pega TODO este código
 * 5. Guarda (Ctrl+S)
 * 6. Ve a Implementar > Nueva implementación
 * 7. Tipo: Aplicación web
 * 8. Ejecutar como: Yo (tu cuenta)
 * 9. Quién tiene acceso: Cualquiera
 * 10. Implementar
 * 11. Copia la URL que te da (termina en /exec)
 * 12. Pega esa URL en CharacterRepository.kt en la variable apiUrl
 */

const SHEET_ID = '1TbqK6owWvwXrLZxeCYPwXJME-o5apXQLSdMCtFV5sTc'; // ✅ Ya configurado
const SHEET_NAME = 'Hoja 1'; // 🔧 Cambia esto si tu hoja tiene otro nombre

/**
 * GET - Obtener todos los campeones o uno específico
 */
function doGet(e) {
  try {
    Logger.log('=== INICIO doGet ===');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      Logger.log('ERROR: No se encontró la hoja con nombre: ' + SHEET_NAME);
      return createErrorResponse('No se encontró la hoja. Verifica SHEET_NAME en el código.');
    }

    const data = sheet.getDataRange().getValues();
    Logger.log('Filas totales: ' + data.length);
    Logger.log('Encabezados: ' + JSON.stringify(data[0]));

    const champions = [];
    const id = e.parameter.id;

    // Iterar desde la fila 2 (índice 1) para saltar los encabezados
    for (let i = 1; i < data.length; i++) {
      // Asegurarse de que la fila no esté vacía
      if (!data[i][0] && !data[i][1]) {
        Logger.log('Fila ' + (i+1) + ' vacía, saltando...');
        continue;
      }

      const champion = {
        id: data[i][0] ? String(data[i][0]) : "",
        name: data[i][1] ? String(data[i][1]) : "",
        imageUrl: data[i][2] ? String(data[i][2]) : "",
        type: data[i][3] ? String(data[i][3]) : "",
        role: data[i][4] ? String(data[i][4]) : ""
      };

      Logger.log('Campeón ' + (i) + ': ' + JSON.stringify(champion));

      if (id && champion.id === id) {
        Logger.log('Retornando campeón con id: ' + id);
        return createResponse(champion);
      }

      champions.push(champion);
    }

    Logger.log('Total campeones a retornar: ' + champions.length);
    Logger.log('Champions JSON: ' + JSON.stringify(champions));
    return createResponse(champions);
  } catch (error) {
    Logger.log('ERROR en doGet: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    return createErrorResponse(error.message);
  }
}

/**
 * POST - Crear un nuevo campeón
 */
function doPost(e) {
  try {
    Logger.log('=== INICIO doPost ===');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const champion = JSON.parse(e.postData.contents);
    Logger.log('Datos recibidos: ' + JSON.stringify(champion));

    // Validar datos requeridos
    if (!champion.name) {
      return createErrorResponse('El nombre es requerido');
    }

    // Validar tipo
    const validTypes = ['Luchador', 'Mago', 'Tanque', 'Asesino', 'Tirador', 'Apoyo'];
    if (champion.type && !validTypes.includes(champion.type)) {
      Logger.log('Tipo inválido: ' + champion.type);
      return createErrorResponse('Tipo inválido. Debe ser: Luchador, Mago, Tanque, Asesino, Tirador o Apoyo');
    }

    // Validar rol
    const validRoles = ['Top', 'Mid', 'Jungler', 'ADC', 'Support', 'Jungla'];
    if (champion.role && !validRoles.includes(champion.role)) {
      Logger.log('Rol inválido: ' + champion.role);
      return createErrorResponse('Rol inválido. Debe ser: Top, Mid, Jungler, ADC, Support o Jungla');
    }

    // Generar ID si no existe
    const newId = champion.id || generateId();

    // Verificar si el campeón ya existe
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === newId) {
        return createErrorResponse('Un campeón con este ID ya existe');
      }
    }

    // Añadir nueva fila
    sheet.appendRow([
      newId,
      champion.name,
      champion.imageUrl || '',
      champion.type || '',
      champion.role || ''
    ]);

    Logger.log('Campeón creado con ID: ' + newId);

    return createResponse({
      success: true,
      message: 'Campeón creado exitosamente',
      champion: {
        id: newId,
        name: champion.name,
        imageUrl: champion.imageUrl || '',
        type: champion.type || '',
        role: champion.role || ''
      }
    });
  } catch (error) {
    Logger.log('ERROR en doPost: ' + error.message);
    return createErrorResponse(error.message);
  }
}

/**
 * PUT - Actualizar un campeón existente
 */
function doPut(e) {
  try {
    Logger.log('=== INICIO doPut ===');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const champion = JSON.parse(e.postData.contents);
    Logger.log('Datos recibidos: ' + JSON.stringify(champion));

    if (!champion.id) {
      return createErrorResponse('ID es requerido para actualizar');
    }

    // Validar tipo
    const validTypes = ['Luchador', 'Mago', 'Tanque', 'Asesino', 'Tirador', 'Apoyo'];
    if (champion.type && !validTypes.includes(champion.type)) {
      return createErrorResponse('Tipo inválido. Debe ser: Luchador, Mago, Tanque, Asesino, Tirador o Apoyo');
    }

    // Validar rol
    const validRoles = ['Top', 'Mid', 'Jungler', 'ADC', 'Support', 'Jungla'];
    if (champion.role && !validRoles.includes(champion.role)) {
      return createErrorResponse('Rol inválido. Debe ser: Top, Mid, Jungler, ADC, Support o Jungla');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Buscar el campeón por ID
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(champion.id)) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      Logger.log('Campeón no encontrado con ID: ' + champion.id);
      return createErrorResponse('Campeón no encontrado');
    }

    // Actualizar la fila
    sheet.getRange(rowIndex, 1, 1, 5).setValues([[
      champion.id,
      champion.name,
      champion.imageUrl || '',
      champion.type || '',
      champion.role || ''
    ]]);

    Logger.log('Campeón actualizado en fila: ' + rowIndex);

    return createResponse({
      success: true,
      message: 'Campeón actualizado exitosamente',
      champion: champion
    });
  } catch (error) {
    Logger.log('ERROR en doPut: ' + error.message);
    return createErrorResponse(error.message);
  }
}

/**
 * DELETE - Eliminar un campeón
 */
function doDelete(e) {
  try {
    Logger.log('=== INICIO doDelete ===');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const id = e.parameter.id;
    Logger.log('ID a eliminar: ' + id);

    if (!id) {
      return createErrorResponse('ID es requerido para eliminar');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Buscar el campeón por ID
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      Logger.log('Campeón no encontrado con ID: ' + id);
      return createErrorResponse('Campeón no encontrado');
    }

    // Eliminar la fila
    sheet.deleteRow(rowIndex);
    Logger.log('Campeón eliminado de fila: ' + rowIndex);

    return createResponse({
      success: true,
      message: 'Campeón eliminado exitosamente'
    });
  } catch (error) {
    Logger.log('ERROR en doDelete: ' + error.message);
    return createErrorResponse(error.message);
  }
}

/**
 * Generar un ID único
 */
function generateId() {
  return 'CH_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * Crear respuesta exitosa
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Crear respuesta de error
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      error: true,
      message: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para verificar la configuración
 * Ejecútala desde el editor de Apps Script para probar
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
    Logger.log('📈 Total de filas: ' + data.length);
    Logger.log('📋 Encabezados: ' + JSON.stringify(data[0]));

    if (data.length > 1) {
      Logger.log('✅ Hay datos en la hoja');
      Logger.log('👤 Primera fila de datos: ' + JSON.stringify(data[1]));
    } else {
      Logger.log('⚠️ No hay datos en la hoja (solo encabezados)');
    }

  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

