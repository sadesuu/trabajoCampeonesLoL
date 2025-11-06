# 🚀 SOLUCIÓN CON GOOGLEUSERCONTENT - INSTRUCCIONES

## ✅ Este script usa URLs de `googleusercontent.com` que son más confiables

### 🔑 Diferencia Principal:

**Script anterior:**
```
https://drive.google.com/uc?export=view&id=FILE_ID
```

**Script nuevo (googleusercontent):**
```
https://lh3.googleusercontent.com/d/FILE_ID=s800
```

---

## 📋 PASOS PARA CONFIGURAR

### **PASO 1: Copiar el Script**

1. Abre el archivo `google-apps-script-GOOGLEUSERCONTENT.gs`
2. **Selecciona TODO el código** (Ctrl+A)
3. **Copia** (Ctrl+C)

### **PASO 2: Pegar en Google Apps Script**

1. Ve a tu Google Sheet
2. **Extensiones** → **Apps Script**
3. **Borra todo** el código actual
4. **Pega** el código copiado (Ctrl+V)
5. **Guardar** (Ctrl+S o el ícono del disquete)

### **PASO 3: Configurar el Trigger (Disparador)**

1. En el editor de Apps Script, haz clic en el **⏰ icono del reloj** (Activadores/Triggers)
2. Haz clic en **+ Agregar activador** (esquina inferior derecha)
3. Configura:
   - **Función a ejecutar**: `onFormSubmit`
   - **Origen del evento**: `Desde la hoja de cálculo`
   - **Tipo de evento**: `Al enviar el formulario`
4. Haz clic en **Guardar**
5. Si pide autorización, haz clic en **Revisar permisos** y acepta

### **PASO 4: Procesar Filas Existentes**

Para las imágenes que ya existen en tu Google Sheet:

1. En el editor de Apps Script
2. En el menú desplegable de funciones (arriba), selecciona `procesarFilasExistentes`
3. Haz clic en **▶️ Ejecutar**
4. Espera a que termine (puede tardar unos segundos dependiendo de cuántas filas tengas)
5. Ve a **Ver** → **Registros de ejecución** para ver el resultado

### **PASO 5: Verificar en el Google Sheet**

1. Abre tu Google Sheet
2. Deberías ver una nueva columna llamada **"Enlace directo Google"** después de "Imagen Del Campeon"
3. Los enlaces deben verse así: `https://lh3.googleusercontent.com/d/FILE_ID=s800`

### **PASO 6: Probar un Enlace**

1. Copia uno de los enlaces de "Enlace directo Google"
2. Pégalo en una nueva pestaña del navegador
3. **Debe mostrar la imagen directamente** ✅

Si la imagen no se muestra, puede ser que:
- El archivo no tiene permisos públicos (ejecuta `procesarFilasExistentes` de nuevo)
- El ID del archivo es incorrecto

### **PASO 7: Implementar la API (Nueva versión)**

1. En el editor de Apps Script, haz clic en **Implementar** → **Administrar implementaciones**
2. Haz clic en el **✏️ icono de editar** en la implementación existente
3. Cambia la **Versión** a "Nueva versión"
4. Haz clic en **Implementar**
5. **COPIA LA URL** (será la misma que antes, pero ahora con el nuevo script)

O si prefieres crear una nueva implementación:
1. **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Descripción: "API Campeones LoL - GoogleUserContent"
4. **Ejecutar como**: Yo
5. **Quién tiene acceso**: Cualquier persona
6. **Implementar**
7. **Copia la nueva URL**

### **PASO 8: Probar la API en el Navegador**

1. Abre la URL de tu API en un navegador
2. Deberías ver un JSON como este:

```json
[
  {
    "Marca temporal": "30/10/2025 11:44:25",
    "Nombre": "Aatrox",
    "Tipo": "Luchador",
    "Rol": "Top",
    "Imagen Del Campeon": "https://drive.google.com/open?id=1abc123...",
    "Enlace directo": "https://lh3.googleusercontent.com/d/1abc123...=s800"
  }
]
```

3. **Verifica que exista el campo "Enlace directo"** con la URL de `googleusercontent.com`
4. **Copia** uno de esos enlaces y ábrelo en el navegador → Debe mostrar la imagen

### **PASO 9: Actualizar URL en la App (si cambió)**

Si creaste una nueva implementación con una URL diferente:

1. Abre `CharacterRepository.kt`
2. Actualiza la URL:
```kotlin
private val apiUrl = "TU_NUEVA_URL_AQUI"
```

### **PASO 10: Limpiar y Reconstruir**

En Android Studio:
1. **Build** → **Clean Project**
2. Espera a que termine
3. **Build** → **Rebuild Project**
4. Espera a que termine

### **PASO 11: Ejecutar la App**

1. Ejecuta la app en tu dispositivo/emulador
2. **Las imágenes deberían cargarse correctamente** ✨

---

## 🔍 Cómo Funciona el Script

### `doGet(e)` - API que devuelve los datos
```javascript
{
  "Marca temporal": "06/11/2025 15:30:45",
  "Nombre": "Ahri",
  "Tipo": "Mago",
  "Rol": "Mid",
  "Imagen Del Campeon": "https://drive.google.com/open?id=1jOo4mzw...",
  "Enlace directo": "https://lh3.googleusercontent.com/d/1jOo4mzw...=s800"
}
```

### `convertirImagen(url)` - Convierte URLs de Drive
Toma cualquier URL de Google Drive y la convierte a formato `googleusercontent`:

**ENTRADA:**
- `https://drive.google.com/open?id=1abc123`
- `https://drive.google.com/file/d/1abc123/view`

