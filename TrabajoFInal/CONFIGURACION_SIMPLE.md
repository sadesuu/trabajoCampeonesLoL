# Configuración Simplificada del Backend con Google Apps Script

## Estructura del Excel/Google Sheets

Tu hoja de cálculo debe tener **exactamente** estos encabezados en la primera fila:

| id | name | imageUrl | type | role |
|----|------|----------|------|------|

**Ejemplo de datos:**

| id | name | imageUrl | type | role |
|----|------|----------|------|------|
| 1 | Jinx | https://example.com/jinx.jpg | Marksman | DPS |
| 2 | Leona | https://example.com/leona.jpg | Fighter | Tank |

## Configuración del Google Apps Script

1. **Abre tu hoja de Google Sheets** (o convierte tu Excel a Google Sheets)

2. **Ve a Extensiones > Apps Script**

3. **Copia el contenido del archivo `google-apps-script-backend-simple.gs`** en el editor de Apps Script

4. **Reemplaza `TU_SHEET_ID`** con el ID de tu hoja:
   - El ID es la parte larga de la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`

5. **Cambia el nombre de la hoja** si es necesario:
   - Por defecto busca una hoja llamada "Characters"
   - Si tu hoja tiene otro nombre, actualiza la línea: `const SHEET_NAME = 'TuNombreDeHoja';`

6. **Despliega el script:**
   - Haz clic en "Implementar" > "Nueva implementación"
   - Tipo: Aplicación web
   - Ejecutar como: Tu cuenta
   - Quién tiene acceso: **Cualquiera**
   - Haz clic en "Implementar"

7. **Copia la URL de la aplicación web** que se genera (algo como: `https://script.google.com/macros/s/AKfycbx.../exec`)

8. **Actualiza la URL en el código Android:**
   - Abre: `app/src/main/java/com/example/trabajofinal/data/repository/CharacterRepository.kt`
   - Reemplaza la `apiUrl` con tu URL

## Verificar que funciona

### Prueba directa en el navegador:
Abre en tu navegador: `TU_URL_DEL_SCRIPT`

Deberías ver algo como:
```json
[
  {
    "id": "1",
    "name": "Jinx",
    "imageUrl": "https://example.com/jinx.jpg",
    "type": "Marksman",
    "role": "DPS"
  }
]
```

## Campos del Modelo

El modelo `Character` ahora solo tiene estos campos:
- **id**: String - Identificador único
- **name**: String - Nombre del campeón
- **imageUrl**: String - URL de la imagen
- **type**: String - Tipo del campeón
- **role**: String - Rol del campeón (Tank, DPS, Support, Healer, Assassin)

## Troubleshooting

### Las cartas aparecen vacías
1. **Verifica que la API devuelve datos**: Abre la URL en el navegador
2. **Revisa el formato de las URLs de imágenes**: Deben ser URLs válidas y accesibles
3. **Verifica los nombres de las columnas**: Deben ser exactamente: `id`, `name`, `imageUrl`, `type`, `role`
4. **Chequea los permisos del script**: Debe estar configurado para "Cualquiera" puede acceder

### La API no responde
1. **Verifica que has desplegado la última versión** del script
2. **Comprueba que el SHEET_ID es correcto**
3. **Asegúrate de que el nombre de la hoja (SHEET_NAME) coincide** con tu hoja

### Errores de red en la app
1. **Verifica que tienes permisos de Internet** en `AndroidManifest.xml`
2. **Comprueba que la URL del script está actualizada** en `CharacterRepository.kt`
3. **Revisa los logs de Android** para ver errores específicos

## Comandos útiles

### Ver logs en Android Studio:
```bash
adb logcat | findstr "CharacterRepository"
```

### Limpiar y reconstruir el proyecto:
```bash
gradlew clean
gradlew build
```

