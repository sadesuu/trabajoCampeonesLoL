# 🔧 SOLUCIÓN COMPLETA: Configuración de Imágenes de Google Drive

## ✅ Cambios Realizados

### 1. **Modelo Character.kt corregido**
- ✅ Cambiado `"Imaguen Del Campeon"` → `"Imagen Del Campeon"` (se corrigió el typo)
- ✅ Los nombres coinciden exactamente con las columnas del Google Sheet

### 2. **Script de Google Apps Script actualizado**
- ✅ Archivo creado: `google-apps-script-FINAL.gs`
- ✅ Busca la columna `"Imagen Del Campeon"` correctamente
- ✅ Crea enlaces directos en formato: `https://drive.google.com/uc?export=view&id=FILE_ID`
- ✅ Sin agregar extensión al final (ese era el error)

---

## 📋 PASOS PARA CONFIGURAR (Sigue en orden)

### **PASO 1: Actualizar el Script en Google Apps Script**

1. Ve a tu Google Sheet
2. Haz clic en **Extensiones** → **Apps Script**
3. **Borra todo el código actual**
4. **Copia y pega** el contenido del archivo `google-apps-script-FINAL.gs`
5. Haz clic en **💾 Guardar** (Ctrl+S)
6. Haz clic en **▶️ Ejecutar** para autorizar el script (si es necesario)

### **PASO 2: Configurar el Trigger (Disparador)**

Para que procese automáticamente las nuevas imágenes:

1. En el editor de Apps Script, haz clic en el **⏰ icono del reloj** (Activadores/Triggers)
2. Haz clic en **+ Agregar activador** (esquina inferior derecha)
3. Configura:
   - **Función**: `onFormSubmit`
   - **Origen del evento**: `Desde la hoja de cálculo`
   - **Tipo de evento**: `Al enviar el formulario`
4. Haz clic en **Guardar**

### **PASO 3: Procesar Imágenes Existentes**

Para las filas que ya existen en tu Sheet:

1. En el editor de Apps Script
2. Selecciona la función `procesarFilasExistentes` del menú desplegable
3. Haz clic en **▶️ Ejecutar**
4. Espera a que termine (puede tardar unos segundos)
5. Ve a **Ver** → **Registros** para ver el resultado

Esto creará los enlaces directos para TODAS las filas existentes.

### **PASO 4: Verificar los Enlaces Creados**

1. Abre tu Google Sheet
2. Verás una nueva columna **"Enlace directo"** después de "Imagen Del Campeon"
3. Los enlaces deben verse así: `https://drive.google.com/uc?export=view&id=1jOo4mzw11XTDEXH...`
4. **Prueba uno**: Copia un enlace y pégalo en tu navegador → Debe mostrar la imagen

### **PASO 5: Actualizar y Verificar la URL de la API**

1. En el editor de Apps Script, haz clic en **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Configura:
   - **Descripción**: "API Campeones LoL - v2"
   - **Ejecutar como**: Yo
   - **Quién tiene acceso**: Cualquier persona
4. Haz clic en **Implementar**
5. **COPIA LA URL** que te da (será algo como `https://script.google.com/macros/s/AKfycbz.../exec`)

### **PASO 6: Actualizar la URL en la App Android**

Ya está actualizada en `CharacterRepository.kt` pero verifica que sea la correcta:

```kotlin
private val apiUrl = "https://script.google.com/macros/s/TU_NUEVA_URL/exec"
```

### **PASO 7: Probar la API en el Navegador**

1. Abre la URL de tu API en un navegador
2. Deberías ver un JSON como este:

```json
[
  {
    "Marca temporal": "30/10/2025 11:44:25",
    "Nombre": "Aatrox",
    "Tipo": "Luchador",
    "Rol": "Top",
    "Imagen Del Campeon": "aatrox - Sadesuu.jpg",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=1abc123..."
  },
  {
    "Marca temporal": "30/10/2025 15:37:38",
    "Nombre": "Ahri",
    "Tipo": "Mago",
    "Rol": "Mid",
    "Imagen Del Campeon": "https://drive.google.com/open?id=1jOo4mzw11XTDEXH...",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=1jOo4mzw11XTDEXH..."
  }
]
```