**SALIDA:**
- `https://lh3.googleusercontent.com/d/1abc123=s800`

El parámetro `=s800` define el tamaño máximo de la imagen (800px). Puedes cambiarlo:
- `=s400` → 400px
- `=s1000` → 1000px
- `=s0` → Tamaño original

### `onFormSubmit(e)` - Trigger automático
Se ejecuta cuando envías un nuevo campeón desde el formulario:
1. Extrae la URL de "Imagen Del Campeon"
2. La convierte usando `convertirImagen()`
3. La guarda en "Enlace directo"
4. Intenta cambiar los permisos del archivo a público

### `procesarFilasExistentes()` - Función manual
Procesa todas las filas que ya existen en tu sheet:
1. Itera por cada fila
2. Convierte cada imagen
3. Guarda los enlaces directos
4. Cambia permisos a público

---

## 📊 Comparación de URLs

### ❌ URL Original de Drive (NO funciona en Glide)
```
https://drive.google.com/open?id=1jOo4mzw11XTDEXH-N87xhsqB8gj-j43K
```

### ⚠️ URL con `uc?export=view` (A veces funciona)
```
https://drive.google.com/uc?export=view&id=1jOo4mzw11XTDEXH-N87xhsqB8gj-j43K
```

### ✅ URL con `googleusercontent` (SIEMPRE funciona)
```
https://lh3.googleusercontent.com/d/1jOo4mzw11XTDEXH-N87xhsqB8gj-j43K=s800
```

---

## 🐛 Solución de Problemas

### ❌ Error: "La imagen no se muestra en el navegador"

**Causa:** El archivo no tiene permisos públicos.

**Solución:**
1. Ve a Google Drive
2. Busca el archivo de la imagen
3. Clic derecho → **Compartir**
4. Cambia a "Cualquier persona con el enlace"
5. Permisos: "Lector"
6. **Listo**

O ejecuta de nuevo `procesarFilasExistentes` en Apps Script.

### ❌ Error: "No aparece la columna 'Enlace directo Google'"

**Solución:** Ejecuta manualmente la función `procesarFilasExistentes`

### ❌ Las imágenes nuevas no generan enlace directo

**Causa:** El trigger no está configurado.

**Solución:** Ve al PASO 3 y configura el trigger `onFormSubmit`

### ❌ Error en el JSON: "Enlace directo" está vacío

**Causa:** No se pudo extraer el ID del archivo.

**Solución:** 
1. Verifica que la URL en "Imagen Del Campeon" sea una URL válida de Drive
2. No debe ser solo un nombre de archivo como "aatrox.jpg"
3. Debe ser algo como `https://drive.google.com/open?id=...`

---

## ✅ Ventajas de `googleusercontent.com`

1. **Más rápido**: Servidores optimizados para servir imágenes
2. **Más confiable**: Menos problemas de caché
3. **Compatible con Glide**: Funciona perfectamente con la librería Glide
4. **Control de tamaño**: Puedes especificar el tamaño con `=s800`
5. **Menos redirecciones**: Carga directa de la imagen

---

## 📝 Ejemplo de Respuesta JSON Completa

```json
[
  {
    "Marca temporal": "30/10/2025 11:44:25",
    "Nombre": "Aatrox",
    "Tipo": "Luchador",
    "Rol": "Top",
    "Imagen Del Campeon": "aatrox - Sadesuu.jpg",
    "Enlace directo": ""
  },
  {
    "Marca temporal": "30/10/2025 15:37:38",
    "Nombre": "Ahri",
    "Tipo": "Mago",
    "Rol": "Mid",
    "Imagen Del Campeon": "https://drive.google.com/open?id=1jOo4mzw11XTDEXH-N87xhsqB8gj-j43K",
    "Enlace directo": "https://lh3.googleusercontent.com/d/1jOo4mzw11XTDEXH-N87xhsqB8gj-j43K=s800"
  },
  {
    "Marca temporal": "05/11/2025 12:06:52",
    "Nombre": "Akali",
    "Tipo": "Asesino",
    "Rol": "Mid",
    "Imagen Del Campeon": "https://drive.google.com/open?id=1RXEZqAXxjcYLNb4AGPrcomImViYW6P_Q",
    "Enlace directo": "https://lh3.googleusercontent.com/d/1RXEZqAXxjcYLNb4AGPrcomImViYW6P_Q=s800"
  }
]
```

**Nota:** La primera fila (Aatrox) tiene solo el nombre del archivo, no una URL de Drive, por eso el "Enlace directo" está vacío.

---

## ✅ Checklist Final

- [ ] Script copiado y pegado en Google Apps Script
- [ ] Script guardado (Ctrl+S)
- [ ] Trigger `onFormSubmit` configurado
- [ ] Función `procesarFilasExistentes` ejecutada
- [ ] Columna "Enlace directo" visible en el Sheet
- [ ] Enlaces con `googleusercontent.com` creados
- [ ] Enlaces probados en navegador (se ven las imágenes)
- [ ] API probada en navegador (JSON correcto)
- [ ] URL de API actualizada en `CharacterRepository.kt` (si cambió)
- [ ] Clean Project ejecutado
- [ ] Rebuild Project ejecutado
- [ ] App ejecutada y las imágenes se ven ✨

---

## 🎉 Resultado Final

Cuando agregues un nuevo campeón:
1. El formulario sube la imagen a Drive
2. El trigger `onFormSubmit` se ejecuta automáticamente
3. Extrae el ID y crea el enlace de `googleusercontent.com`
4. Lo guarda en "Enlace directo"
5. La app carga la imagen usando ese enlace
6. **Todo funciona automáticamente** ✨

---

**¡Este método es más confiable que el anterior!** 🚀

