# 🔧 INSTRUCCIONES PARA CONFIGURAR Y SOLUCIONAR EL PROBLEMA

## ❌ Problema Detectado
Los datos no se muestran porque el Google Apps Script no está correctamente configurado con tu Google Sheet.

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Configurar Google Apps Script

1. **Abre tu Google Sheet:**
   - Ve a: https://docs.google.com/spreadsheets/d/1TbqK6owWvwXrLZxeCYPwXJME-o5apXQLSdMCtFV5sTc/edit

2. **Verifica el nombre de tu hoja:**
   - En la parte inferior de Google Sheets, mira cómo se llama la pestaña
   - ¿Se llama "Hoja 1" o tiene otro nombre?
   - **ANOTA ESTE NOMBRE** (lo necesitarás en el paso 5)

3. **Abre el Editor de Apps Script:**
   - En el menú superior, haz clic en: **Extensiones** → **Apps Script**
   - Se abrirá una nueva pestaña con el editor de código

4. **Borra el código existente:**
   - Selecciona TODO el código que aparezca en el editor
   - Elimínalo (Delete o Backspace)

5. **Copia el nuevo código:**
   - Abre el archivo: `google-apps-script-CONFIGURADO.gs` (lo acabo de crear en tu proyecto)
   - Copia TODO el contenido
   - Pégalo en el editor de Apps Script
   
6. **IMPORTANTE - Verifica el nombre de la hoja:**
   - En la línea 19 del código, verás:
   ```javascript
   const SHEET_NAME = 'Hoja 1'; // 🔧 Cambia esto si tu hoja tiene otro nombre
   ```
   - Si tu hoja tiene un nombre diferente (por ejemplo "Champions", "Campeones", etc.), cámbialo aquí

7. **Guarda el script:**
   - Haz clic en el icono del **disquete** 💾 o presiona `Ctrl+S`
   - Dale un nombre al proyecto (por ejemplo: "API Campeones LoL")

8. **Prueba la configuración (OPCIONAL pero recomendado):**
   - En el menú superior, selecciona la función: `testConfig`
   - Haz clic en el botón **Ejecutar** ▶️
   - La primera vez te pedirá permisos:
     - Haz clic en "Revisar permisos"
     - Selecciona tu cuenta de Google
     - Haz clic en "Avanzado"
     - Haz clic en "Ir a [nombre del proyecto] (no seguro)"
     - Haz clic en "Permitir"
   - Ve a **Visualización** → **Registros de ejecución** para ver si hay errores
   - Deberías ver mensajes como "✅ Conexión exitosa al Sheet"

9. **Implementa como aplicación web:**
   - Haz clic en el botón **Implementar** (arriba a la derecha)
   - Selecciona **Nueva implementación**
   - Haz clic en el icono del engranaje ⚙️ junto a "Seleccionar tipo"
   - Selecciona **Aplicación web**
   - Configura:
     - **Descripción:** "API REST Campeones LoL"
     - **Ejecutar como:** Tu cuenta (debe aparecer tu email)
     - **Quién tiene acceso:** **Cualquiera** ⚠️ MUY IMPORTANTE
   - Haz clic en **Implementar**
   - Te pedirá autorización nuevamente, acepta todos los permisos
   - **COPIA LA URL** que aparece (termina en `/exec`)
   - Ejemplo: `https://script.google.com/macros/s/ABC123.../exec`

### PASO 2: Actualizar la URL en tu app Android

10. **Abre el archivo CharacterRepository.kt:**
    - Ruta: `app/src/main/java/com/example/trabajofinal/data/repository/CharacterRepository.kt`

11. **Actualiza la URL del API:**
    - Busca la línea que dice:
    ```kotlin
    private val apiUrl = "https://script.google.com/macros/s/AKfycby8S4ntLE3Aa2ckd45rTS49QzLXtirdA5vdqDKx_7vKthIj11zbsvJGHysi8Z-hmhrQlw/exec"
    ```
    - Reemplázala con la URL que copiaste en el paso 9
    - **IMPORTANTE:** La URL debe terminar en `/exec`, NO en `/dev`

### PASO 3: Verificar los datos en Google Sheet

