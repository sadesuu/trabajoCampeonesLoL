# 🔧 Guía de Configuración Rápida

## Pasos para Poner en Marcha la Aplicación

### 1. Sincronizar el Proyecto

Los errores actuales en el IDE son normales y se resolverán después de sincronizar el proyecto con Gradle:

1. Abre el proyecto en Android Studio
2. Espera a que Android Studio termine de indexar
3. Click en **File** → **Sync Project with Gradle Files**
4. O click en el ícono de "Sync" en la barra de herramientas (🔄)

Esto generará:
- Archivos de ViewBinding
- Referencias a las extensiones de Kotlin
- Dependencias de Gradle

### 2. Configurar la API Backend

**Opción A: Usar Google Apps Script (Recomendado para empezar)**

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja de cálculo
2. Copia el ID de la hoja (está en la URL después de `/d/`):
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

3. Ve a [Google Apps Script](https://script.google.com)
4. Crea un nuevo proyecto
5. Copia el contenido del archivo `google-apps-script-backend.gs` 
6. Reemplaza `TU_SHEET_ID` con el ID de tu hoja de cálculo
7. Ejecuta la función `initializeWithSampleData()` para crear datos de prueba:
   - Selecciona la función en el menú desplegable
   - Click en ▶️ Ejecutar
   - Autoriza los permisos cuando te lo pida

8. Despliega como aplicación web:
   - Click en **Deploy** → **New deployment**
   - Tipo: **Web app**
   - Ejecutar como: **Me**
   - Quien tiene acceso: **Anyone** (Cualquiera)
   - Click en **Deploy**
   - **Copia la URL del despliegue**

9. Actualiza `CharacterRepository.kt`:
   ```kotlin
   // Línea 13 en CharacterRepository.kt
   private val apiUrl = "TU_URL_COPIADA_AQUI"
   ```

**Opción B: Usar tu propio Backend**

Si tienes tu propio servidor REST API:

1. Asegúrate de que tu API soporte estos endpoints:
   - `GET /api/characters` - Listar personajes
   - `POST /api/characters` - Crear personaje
   - `PUT /api/characters` - Actualizar personaje
   - `DELETE /api/characters?id={id}` - Eliminar personaje

2. Actualiza la URL en `CharacterRepository.kt` (línea 13)

### 3. Verificar Permisos

Los permisos de Internet ya están configurados en `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### 4. Compilar y Ejecutar

1. Conecta un dispositivo Android o inicia un emulador
2. Click en el botón **Run** (▶️) en Android Studio
3. Selecciona tu dispositivo
4. ¡La aplicación debería iniciarse!

## Estructura de la Hoja de Cálculo

Si usas Google Apps Script, la hoja debe tener estos encabezados en la primera fila:

| id | name | imageUrl | race | role | type | faction | level | attack | defense | speed | magic | biography |
|----|------|----------|------|------|------|---------|-------|--------|---------|-------|-------|-----------|

## Ejemplo de Personaje

```json
{
  "id": "uuid-123",
  "name": "Aragorn",
  "imageUrl": "https://example.com/aragorn.jpg",
  "race": "Human",
  "role": "DPS",
  "type": "Ranger",
  "faction": "Dunedain",
  "level": 87,
  "attack": 1350,
  "defense": 950,
  "speed": 180,
  "magic": 200,
  "biography": "El heredero de Isildur..."
}
```

## URLs de Imágenes Recomendadas

Para las imágenes, puedes usar:
- **Imgur**: Sube imágenes y usa el enlace directo
- **Google Drive**: Convierte el enlace de compartir en enlace directo
- **GitHub**: Sube imágenes a un repositorio y usa la URL raw
- **Cualquier URL directa de imagen**

Formato de enlace directo de Google Drive:
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

## Solución de Problemas Comunes

### ❌ Error: "Unresolved reference"
**Solución**: Sincroniza Gradle (File → Sync Project with Gradle Files)

### ❌ La app se cierra inmediatamente
**Solución**: 
1. Verifica que la URL de la API esté configurada
2. Revisa los logs en Logcat
3. Asegúrate de tener permisos de Internet

### ❌ Las imágenes no se cargan
**Solución**:
1. Verifica que las URLs de las imágenes sean directas
2. Usa HTTPS en lugar de HTTP
3. Verifica que las imágenes sean accesibles públicamente

### ❌ Error de CORS en la API
**Solución**: 
- En Google Apps Script, el CORS ya está manejado
- En tu propio backend, añade los headers CORS apropiados

## Testing de la API

Puedes probar tu API con:

**GET - Obtener personajes:**
```bash
curl https://TU_URL_API
```

**POST - Crear personaje:**
```bash
curl -X POST https://TU_URL_API \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","name":"Test Character","imageUrl":"","race":"Human","role":"DPS","type":"Warrior","faction":"Test","level":1,"attack":100,"defense":100,"speed":100,"magic":100,"biography":"Test character"}'
```

## Próximos Pasos

1. ✅ Sincronizar Gradle
2. ✅ Configurar la API
3. ✅ Ejecutar la app
4. 🎨 Personalizar colores y estilos
5. 📝 Añadir más personajes
6. 🚀 ¡Disfrutar!

## Recursos Útiles

- [Documentación de Android](https://developer.android.com)
- [Documentación de Google Apps Script](https://developers.google.com/apps-script)
- [Material Design](https://material.io)
- [Glide Documentation](https://bumptech.github.io/glide/)

## Soporte

Si encuentras problemas:
1. Revisa los logs en Logcat
2. Verifica la configuración de la API
3. Asegúrate de que Gradle esté sincronizado
4. Limpia y reconstruye el proyecto: **Build** → **Clean Project** → **Rebuild Project**

---

¡Buena suerte con tu proyecto! 🎉

