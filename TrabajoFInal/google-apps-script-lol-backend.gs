/**
 * Google Apps Script para API REST de Campeones de League of Legends
 *
 * Configuración:
 * 1. Crea una nueva hoja de cálculo de Google Sheets
 * 2. En la primera fila, añade estos encabezados:
 *    id | name | imageUrl | type | role
 * 3. Copia este código en un nuevo proyecto de Apps Script
 * 4. Reemplaza 'TU_SHEET_ID' con el ID de tu hoja de cálculo
 * 5. Despliega como aplicación web:
 *    - Ejecutar como: Tu cuenta
 *    - Quien tiene acceso: Cualquiera
 * 6. Copia la URL desplegada y úsala en CharacterRepository.kt
 *
 * Tipos válidos: Luchador, Mago, Tanque, Asesino
 * Roles válidos: Top, Mid, Jungler, ADC, Support
 */

const SHEET_ID = 'TU_SHEET_ID'; // Reemplaza con tu Sheet ID
const SHEET_NAME = 'Champions'; // Nombre de la hoja

/**
 * GET - Obtener todos los campeones o uno específico
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const champions = [];

    // Si se proporciona un ID, buscar ese campeón específico
    const id = e.parameter.id;

    // Iterar desde la fila 2 (índice 1) para saltar los encabezados
    for (let i = 1; i < data.length; i++) {
      // Asegurarse de que la fila no esté vacía
      if (!data[i][0] && !data[i][1]) continue;

      const champion = {
        id: data[i][0] ? String(data[i][0]) : "",
        name: data[i][1] ? String(data[i][1]) : "",
        imageUrl: data[i][2] ? String(data[i][2]) : "",
        type: data[i][3] ? String(data[i][3]) : "", // Luchador, Mago, Tanque, Asesino
        role: data[i][4] ? String(data[i][4]) : ""  // Top, Mid, Jungler, ADC, Support
      };

      if (id && champion.id === id) {
        return createResponse(champion);
      }

      champions.push(champion);
    }

    return createResponse(champions);
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * POST - Crear un nuevo campeón
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const champion = JSON.parse(e.postData.contents);

    // Validar datos requeridos
    if (!champion.name) {
      return createErrorResponse('El nombre es requerido');
    }

    // Validar tipo
    const validTypes = ['Luchador', 'Mago', 'Tanque', 'Asesino'];
    if (champion.type && !validTypes.includes(champion.type)) {
      return createErrorResponse('Tipo inválido. Debe ser: Luchador, Mago, Tanque o Asesino');
    }

    // Validar rol
    const validRoles = ['Top', 'Mid', 'Jungler', 'ADC', 'Support'];
    if (champion.role && !validRoles.includes(champion.role)) {
      return createErrorResponse('Rol inválido. Debe ser: Top, Mid, Jungler, ADC o Support');
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
    return createErrorResponse(error.message);
  }
}

/**
 * PUT - Actualizar un campeón existente
 */
function doPut(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const champion = JSON.parse(e.postData.contents);

    if (!champion.id) {
      return createErrorResponse('ID es requerido para actualizar');
    }

    // Validar tipo
    const validTypes = ['Luchador', 'Mago', 'Tanque', 'Asesino'];
    if (champion.type && !validTypes.includes(champion.type)) {
      return createErrorResponse('Tipo inválido. Debe ser: Luchador, Mago, Tanque o Asesino');
    }

    // Validar rol
    const validRoles = ['Top', 'Mid', 'Jungler', 'ADC', 'Support'];
    if (champion.role && !validRoles.includes(champion.role)) {
      return createErrorResponse('Rol inválido. Debe ser: Top, Mid, Jungler, ADC o Support');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Buscar el campeón por ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === champion.id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
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

    return createResponse({
      success: true,
      message: 'Campeón actualizado exitosamente',
      champion: champion
    });
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * DELETE - Eliminar un campeón
 */
function doDelete(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const id = e.parameter.id;

    if (!id) {
      return createErrorResponse('ID es requerido para eliminar');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Buscar el campeón por ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Campeón no encontrado');
    }

    // Eliminar la fila
    sheet.deleteRow(rowIndex);

    return createResponse({
      success: true,
      message: 'Campeón eliminado exitosamente'
    });
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * Generar un ID único
 */
function generateId() {
  return 'champ_' + new Date().getTime();
}

/**
 * Crear respuesta JSON exitosa
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
    .createTextOutput(JSON.stringify({ error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

