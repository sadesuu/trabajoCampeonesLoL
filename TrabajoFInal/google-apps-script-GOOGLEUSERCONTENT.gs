function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        error: "No se encontró la hoja 'Respuestas de formulario 1'"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // Primera fila con los nombres de columnas
    const result = [];

    // Iterar desde la fila 2 (índice 1) para omitir encabezados
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // ✅ Formatear fecha correctamente
      let fechaFormateada = "";
      try {
        const fecha = new Date(row[0]);
        if (!isNaN(fecha.getTime())) {
          const dia = fecha.getDate().toString().padStart(2, "0");
          const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
          const year = fecha.getFullYear();
          const horas = fecha.getHours().toString().padStart(2, "0");
          const minutos = fecha.getMinutes().toString().padStart(2, "0");
          const segundos = fecha.getSeconds().toString().padStart(2, "0");
          fechaFormateada = `${dia}/${mes}/${year} ${horas}:${minutos}:${segundos}`;
        }
      } catch (err) {
        fechaFormateada = row[0] || "";
      }

      // Crear objeto con los nombres exactos de las columnas
      const objeto = {
        "Marca temporal": fechaFormateada,
        "Nombre": row[1] || "",
        "Tipo": row[2] || "",
        "Rol": row[3] || "",
        "Imagen Del Campeon": row[4] || "",
        "Enlace directo": convertirImagen(row[4] || "") // 👈 Conversión a enlace visible
      };

      result.push(objeto);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error en doGet: " + error);
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ✅ Convierte un enlace de Google Drive en uno que Glide pueda mostrar.
 * Ejemplo:
 * https://drive.google.com/open?id=XXX  →  https://lh3.googleusercontent.com/d/XXX=s800
 */
function convertirImagen(url) {
  if (!url) return "";

  // Si ya es una imagen directa
  if (url.includes("googleusercontent")) return url;

  // Intentar extraer el ID del archivo
  let idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!idMatch) {
    idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  }
  if (!idMatch) {
    idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  }

  const id = idMatch ? idMatch[1] : null;
  if (!id) return "";

  // ✅ Enlace que devuelve imagen directa, compatible con Glide
  return `https://lh3.googleusercontent.com/d/${id}=s800`;
}

/**
 * ✅ Trigger que se ejecuta al enviar el formulario
 * Opcional: Guarda el enlace directo en una columna separada
 */
function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Buscar la columna "Imagen Del Campeon"
    let imagenColIndex = headers.indexOf("Imagen Del Campeon");
    if (imagenColIndex === -1) {
      Logger.log("No se encontró la columna 'Imagen Del Campeon'");
      return;
    }

    // Buscar o crear la columna "Enlace directo Google"
    let directLinkColIndex = headers.indexOf("Enlace directo Google");
    if (directLinkColIndex === -1) {
      // Crear la columna después de "Imagen Del Campeon"
      directLinkColIndex = imagenColIndex + 1;
      sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo Google");
    }

    // Obtener la URL de la imagen
    const imagenUrl = sheet.getRange(lastRow, imagenColIndex + 1).getValue();

    if (imagenUrl) {
      // Convertir a enlace directo
      const directLink = convertirImagen(imagenUrl);

      if (directLink) {
        // Guardar en la columna "Enlace directo Google"
        sheet.getRange(lastRow, directLinkColIndex + 1).setValue(directLink);
        Logger.log("Enlace directo Google creado: " + directLink);

        // Cambiar permisos del archivo (opcional pero recomendado)
        try {
          const fileId = extractDriveFileId(imagenUrl);
          if (fileId) {
            const file = DriveApp.getFileById(fileId);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            Logger.log("Permisos actualizados para el archivo: " + fileId);
          }
        } catch (error) {
          Logger.log("No se pudieron cambiar los permisos: " + error);
        }
      }
    }
  } catch (error) {
    Logger.log("Error en onFormSubmit: " + error);
  }
}

/**
 * Extrae el ID de archivo de una URL de Google Drive
 */
function extractDriveFileId(url) {
  if (!url) return null;
  url = String(url);

  let match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return null;
}

/**
 * ✅ FUNCIÓN MANUAL: Ejecuta esto para procesar todas las filas existentes
 * Crea enlaces directos para todas las imágenes que ya están en el sheet
 */
function procesarFilasExistentes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Respuestas de formulario 1");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let imagenColIndex = headers.indexOf("Imagen Del Campeon");
  let directLinkColIndex = headers.indexOf("Enlace directo Google");

  if (directLinkColIndex === -1) {
    directLinkColIndex = imagenColIndex + 1;
    sheet.getRange(1, directLinkColIndex + 1).setValue("Enlace directo Google");
  }

  const lastRow = sheet.getLastRow();
  let procesados = 0;
  let errores = 0;

  for (let i = 2; i <= lastRow; i++) {
    const imagenUrl = sheet.getRange(i, imagenColIndex + 1).getValue();

    if (imagenUrl) {
      const directLink = convertirImagen(imagenUrl);

      if (directLink) {
        sheet.getRange(i, directLinkColIndex + 1).setValue(directLink);
        procesados++;
        Logger.log(`Fila ${i}: ${directLink}`);

        // Intentar cambiar permisos
        try {
          const fileId = extractDriveFileId(imagenUrl);
          if (fileId) {
            const file = DriveApp.getFileById(fileId);
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          }
        } catch (error) {
          Logger.log(`Fila ${i}: No se pudieron cambiar permisos - ${error}`);
        }
      } else {
        errores++;
        Logger.log(`Fila ${i}: No se pudo convertir la URL`);
      }
    }
  }

  Logger.log(`Proceso completado: ${procesados} enlaces creados, ${errores} errores`);
}

