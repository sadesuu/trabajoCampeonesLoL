# Trabajo Final - Aplicación de Gestión de Personajes

Una aplicación Android para gestionar personajes de juegos/historias con funcionalidades CRUD completas.

## 📋 Características

- **Listar Personajes**: Visualiza todos los personajes en una cuadrícula con imágenes
- **Buscar**: Busca personajes por nombre en tiempo real
- **Filtrar**: Filtra personajes por rol (Tank, DPS, Support, Healer, Assassin)
- **Ordenar**: Ordena personajes alfabéticamente
- **Crear**: Añade nuevos personajes con todos sus atributos
- **Editar**: Modifica los datos de personajes existentes
- **Eliminar**: Borra personajes con confirmación
- **Detalles**: Visualiza información completa de cada personaje

## 🏗️ Arquitectura

La aplicación sigue el patrón MVVM (Model-View-ViewModel):

```
├── data/
│   ├── model/
│   │   └── Character.kt          # Modelo de datos
│   └── repository/
│       └── CharacterRepository.kt # Capa de datos con API REST
├── ui/
│   ├── adapter/
│   │   └── CharacterAdapter.kt   # Adaptador RecyclerView
│   ├── fragments/
│   │   ├── CharacterListFragment.kt    # Lista de personajes
│   │   ├── CharacterDetailFragment.kt  # Detalles del personaje
│   │   ├── AddCharacterFragment.kt     # Crear personaje
│   │   └── EditCharacterFragment.kt    # Editar personaje
│   └── viewmodel/
│       └── CharacterViewModel.kt # ViewModel con LiveData
└── MainActivity.kt
```

## 🚀 Configuración

### Prerrequisitos

- Android Studio Arctic Fox o superior
- Kotlin 2.0.21
- SDK mínimo: 24 (Android 7.0)
- SDK objetivo: 36

### Instalación

1. Clona el repositorio
2. Abre el proyecto en Android Studio
3. Sincroniza las dependencias de Gradle
4. Configura la URL de la API (ver siguiente sección)

### Configurar la API REST

La aplicación está configurada para conectarse a una API REST. Debes actualizar la URL en el archivo `CharacterRepository.kt`:

```kotlin
// Ubicación: app/src/main/java/com/example/trabajofinal/data/repository/CharacterRepository.kt
private val apiUrl = "TU_URL_DE_APPS_SCRIPT_AQUI"
```

#### Opción 1: Google Apps Script (Recomendado para pruebas)

1. Crea un nuevo proyecto en [Google Apps Script](https://script.google.com)
2. Crea una hoja de cálculo de Google Sheets para almacenar los personajes
3. Implementa los endpoints siguientes en Apps Script:
   - `GET` - Obtener todos los personajes
   - `POST` - Crear un nuevo personaje
   - `PUT` - Actualizar un personaje existente
   - `DELETE` - Eliminar un personaje por ID

4. Despliega como aplicación web y copia la URL

Ejemplo básico de código para Google Apps Script:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.openById('TU_SHEET_ID').getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var characters = [];
  
  // Convierte las filas en objetos JSON
  for (var i = 1; i < data.length; i++) {
    characters.push({
      id: data[i][0],
      name: data[i][1],
      imageUrl: data[i][2],
      race: data[i][3],
      role: data[i][4],
      type: data[i][5],
      faction: data[i][6],
      level: data[i][7],
      attack: data[i][8],
      defense: data[i][9],
      speed: data[i][10],
      magic: data[i][11],
      biography: data[i][12]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(characters))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Implementar lógica para crear personaje
}

function doPut(e) {
  // Implementar lógica para actualizar personaje
}

function doDelete(e) {
  // Implementar lógica para eliminar personaje
}
```

#### Opción 2: Servidor Backend propio

Si tienes un backend REST API, asegúrate de que soporte los siguientes endpoints:

- `GET /characters` - Lista todos los personajes
- `POST /characters` - Crea un nuevo personaje
- `PUT /characters` - Actualiza un personaje
- `DELETE /characters?id={id}` - Elimina un personaje

### Modelo de Datos JSON

```json
{
  "id": "uuid-string",
  "name": "Nombre del Personaje",
  "imageUrl": "https://ejemplo.com/imagen.jpg",
  "race": "Human|Orc|Elf|Machine|Dwarf|Demon",
  "role": "DPS|Tank|Support|Healer|Assassin",
  "type": "Knight|Warrior|Mage|Ranger|Rogue|Paladin",
  "faction": "Facción del personaje",
  "level": 50,
  "attack": 1200,
  "defense": 800,
  "speed": 150,
  "magic": 500,
  "biography": "Historia del personaje..."
}
```

## 📦 Dependencias Principales

```kotlin
// UI
implementation("androidx.fragment:fragment-ktx:1.8.5")
implementation("androidx.recyclerview:recyclerview:1.3.2")
implementation("com.google.android.material:material:1.13.0")

// Lifecycle & ViewModel
implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.8.7")

// Coroutines
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

// JSON
implementation("com.google.code.gson:gson:2.11.0")

// Imagen
implementation("com.github.bumptech.glide:glide:4.16.0")
```

## 🎨 Paleta de Colores

La aplicación usa un tema oscuro con los siguientes colores principales:

- **Fondo principal**: `#0D1821`
- **Fondo secundario**: `#1E2A3A`
- **Fondo de controles**: `#2A3A4A`
- **Acento primario**: `#4A90E2`
- **Acento peligro**: `#E24A4A`
- **Texto primario**: `#FFFFFF`
- **Texto secundario**: `#8899AA`

## 🔧 Funcionalidades Detalladas

### Lista de Personajes
- Cuadrícula de 2 columnas
- Imágenes cargadas con Glide
- Barra de búsqueda en tiempo real
- Botón de filtro con Bottom Sheet
- FAB para agregar nuevos personajes

### Detalles del Personaje
- Imagen destacada del personaje
- Información completa de atributos
- Estadísticas detalladas
- Biografía
- Botones para editar y eliminar

### Crear/Editar Personaje
- Formulario completo con validación
- Spinners para selección de categorías
- Campos numéricos para estadísticas
- Biografía con campo de texto multilínea

## 🐛 Solución de Problemas

### Error: Unresolved reference 'activityViewModels' o 'viewModelScope'

**Solución**: Sincroniza el proyecto con Gradle:
1. File → Sync Project with Gradle Files
2. O ejecuta: `./gradlew clean build`

### Error: Cannot resolve databinding

**Solución**: Asegúrate de que ViewBinding está habilitado en `app/build.gradle.kts`:
```kotlin
buildFeatures {
    viewBinding = true
}
```

### La aplicación se cierra al cargar datos

**Solución**: 
1. Verifica que la URL de la API esté correctamente configurada
2. Revisa los permisos de Internet en `AndroidManifest.xml`
3. Comprueba que la API devuelve JSON válido

## 📝 Próximas Mejoras

- [ ] Implementar persistencia local con Room
- [ ] Agregar modo offline con sincronización
- [ ] Implementar paginación para listas grandes
- [ ] Agregar animaciones de transición
- [ ] Implementar tema claro/oscuro
- [ ] Añadir soporte para múltiples idiomas
- [ ] Implementar autenticación de usuario
- [ ] Agregar compartir personajes

## 📄 Licencia

Este proyecto es un trabajo final educativo.

## 👤 Autor

Proyecto desarrollado como Trabajo Final

---

¿Necesitas ayuda? Revisa la documentación de Android o contacta al desarrollador.

