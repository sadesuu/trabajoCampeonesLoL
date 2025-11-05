# Instrucciones de Configuración de la API

## 📋 Pasos para Configurar Google Apps Script

### 1. Preparar tu Formulario de Google

Tu formulario debe tener los siguientes campos (en este orden es preferible, pero no obligatorio):

1. **Marca temporal** - Se genera automáticamente
2. **nombre** - Nombre del campeón (texto)
3. **fotografía** - Subida de archivo (imagen)
4. **tipo** - Tipo del campeón (opciones: Luchador, Mago, Tanque, Asesino, Marksman, Tirador, etc.)
5. **rol** - Rol del campeón (opciones: Top, Mid, Jungler, ADC, Support)

### 2. Configurar el Apps Script

1. Abre la hoja de respuestas de tu formulario en Google Sheets
2. Ve a **Extensiones > Apps Script**
3. Copia y pega el contenido del archivo `google-apps-script-CORRECTO.gs`
4. Guarda el proyecto (Ctrl+S o Cmd+S)

### 3. Configurar el Trigger (Activador) para el Formulario

Para que las imágenes se conviertan automáticamente en enlaces directos:

1. En el editor de Apps Script, haz clic en el icono del reloj ⏰ (Activadores)
2. Haz clic en "+ Agregar activador"
3. Configura:
   - Función: `onFormSubmit`
   - Tipo de evento: Del formulario
   - Tipo de evento del formulario: Al enviar formulario
4. Guarda

### 4. Desplegar como Web App

1. En Apps Script, haz clic en **Implementar > Nueva implementación**
2. Configura:
   - Tipo: Aplicación web
   - Descripción: "API Campeones LoL"
   - Ejecutar como: **Tu cuenta**
   - Quien tiene acceso: **Cualquiera**
3. Haz clic en **Implementar**
4. **Copia la URL** que se genera (similar a: `https://script.google.com/macros/s/AKfycbx.../exec`)

### 5. Actualizar la URL en la Aplicación Android

La URL ya está actualizada en el código:
```
https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec
```

Si necesitas cambiarla, edita el archivo:
`app/src/main/java/com/example/trabajofinal/data/repository/CharacterRepository.kt`

### 6. Estructura de la Hoja de Cálculo

Después de configurar el trigger, tu hoja debería verse así:

| Marca temporal | nombre | fotografía | tipo | rol | Enlace directo |
|----------------|--------|------------|------|-----|----------------|
| 05/11/2024 10:30:00 | Jinx | https://drive.google.com/... | Tirador | ADC | https://drive.google.com/uc?export=view&id=... |

La columna "Enlace directo" se genera automáticamente por el script `onFormSubmit`.

### 7. Probar la API

Abre en tu navegador la URL de tu API:
```
https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec
```

Deberías ver un JSON con tus datos:
```json
[
  {
    "Marca temporal": "05/11/2024 10:30:00",
    "nombre": "Jinx",
    "fotografía": "https://drive.google.com/open?id=...",
    "tipo": "Tirador",
    "rol": "ADC",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=..."
  }
]
```

### 8. Compilar y Ejecutar la App Android

1. Abre el proyecto en Android Studio
2. Espera a que Gradle termine de sincronizar
3. Conecta un dispositivo o inicia un emulador
4. Haz clic en Run ▶️

## ⚠️ Solución de Problemas

### Las imágenes no se cargan

1. Verifica que el trigger `onFormSubmit` está configurado
2. Verifica que la columna "Enlace directo" tiene URLs
3. Verifica que los archivos en Drive tienen permisos públicos

### La app no muestra datos

1. Verifica la URL de la API en `CharacterRepository.kt`
2. Verifica que la API responde correctamente en el navegador
3. Revisa los logs en Logcat (Android Studio)

### Error de CORS o permisos

1. Asegúrate de que el script está desplegado con acceso "Cualquiera"
2. Re-despliega la aplicación web (Nueva implementación)

## 📱 Uso de la Aplicación

La aplicación ahora:
- ✅ Carga automáticamente los datos de tu formulario
- ✅ Muestra las imágenes desde Google Drive
- ✅ Permite buscar campeones por nombre
- ✅ Permite filtrar por rol (Top, Mid, Jungler, ADC, Support)
- ✅ Ordena alfabéticamente
- ✅ Muestra detalles de cada campeón

## 📝 Notas Importantes

- Los campos del modelo se mapean usando `@SerializedName` para coincidir con los nombres de las columnas del formulario
- El `id` del campeón se genera automáticamente desde el nombre
- El script convierte automáticamente las URLs de Drive al formato directo para cargar imágenes
- La app usa Glide para cargar imágenes eficientemente