12. **Asegúrate de que tu Google Sheet tiene los encabezados correctos:**
    - Primera fila (fila 1) debe tener exactamente estos encabezados:
    ```
    id | name | imageUrl | type | role
    ```

13. **Verifica que tengas datos:**
    - Debe haber al menos una fila con datos (fila 2 en adelante)
    - Ejemplo:
    ```
    1 | Garen | https://... | Luchador | Top
    2 | Ahri | https://... | Mago | Mid
    ```

14. **URLs de imágenes de Google Drive:**
    - Si usas Google Drive para las imágenes, asegúrate de que sean públicas:
    - Click derecho en la imagen → Obtener enlace → Cambiar a "Cualquier persona con el enlace"
    - La URL debería ser algo como: `https://drive.google.com/file/d/ABC123.../view?usp=sharing`

### PASO 4: Hacer Gradle Sync y ejecutar la app

15. **Sincroniza el proyecto:**
    - En Android Studio: `File` → `Sync Project with Gradle Files`
    - Espera a que termine (puede tardar 1-2 minutos)

16. **Ejecuta la app:**
    - Conecta un dispositivo Android o inicia un emulador
    - Haz clic en el botón **Run** ▶️ (verde)

17. **Verifica los logs:**
    - Abre la ventana **Logcat** en Android Studio (abajo)
    - Filtra por: `CharacterRepository`
    - Deberías ver:
      ```
      D/CharacterRepository: Fetching characters from: https://...
      D/CharacterRepository: Response code: 200
      D/CharacterRepository: Response JSON: [{"id":"1","name":"Garen",...}]
      D/CharacterRepository: Parsed 3 characters
      ```

## 🔍 VERIFICAR QUE TODO FUNCIONA

### En Google Apps Script:
- La función `testConfig()` debería ejecutarse sin errores
- Los logs deberían mostrar: "✅ Conexión exitosa al Sheet"

### En tu app Android:
- Deberías ver las tarjetas de los campeones con:
  - ✅ Nombre visible (texto blanco sobre fondo oscuro)
  - ✅ Imagen del campeón
  - ✅ Tipo (Luchador, Mago, etc.)
  - ✅ Rol (Top, Mid, etc.)

## ❓ PROBLEMAS COMUNES

### Problema 1: "No se encontró la hoja"
**Solución:** El nombre en `SHEET_NAME` no coincide. Verifica el nombre exacto de tu pestaña en Google Sheets.

### Problema 2: "Response code: 302 o 403"
**Solución:** 
- La URL en CharacterRepository.kt debe terminar en `/exec`, no `/dev`
- En la implementación, "Quién tiene acceso" debe ser "Cualquiera"

### Problema 3: "Las imágenes no cargan"
**Solución:**
- Las imágenes de Google Drive deben ser públicas
- Usa el formato de URL completo: `https://drive.google.com/file/d/FILE_ID/view`

### Problema 4: "Received 0 characters" en los logs
**Solución:**
- Verifica que hay datos en Google Sheet (no solo encabezados)
- Ejecuta `testConfig()` en Apps Script para verificar

## 📝 CHECKLIST FINAL

Antes de ejecutar la app, verifica que:

- [ ] El código de Apps Script está actualizado con `google-apps-script-CONFIGURADO.gs`
- [ ] La línea `SHEET_NAME` tiene el nombre correcto de tu hoja
- [ ] Has ejecutado `testConfig()` y muestra éxito
- [ ] Has creado una Nueva implementación como Aplicación web
- [ ] "Quién tiene acceso" está configurado como "Cualquiera"
- [ ] Has copiado la URL que termina en `/exec`
- [ ] Has actualizado `CharacterRepository.kt` con la nueva URL
- [ ] Has hecho Gradle Sync
- [ ] Tu Google Sheet tiene los encabezados: id, name, imageUrl, type, role
- [ ] Hay al menos 1 fila de datos en el Sheet
- [ ] Las imágenes de Google Drive son públicas

## 🎯 RESULTADO ESPERADO

Después de seguir todos los pasos:
1. La app debería cargar sin errores
2. Deberías ver las tarjetas de los campeones
3. Cada tarjeta debería mostrar:
   - Imagen del campeón (arriba)
   - Nombre en blanco y negrita
   - Tipo y Rol en etiquetas de colores

¡Buena suerte! 🚀

