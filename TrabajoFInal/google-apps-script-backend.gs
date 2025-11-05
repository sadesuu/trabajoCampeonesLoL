/**
 * Google Apps Script para API REST de Personajes
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
    const headers = data[0];
    const characters = [];

    // Si se proporciona un ID, buscar ese personaje específico
    const id = e.parameter.id;

    for (let i = 1; i < data.length; i++) {
      const rawImage = data[i][2] || '';
      const rawRole = data[i][4] || '';

      const character = {
        id: data[i][0],
        name: data[i][1],
        imageUrl: rawImage,
        imagePublicUrl: normalizeImageUrl(rawImage, rawRole),
        race: data[i][3],
        role: rawRole,
        type: data[i][5],
        faction: data[i][6],
        level: parseInt(data[i][7]) || 0,
        attack: parseInt(data[i][8]) || 0,
        defense: parseInt(data[i][9]) || 0,
        speed: parseInt(data[i][10]) || 0,
        magic: parseInt(data[i][11]) || 0,
        biography: data[i][12] || ''
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
    if (!character.id || !character.name) {
      return createErrorResponse('ID y nombre son requeridos');
    }

    // Verificar si el personaje ya existe
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][0] === character.id) {
        return createErrorResponse('Un personaje con este ID ya existe');
      }
    }

    // Añadir nueva fila
    sheet.appendRow([
      character.id,
      character.name,
      character.imageUrl || '',
      character.race || '',
      character.role || '',
      character.type || '',
      character.faction || '',
      character.level || 0,
      character.attack || 0,
      character.defense || 0,
      character.speed || 0,
      character.magic || 0,
      character.biography || ''
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
    sheet.getRange(rowIndex, 1, 1, 13).setValues([[
      character.id,
      character.name,
      character.imageUrl || '',
      character.race || '',
      character.role || '',
      character.type || '',
      character.faction || '',
      character.level || 0,
      character.attack || 0,
      character.defense || 0,
      character.speed || 0,
      character.magic || 0,
      character.biography || ''
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
    .createTextOutput(JSON.stringify({ error: true, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para inicializar la hoja con datos de ejemplo
 * Ejecutar una vez para crear personajes de ejemplo
 */
function initializeWithSampleData() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  // Limpiar la hoja
  sheet.clear();

  // Añadir encabezados
  sheet.appendRow(['id', 'name', 'imageUrl', 'race', 'role', 'type', 'faction', 'level', 'attack', 'defense', 'speed', 'magic', 'biography']);

  // Añadir personajes de ejemplo
  const sampleCharacters = [
    {
      id: '1',
      name: 'Aragorn',
      imageUrl: 'https://example.com/aragorn.jpg',
      race: 'Human',
      role: 'DPS',
      type: 'Ranger',
      faction: 'Dunedain',
      level: 87,
      attack: 1350,
      defense: 950,
      speed: 180,
      magic: 200,
      biography: 'El heredero de Isildur y futuro Rey de Gondor. Un experto guerrero y líder nato.'
    },
    {
      id: '2',
      name: 'Legolas',
      imageUrl: 'https://example.com/legolas.jpg',
      race: 'Elf',
      role: 'DPS',
      type: 'Ranger',
      faction: 'Mirkwood',
      level: 90,
      attack: 1500,
      defense: 800,
      speed: 200,
      magic: 600,
      biography: 'Príncipe élfico del Bosque Negro. Maestro arquero con vista aguda y reflejos incomparables.'
    },
    {
      id: '3',
      name: 'Gimli',
      imageUrl: 'https://example.com/gimli.jpg',
      race: 'Dwarf',
      role: 'Tank',
      type: 'Warrior',
      faction: 'Erebor',
      level: 85,
      attack: 1200,
      defense: 1400,
      speed: 120,
      magic: 50,
      biography: 'Guerrero enano de la Montaña Solitaria. Resistente y feroz en combate cuerpo a cuerpo.'
    }
  ];

  sampleCharacters.forEach(character => {
    sheet.appendRow([
      character.id,
      character.name,
      character.imageUrl,
      character.race,
      character.role,
      character.type,
      character.faction,
      character.level,
      character.attack,
      character.defense,
      character.speed,
      character.magic,
      character.biography
    ]);
  });

  Logger.log('Hoja inicializada con datos de ejemplo');
}

/**
 * Normalize a Google Drive/Docs image URL or fallback to role if that contains the URL.
 * Returns a direct viewable URL (https://drive.google.com/uc?export=view&id=FILE_ID) when possible.
 */
function normalizeImageUrl(imageUrl, role) {
  var raw = (imageUrl || '').toString().trim();
  var rawRole = (role || '').toString().trim();

  function extractFromString(s) {
    if (!s) return '';
    // If direct googleusercontent link
    if (s.indexOf('lh3.googleusercontent.com') !== -1) return s;
    // If already uc? export
    if (s.indexOf('drive.google.com/uc?') !== -1 || s.indexOf('docs.google.com/uc?') !== -1) return s;
    // drive file pattern
    var m = s.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (m && m[1]) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    // id param
    m = s.match(/[?&]id=([^&]+)/);
    if (m && m[1]) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    // docs URLs
    m = s.match(/docs\.google\.com\/.+\/d\/([^/]+)/);
    if (m && m[1]) return 'https://drive.google.com/uc?export=view&id=' + m[1];
    // http fallback
    if (s.indexOf('http') === 0) return s;
    return '';
  }

  var fromImage = extractFromString(raw);
  if (fromImage) return fromImage;

  var fromRole = extractFromString(rawRole);
  if (fromRole) return fromRole;

  return '';
}
