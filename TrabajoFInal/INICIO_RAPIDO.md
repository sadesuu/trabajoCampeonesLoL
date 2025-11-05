# 🚀 Inicio Rápido - 5 Pasos

## ✅ Checklist de Configuración

### Paso 1: Verifica tu Formulario de Google
- [ ] Tienes un formulario de Google Forms activo
- [ ] El formulario tiene los campos: nombre, fotografía, tipo, rol
- [ ] Las respuestas se guardan en "Respuestas de formulario 1"

### Paso 2: Configura el Apps Script
1. Abre la hoja de respuestas en Google Sheets
2. Ve a **Extensiones > Apps Script**
3. Copia y pega el contenido de `google-apps-script-CORRECTO.gs`
4. Guarda el proyecto (Ctrl+S)

### Paso 3: Configura el Trigger
1. En Apps Script, haz clic en el reloj ⏰ (Activadores)
2. Clic en **+ Agregar activador**
3. Configuración:
   - Función: `onFormSubmit`
   - Tipo de evento: **Del formulario**
   - Tipo de evento del formulario: **Al enviar formulario**
4. Guarda

### Paso 4: Despliega como Web App
1. En Apps Script, **Implementar > Nueva implementación**
2. Configuración:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Tu cuenta**
   - Quien tiene acceso: **Cualquiera**
3. **Implementar**
4. Copia la URL generada

### Paso 5: Verifica la URL en la App Android
La URL ya está configurada en el proyecto:
```
https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec
```

✅ Si tu URL es diferente, actualízala en:
`app/src/main/java/com/example/trabajofinal/data/repository/CharacterRepository.kt`

## 🧪 Prueba que Todo Funciona

### Prueba 1: API en el Navegador
Abre: `https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec`

✅ **Deberías ver:** Un JSON con tus datos
❌ **Si ves error:** Revisa que el script está desplegado correctamente

### Prueba 2: Columna "Enlace directo"
1. Abre tu hoja de Google Sheets
2. Busca la columna "Enlace directo"

✅ **Si existe y tiene URLs:** Todo bien
❌ **Si no existe:** El trigger no está configurado
❌ **Si está vacía:** Envía un nuevo formulario o ejecuta el trigger manualmente

### Prueba 3: Imagen Directa
Copia una URL de la columna "Enlace directo" y ábrela en el navegador

✅ **Deberías ver:** La imagen del campeón
❌ **Si no carga:** Verifica permisos en Google Drive

## 🏃 Ejecuta la App Android

### En Android Studio:
1. Abre el proyecto en Android Studio
2. Espera a que Gradle sincronice
3. Conecta un dispositivo o inicia un emulador
4. Haz clic en **Run ▶️**

### Lo que deberías ver:
1. **Pantalla de lista** con todos los campeones en grid (2 columnas)
2. **Imágenes** cargadas desde Google Drive
3. **Búsqueda** funcionando al escribir
4. **Filtros** por rol (Top, Mid, Jungler, ADC, Support)
5. **Detalles** al hacer clic en un campeón

## 🐛 Solución Rápida de Problemas

### "No se muestran datos"
1. Verifica la URL de la API en el navegador
2. Revisa Logcat en Android Studio (filtrar por "CharacterRepository")
3. Verifica que hay datos en la hoja de Google Sheets

### "Las imágenes no cargan"
1. Verifica que existe la columna "Enlace directo"
2. Verifica que tiene URLs válidas (https://drive.google.com/uc?export=view&id=...)
3. Prueba abrir la URL en el navegador
4. Verifica permisos de los archivos en Drive

### "Error al enviar el formulario"
1. Verifica que el trigger `onFormSubmit` está configurado
2. Revisa los logs en Apps Script (Ejecuciones)
3. Envía un nuevo formulario de prueba

### "La app crashea"
1. Revisa Logcat en Android Studio
2. Verifica que la URL de la API es correcta
3. Verifica que el JSON tiene la estructura esperada

## 📚 Documentación Completa

Para más detalles, consulta:
- **INSTRUCCIONES_CONFIGURACION_API.md** - Guía completa paso a paso
- **RESUMEN_CAMBIOS_API.md** - Todos los cambios técnicos realizados
- **EJEMPLO_JSON_API.md** - Estructura del JSON y ejemplos
- **google-apps-script-CORRECTO.gs** - Script corregido y mejorado

## 🎯 Resultado Final

Una vez configurado todo correctamente, tendrás:
- ✅ Formulario de Google → Hoja de cálculo → API REST → App Android
- ✅ Conversión automática de URLs de Drive a enlaces directos
- ✅ Carga eficiente de imágenes con Glide
- ✅ Búsqueda y filtrado en tiempo real
- ✅ UI moderna con Material Design

## 💡 Consejos

1. **Prueba primero en el navegador** - Siempre verifica que la API funciona antes de probar en la app
2. **Revisa los logs** - Tanto en Apps Script como en Logcat
3. **Permisos de Drive** - Asegúrate de que los archivos son públicos
4. **Nombres de campos** - Deben coincidir exactamente (case-sensitive)

---

**¿Todo listo?** 🚀

Si seguiste todos los pasos, tu app debería estar funcionando correctamente. Si tienes problemas, revisa la documentación completa o los logs para más detalles.