3. **Verifica** que exista el campo `"Enlace directo"` en cada objeto
4. **Copia** uno de los enlaces "Enlace directo" y ábrelo en una pestaña nueva → Debe mostrar la imagen

### **PASO 8: Limpiar y Reconstruir la App**

En Android Studio:

1. **Build** → **Clean Project**
2. Espera a que termine
3. **Build** → **Rebuild Project**
4. Espera a que termine

### **PASO 9: Ejecutar la App**

1. Ejecuta la app en tu dispositivo/emulador
2. Las imágenes deberían cargar correctamente
3. Si no aparecen, ve al **Logcat** y busca:
   - `CharacterRepository`: Ver qué URL se está usando
   - `CharacterViewHolder`: Ver qué URL de imagen se está intentando cargar

---

## 🐛 Solución de Problemas

### ❌ Las imágenes no se ven

**Verifica en el Logcat:**
```
Loading image from: https://drive.google.com/uc?export=view&id=...
```

Si ves `imageUrl:` o `imagePublicUrl:` vacíos, el problema está en la API.

### ❌ No hay columna "Enlace directo" en el Sheet

1. Ejecuta manualmente `procesarFilasExistentes` en Apps Script
2. O envía un nuevo campeón desde el formulario para que el trigger lo cree

### ❌ Error: "No se pudo extraer el ID del archivo"

El formato de URL no es reconocido. Ejemplos válidos:
- ✅ `https://drive.google.com/open?id=1abc123...`
- ✅ `https://drive.google.com/file/d/1abc123.../view`
- ❌ `aatrox - Sadesuu.jpg` (esto es solo un nombre de archivo, no una URL)

### ❌ Las imágenes viejas no tienen "Enlace directo"

Es normal si fueron agregadas antes de configurar el script. Solución:
- Ejecuta la función `procesarFilasExistentes` en Apps Script

---

## 📊 Mapeo de Campos Final

| Google Sheet | Character.kt | Uso |
|-------------|--------------|-----|
| `Marca temporal` | `timestamp` | Fecha |
| `Nombre` | `name` | Nombre del campeón |
| `Tipo` | `type` | Tipo (Luchador, Mago, etc.) |
| `Rol` | `role` | Rol (Top, Mid, etc.) |
| `Imagen Del Campeon` | `imageUrl` | URL original de Drive |
| `Enlace directo` | `imagePublicUrl` | URL directa para mostrar ⭐ |

⭐ = Este es el campo que usa el adaptador para mostrar las imágenes

---

## ✅ Checklist Final

- [ ] Script actualizado en Google Apps Script
- [ ] Trigger `onFormSubmit` configurado
- [ ] Función `procesarFilasExistentes` ejecutada
- [ ] Columna "Enlace directo" visible en el Sheet
- [ ] Enlaces directos probados en navegador (se ven las imágenes)
- [ ] API probada en navegador (JSON con campo "Enlace directo")
- [ ] URL de API actualizada en `CharacterRepository.kt` (si cambió)
- [ ] App limpiada y reconstruida
- [ ] App ejecutada → Imágenes visibles ✨

---

## 🎯 ¿Por qué ahora funciona?

1. **Nombre de columna corregido**: `"Imagen Del Campeon"` (sin el typo)
2. **Script correcto**: Busca la columna correcta
3. **URL correcta**: `https://drive.google.com/uc?export=view&id=FILE_ID` (sin extensión)
4. **Permisos**: El script cambia los permisos a público automáticamente
5. **Adaptador inteligente**: Prioriza "Enlace directo" sobre "Imagen Del Campeon"

---

## 💡 Para Nuevos Campeones

Cuando agregues un nuevo campeón desde el formulario:

1. El trigger `onFormSubmit` se ejecutará automáticamente
2. Extraerá el ID de la URL de Drive
3. Cambiará los permisos a público
4. Creará el enlace directo
5. Lo guardará en la columna "Enlace directo"
6. La app lo cargará automáticamente ✨

**¡No necesitas hacer nada manual!** 🎉

