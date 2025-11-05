/**
 * Google Apps Script para API REST de Personajes (Versión Simplificada)
 *
 * Configuración:
 * 1. Crea una nueva hoja de cálculo de Google Sheets o usa tu Excel existente
 * 2. En la primera fila, añade estos encabezados:
 *    id | name | imageUrl | type | role
 * 3. Copia este código en un nuevo proyecto de Apps Script
 * 4. Reemplaza 'TU_SHEET_ID' con el ID de tu hoja de cálculo
 * 5. Despliega como aplicación web:
 *    - Ejecutar como: Tu cuenta
 *    - Quien tiene acceso: Cualquiera
 * 6. Copia la URL desplegada y úsala en CharacterRepository.kt
 */

const SHEET_ID = 'TU_SHEET_ID'; // Reemplaza con tu Sheet ID
const SHEET_NAME = 'Characters'; // Nombre de la hoja

/**
 * GET - Obtener todos los personajes o uno específico
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const characters = [];

    // Si se proporciona un ID, buscar ese personaje específico
    const id = e.parameter.id;

    // Iterar desde la fila 2 (índice 1) para saltar los encabezados
    for (let i = 1; i < data.length; i++) {
      // Asegurarse de que la fila no esté vacía
      if (!data[i][0] && !data[i][1]) continue;

      const character = {
        id: data[i][0] ? String(data[i][0]) : "",
        name: data[i][1] ? String(data[i][1]) : "",
        imageUrl: data[i][2] ? String(data[i][2]) : "",
        type: data[i][3] ? String(data[i][3]) : "",
        role: data[i][4] ? String(data[i][4]) : ""
      };

      if (id && character.id === id) {
        return createResponse(character);
      }

      characters.push(character);
    }

    return createResponse(characters);
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * POST - Crear un nuevo personaje
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const character = JSON.parse(e.postData.contents);

    // Validar datos requeridos
    if (!character.name) {
      return createErrorResponse('El nombre es requerido');
    }

    // Generar ID si no existe
    const newId = character.id || generateId();

    // Verificar si el personaje ya existe
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === newId) {
        return createErrorResponse('Un personaje con este ID ya existe');
      }
    }

    // Añadir nueva fila
    sheet.appendRow([
      newId,
      character.name,
      character.imageUrl || '',
      character.type || '',
      character.role || ''
    ]);

    return createResponse({ success: true, message: 'Personaje creado exitosamente', character: character });
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * PUT - Actualizar un personaje existente
 */
function doPut(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const character = JSON.parse(e.postData.contents);

    if (!character.id) {
      return createErrorResponse('ID es requerido para actualizar');
    }

    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;

    // Buscar el personaje por ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === character.id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Personaje no encontrado');
    }

    // Actualizar la fila
    sheet.getRange(rowIndex, 1, 1, 5).setValues([[
      character.id,
      character.name,
      character.imageUrl || '',
      character.type || '',
      character.role || ''
    ]]);

    return createResponse({ success: true, message: 'Personaje actualizado exitosamente', character: character });
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * DELETE - Eliminar un personaje
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

    // Buscar el personaje por ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Personaje no encontrado');
    }

    // Eliminar la fila
    sheet.deleteRow(rowIndex);

    return createResponse({ success: true, message: 'Personaje eliminado exitosamente' });
  } catch (error) {
    return createErrorResponse(error.message);
  }
}

/**
 * Generar un ID único
 */
function generateId() {
  return 'char_' + new Date().getTime();
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

