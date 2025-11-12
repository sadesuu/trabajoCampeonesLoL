# Guía Rápida: Cómo Probar el Script de Apps Script

## ⚠️ ERROR SOLUCIONADO

El error que viste:
```
ERROR en doGet: Cannot read properties of undefined (reading 'parameter')
```

**Causa**: Ejecutaste la función manualmente desde Apps Script sin parámetros.

**Solución**: ✅ Ya corregido en el script actualizado.

---

## ✅ Cómo Probar Correctamente el Script

### Opción 1: Usar la Función testConfig() (RECOMENDADO)

Esta es la forma correcta de probar el script desde Apps Script:

1. Abre Apps Script
2. En el menú desplegable de funciones (arriba), selecciona: **`testConfig`**
3. Click en **▶️ Ejecutar**
4. Autoriza permisos si te los pide
5. Click en **Ejecución** (menú lateral) para ver los logs

**Resultado esperado**:
```
✅ Conexión exitosa al Sheet
📊 Nombre de la hoja: Respuestas de formulario 1
📝 Total de filas: X
📋 Encabezados encontrados:
   Columna 1: "Marca temporal"
   Columna 2: "Nombre"
   Columna 3: "Tipo"
   Columna 4: "Rol"
   Columna 5: "Imagen Del Campeon"
   Columna 6: "Enlace directo"
📄 Campeones encontrados:
   1. Ahri
   2. Yasuo
   ...
✅ Configuración correcta
```

### Opción 2: Probar desde la App Android

Esta es la forma REAL de probar:

1. **Actualiza el script** en Apps Script (copia el nuevo código)
2. **Guarda** (Ctrl+S)
3. **Implementa nueva versión** (Implementar → Administrar implementaciones → Editar → Nueva versión)
4. **Ejecuta la app** en Android
5. Prueba las operaciones desde la app

---

## 🔄 Pasos para Actualizar el Script (IMPORTANTE)

Ya que viste ese error, significa que todavía tienes el script anterior. Aquí está cómo actualizarlo:

### Paso 1: Abrir Apps Script
1. Ve a tu [Google Sheet](https://docs.google.com/spreadsheets/d/1TbqK6owWvwXrLZxeCYPwXJME-o5apXQLSdMCtFV5sTc/edit)
2. **Extensiones** → **Apps Script**

### Paso 2: Reemplazar el Código
1. **Selecciona TODO** el código (Ctrl+A)
2. **Borra** (Delete)
3. Abre el archivo: `google-apps-script-CORREGIDO-DELETE-PUT.gs` (ya tiene las correcciones del error)
4. **Copia TODO** el contenido
5. **Pega** en Apps Script
6. **Guarda** (Ctrl+S o icono de disco)

### Paso 3: Implementar Nueva Versión
1. Click en **Implementar** (botón azul arriba a la derecha)
2. **Administrar implementaciones**
3. Click en el icono de **✏️ editar** (lápiz)
4. En "Versión": selecciona **Nueva versión**
5. En "Descripción": escribe "Corrección de manejo de parámetros"
6. Click **Implementar**
7. Click **Listo**

### Paso 4: Verificar
1. Selecciona la función **`testConfig`** en el menú desplegable
2. Click **▶️ Ejecutar**
3. Revisa los logs en **Ejecución**

---

## ❌ NO Hagas Esto

### ❌ NO ejecutes `doGet()` manualmente
Esto causará el error porque no tiene parámetros.

### ❌ NO ejecutes `doPost()` manualmente
Esto también causará error porque no tiene datos POST.

### ❌ NO ejecutes `doDelete()` manualmente
Necesita parámetros que solo vienen de peticiones HTTP.

### ❌ NO ejecutes `doPut()` manualmente
Necesita datos que solo vienen de peticiones HTTP.

---

## ✅ Funciones que SÍ Puedes Ejecutar Manualmente

### ✅ testConfig()
Verifica la configuración del sheet y muestra información útil.

### ✅ onFormSubmit()
Simula el trigger cuando se envía el formulario (pero necesita datos reales del formulario).

---

## 🧪 Probar las Operaciones CRUD Correctamente

### GET (Listar Campeones)
**Desde Android**: Abre la app → Lista se carga automáticamente
**Desde navegador**: Visita tu URL de la API directamente

### POST (Crear Campeón)
**Solo desde Android**: Botón "+" → Llenar formulario → Guardar

### PUT (Editar Campeón)
**Solo desde Android**: Ver detalles → Editar → Modificar → Guardar

### DELETE (Eliminar Campeón)
**Solo desde Android**: Ver detalles → Eliminar → Confirmar

---

## 📊 Verificar que el Script se Actualizó Correctamente

Después de actualizar el script:

1. Ejecuta `testConfig()`
2. Abre **Ejecución** (menú lateral)
3. Deberías ver logs detallados sin errores
4. Si ves el error de nuevo, significa que NO actualizaste el script correctamente

---

## 🆘 Si Aún Ves el Error

1. **Verifica** que copiaste TODO el código del archivo `google-apps-script-CORREGIDO-DELETE-PUT.gs`
2. **Verifica** que guardaste (Ctrl+S)
3. **Verifica** que implementaste una nueva versión
4. **Cierra y vuelve a abrir** Apps Script
5. **Intenta de nuevo** ejecutar `testConfig()`

---

## 📝 Resumen

| Acción | Método | Cómo Probar |
|--------|--------|-------------|
| Verificar configuración | `testConfig()` | ✅ Ejecutar manualmente en Apps Script |
| Listar campeones | `doGet()` | ⚠️ Solo desde la app o navegador |
| Crear campeón | `doPost()` | ⚠️ Solo desde la app |
| Editar campeón | `doPut()` | ⚠️ Solo desde la app |
| Eliminar campeón | `doDelete()` | ⚠️ Solo desde la app |

**Conclusión**: Para probar desde Apps Script usa `testConfig()`. Para probar las operaciones CRUD usa la app Android.

