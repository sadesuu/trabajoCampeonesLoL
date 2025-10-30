# Proyecto de Gestión de Campeones - Android

Este proyecto consume una API de Google Sheets para gestionar campeones de un juego.

## Características Implementadas

✅ RecyclerView con Adapter personalizado
✅ Data class para el modelo de datos
✅ Fragments para diferentes pantallas
✅ Consumo de API REST con Retrofit
✅ Carga de imágenes con Glide
✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
✅ ViewModel y LiveData para gestión de estado
✅ Material Design Components

## Estructura del Proyecto

### Paquetes:
- **model**: Contiene la data class `Campeon`
- **api**: Configuración de Retrofit y endpoints
- **repository**: Capa de repositorio para operaciones de red
- **viewmodel**: ViewModel para gestión de estado
- **adapter**: Adapter para RecyclerView
- **fragments**: Todos los fragments de la aplicación

### Fragments:
1. **ListaCampeonesFragment**: Muestra la lista de campeones en un RecyclerView
2. **DetalleCampeonFragment**: Muestra los detalles de un campeón seleccionado
3. **AgregarCampeonFragment**: Formulario para agregar un nuevo campeón
4. **EditarCampeonFragment**: Formulario para editar un campeón existente

## Configuración de Google Apps Script

### Paso 1: Crear una Hoja de Cálculo en Google Sheets

1. Crea una nueva hoja de cálculo en Google Sheets
2. En la primera fila, agrega estos encabezados:
   - `ID` (columna A)
   - `Nombre` (columna B)
   - `Tipo` (columna C)
   - `Rol` (columna D)
   - `Imagen` (columna E)

### Paso 2: Configurar Google Apps Script

1. En tu hoja de cálculo, ve a **Extensiones > Apps Script**
2. Borra el código existente y pega el siguiente código:

```javascript
// URL de tu hoja de cálculo
const SPREADSHEET_ID = 'TU_ID_DE_HOJA_DE_CALCULO_AQUI';
const SHEET_NAME = 'Hoja 1'; // Cambia esto si tu hoja tiene otro nombre

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Saltar la primera fila (encabezados)
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      return {
        id: row[0].toString(),
        nombre: row[1],
        tipo: row[2],
        rol: row[3],
        imagen: row[4]
      };
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    if (data.id && data.nombre && data.tipo && data.rol) {
      // Actualizar registro existente
      const allData = sheet.getDataRange().getValues();
      for (let i = 1; i < allData.length; i++) {
        if (allData[i][0].toString() === data.id) {
          sheet.getRange(i + 1, 2, 1, 4).setValues([[
            data.nombre,
            data.tipo,
            data.rol,
            data.imagen
          ]]);
          
          return ContentService
            .createTextOutput(JSON.stringify({
              success: true,
              message: 'Registro actualizado'
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    } else if (data.id) {
      // Eliminar registro
      const allData = sheet.getDataRange().getValues();
      for (let i = 1; i < allData.length; i++) {
        if (allData[i][0].toString() === data.id) {
          sheet.deleteRow(i + 1);
          
          return ContentService
            .createTextOutput(JSON.stringify({
              success: true,
              message: 'Registro eliminado'
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    } else if (data.nombre && data.tipo && data.rol) {
      // Crear nuevo registro
      const newId = new Date().getTime().toString();
      sheet.appendRow([newId, data.nombre, data.tipo, data.rol, data.imagen]);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Registro creado',
          id: newId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error('Datos inválidos');
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Paso 3: Implementar el Script

1. Haz clic en **Implementar > Nueva implementación**
2. Selecciona **Aplicación web**
3. Configuración:
   - Descripción: "API de Campeones"
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
4. Haz clic en **Implementar**
5. Copia la **URL de la aplicación web** que se genera

### Paso 4: Configurar la URL en Android

1. Abre el archivo `ApiService.kt`
2. Reemplaza `TU_SCRIPT_ID_AQUI` con la URL completa que copiaste
3. La URL debe verse así: `https://script.google.com/macros/s/XXXXX/exec`

## Ejemplo de Datos

Puedes agregar datos de prueba en tu hoja de cálculo:

| ID | Nombre | Tipo | Rol | Imagen |
|----|--------|------|-----|--------|
| 1 | Ahri | Mago | Mid | https://example.com/ahri.jpg |
| 2 | Garen | Guerrero | Top | https://example.com/garen.jpg |
| 3 | Jinx | Tirador | ADC | https://example.com/jinx.jpg |

## URLs de Imágenes de Ejemplo

Puedes usar estas URLs de ejemplo para probar:
- https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg
- https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg
- https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg

O usar el servicio de placeholder:
- https://via.placeholder.com/300?text=Campeon1
- https://via.placeholder.com/300?text=Campeon2

## Dependencias Utilizadas

- Retrofit 2.9.0 (para consumo de API)
- Glide 4.16.0 (para carga de imágenes)
- Kotlin Coroutines (para operaciones asíncronas)
- AndroidX Fragment KTX (para fragments)
- Material Components (para UI)
- ViewModel y LiveData (para arquitectura MVVM)

## Funcionalidades

1. **Listar Campeones**: La pantalla principal muestra todos los campeones en un RecyclerView
2. **Ver Detalles**: Al hacer clic en un campeón, se abre un fragment con sus detalles
3. **Agregar Campeón**: Botón para agregar nuevos campeones mediante un formulario
4. **Editar Campeón**: Desde los detalles, se puede editar la información del campeón
5. **Eliminar Campeón**: Desde los detalles, se puede eliminar el campeón (con confirmación)

## Notas Importantes

- Asegúrate de tener conexión a Internet para que la app funcione
- La primera vez que implementes el script, Google te pedirá permisos
- Si modificas el script, debes crear una **nueva implementación** (no actualizar la existente)
- Las URLs de las imágenes deben ser públicas y accesibles

## Arquitectura

El proyecto sigue el patrón **MVVM (Model-View-ViewModel)**:
- **Model**: Data classes y Repository
- **View**: Fragments y Adapters
- **ViewModel**: CampeonViewModel para gestión de estado

## Troubleshooting

### La app no carga datos
- Verifica que la URL del script sea correcta
- Comprueba que el script esté implementado como "Cualquier persona"
- Revisa que los permisos de Internet estén en el Manifest

### Las imágenes no se muestran
- Verifica que las URLs sean públicas
- Asegúrate de que sean URLs directas a imágenes
- Comprueba la conexión a Internet

### Error al agregar/editar/eliminar
- Verifica que el ID de la hoja de cálculo sea correcto
- Revisa que el nombre de la hoja coincida
- Comprueba los permisos del script

