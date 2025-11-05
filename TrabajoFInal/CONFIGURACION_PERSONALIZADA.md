# ✅ CONFIGURACIÓN PARA TUS COLUMNAS ESPECÍFICAS

## 📋 TUS COLUMNAS EN GOOGLE SHEET

```
Columna A: Marca temporal
Columna B: Nombre           ← Nombre del campeón
Columna C: Tipo             ← Tipo (Luchador, Mago, etc.)
Columna D: Rol              ← Rol (Top, Mid, ADC, etc.)
Columna E: Imaguen Del Campeon ← URL de Drive
Columna F: Enlace directo   ← (Se creará automáticamente)
```

## ✅ CAMBIOS APLICADOS

### 1. Character.kt - ACTUALIZADO ✅
He ajustado los `@SerializedName` para que coincidan con tus columnas:

```kotlin
@SerializedName("Nombre")            // ← Coincide con tu columna
@SerializedName("Tipo")              // ← Coincide con tu columna
@SerializedName("Rol")               // ← Coincide con tu columna
@SerializedName("Imaguen Del Campeon") // ← Coincide con tu columna
```

### 2. Google Apps Script - ACTUALIZADO ✅
He actualizado el script para usar "Imaguen Del Campeon" en lugar de "fotografía".

## 🎯 PRÓXIMOS PASOS OBLIGATORIOS

### PASO 1: Actualizar el script en Google Apps Script

1. Abre tu Google Sheet
2. Ve a: **Extensiones → Apps Script**
3. **REEMPLAZA TODO EL CÓDIGO** con el archivo actualizado: `google-apps-script-COMENTADO.gs`
4. Guarda (Ctrl+S)

### PASO 2: Ejecutar la función de prueba

1. En el editor de Apps Script, selecciona la función: **`testHeaders`**
2. Haz clic en **▶ Ejecutar**
3. Autoriza los permisos si te los pide
4. Ve a **Ejecuciones** (icono de reloj) y verifica el log
5. Deberías ver:
   ```
   ✅ Marca temporal
   ✅ Nombre
   ✅ Imaguen Del Campeon
   ✅ Tipo
   ✅ Rol
   ⚠️ Enlace directo (se creará automáticamente)
   ```

### PASO 3: Procesar las filas existentes

Si ya tienes campeones en tu Google Sheet:

1. En Apps Script, selecciona: **`procesarTodasLasFilas`**
2. Haz clic en **▶ Ejecutar**
3. Esto creará la columna "Enlace directo" y procesará todas las imágenes
4. Verás logs como:
   ```
   ✅ Fila 2: https://drive.google.com/uc?export=view&id=ABC123
   ✅ Fila 3: https://drive.google.com/uc?export=view&id=DEF456
   ```

### PASO 4: Configurar el trigger automático

Para que las imágenes se procesen automáticamente en futuros envíos:

1. En Apps Script, ve a **Activadores** (icono de reloj en el menú izquierdo)
2. Haz clic en **+ Agregar activador**
3. Configura:
   - Función: `onFormSubmit`
   - Evento: "Al enviar el formulario"
   - Tipo de evento de implementación: "Desde hoja de cálculo"
   - Evento: "Al enviar el formulario"
4. Guarda

### PASO 5: Volver a desplegar la Web App (IMPORTANTE)

Después de cambiar el código, debes redesplegar:

1. En Apps Script, haz clic en **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquiera**
4. **Implementar**
5. **COPIA LA NUEVA URL** (termina en `/exec`)

### PASO 6: Actualizar la URL en CharacterRepository.kt (si cambió)

Si la URL cambió al redesplegar:

1. Abre: `app/src/main/java/.../CharacterRepository.kt`
2. Reemplaza la URL antigua con la nueva:
   ```kotlin
   private val apiUrl = "TU_NUEVA_URL_AQUI/exec"
   ```

## 🧪 PROBAR LA APP

1. **Compila y ejecuta la app**
2. **Verás un Toast**: "Personajes recibidos: X"
3. **Si dice 0**:
   - Verifica que la URL de la API en CharacterRepository.kt sea correcta
   - Abre la URL en el navegador y verifica el JSON
4. **Si dice un número > 0**: ¡Funciona! Deberías ver las cartas

## 📱 RESULTADO ESPERADO

Verás cartas con:
```
┌─────────────────────┐
│ [FOTO]              │
│                     │
│ Garen               │  ← Columna "Nombre"
│ [Luchador] [Top]    │  ← Columnas "Tipo" y "Rol"
└─────────────────────┘
```

## 🔍 VERIFICAR EL JSON DE LA API

Abre tu URL de la API en el navegador. Deberías ver:

```json
[
  {
    "Marca temporal": "05/11/2025 10:30:45",
    "Nombre": "Garen",
    "Tipo": "Luchador",
    "Rol": "Top",
    "Imaguen Del Campeon": "https://drive.google.com/open?id=...",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=..."
  }
]
```

**IMPORTANTE:** Los nombres de las claves del JSON deben ser **exactamente**:
- `"Nombre"` (con mayúscula)
- `"Tipo"` (con mayúscula)
- `"Rol"` (con mayúscula)
- `"Imaguen Del Campeon"` (exactamente así, con espacios)

## ❌ SI ALGO SALE MAL

### Problema: El Toast dice "0 personajes"

**Solución:**
1. Abre la URL de la API en el navegador
2. Si ves un error, ejecuta `testHeaders()` en Apps Script
3. Copia el log y los primeros 2 objetos del JSON aquí

### Problema: Las imágenes no cargan

**Solución:**
1. Verifica que la columna "Enlace directo" tenga URLs
2. Ejecuta `procesarTodasLasFilas()` en Apps Script
3. Verifica en Logcat: "Loading image from: https://drive.google.com/uc?..."

### Problema: Los nombres/tipos/roles aparecen vacíos

**Solución:**
1. Verifica en Logcat el log: "Binding character: ..."
2. Si aparecen vacíos, el JSON no tiene los nombres correctos
3. Ejecuta `testHeaders()` y verifica los nombres de columnas

## 📋 CHECKLIST FINAL

- [ ] He actualizado el script en Apps Script con `google-apps-script-COMENTADO.gs`
- [ ] He ejecutado `testHeaders()` y veo ✅ en todas las columnas
- [ ] He ejecutado `procesarTodasLasFilas()` (si tengo datos existentes)
- [ ] He configurado el trigger `onFormSubmit`
- [ ] He redesplegar la Web App
- [ ] He actualizado la URL en CharacterRepository.kt (si cambió)
- [ ] He compilado y ejecutado la app
- [ ] Veo el Toast con el número de personajes
- [ ] Las cartas muestran nombre, tipo, rol correctamente

Si todos los pasos están ✅, ¡tu app debería funcionar perfectamente!

## 🆘 NECESITAS AYUDA

Si después de seguir todos los pasos aún no funciona, copia y pega:

1. **El JSON** (primeros 2 objetos de la URL de la API)
2. **Los logs de Logcat** (filtrados por CharacterRepository, CharacterViewModel, CharacterViewHolder)
3. **El resultado de `testHeaders()`** en Apps Script

Con eso identificaré el problema exacto en segundos.

