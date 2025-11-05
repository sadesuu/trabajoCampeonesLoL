# Ejemplo de Respuesta JSON de la API

## Estructura Esperada

Cuando accedas a tu API:
```
https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec
```

Deberías obtener un JSON similar a este:

```json
[
  {
    "Marca temporal": "05/11/2025 10:30:45",
    "nombre": "Jinx",
    "fotografía": "https://drive.google.com/open?id=1aBcDeFgHiJkLmNoPqRsTuVwXyZ",
    "tipo": "Tirador",
    "rol": "ADC",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
  },
  {
    "Marca temporal": "05/11/2025 11:15:22",
    "nombre": "Leona",
    "fotografía": "https://drive.google.com/open?id=2CdEfGhIjKlMnOpQrStUvWxYz",
    "tipo": "Tanque",
    "rol": "Support",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=2CdEfGhIjKlMnOpQrStUvWxYz"
  },
  {
    "Marca temporal": "05/11/2025 12:00:00",
    "nombre": "Yasuo",
    "fotografía": "https://drive.google.com/open?id=3DeFgHiJkLmNoPqRsTuVwXyZa",
    "tipo": "Luchador",
    "rol": "Mid",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=3DeFgHiJkLmNoPqRsTuVwXyZa"
  }
]
```

## Mapeo de Campos en la App

La aplicación Android mapea estos campos automáticamente:

| Campo JSON (Google Forms) | Propiedad en Character | Uso |
|---------------------------|------------------------|-----|
| `"Marca temporal"` | `timestamp: String` | Fecha de creación |
| `"nombre"` | `name: String` | Nombre del campeón (también usado como ID) |
| `"fotografía"` | `imageUrl: String` | URL original de Google Drive |
| `"Enlace directo"` | `imagePublicUrl: String` | URL directa para cargar imagen |
| `"tipo"` | `type: String` | Tipo del campeón |
| `"rol"` | `role: String` | Rol del campeón |

## Cómo Verificar

### 1. Verifica en el Navegador

Abre la URL de tu API en cualquier navegador. Deberías ver el JSON completo.

### 2. Usa una Extensión de Navegador

Instala una extensión como "JSON Viewer" para visualizar mejor el JSON:
- Chrome: JSON Viewer
- Firefox: JSONView

### 3. Verifica los Campos

Asegúrate de que tu respuesta JSON tiene:
- ✅ `"Marca temporal"` - Fecha formateada como string
- ✅ `"nombre"` - Nombre del campeón
- ✅ `"fotografía"` - URL de Google Drive original
- ✅ `"tipo"` - Tipo (Luchador, Mago, Tanque, Asesino, Tirador, etc.)
- ✅ `"rol"` - Rol (Top, Mid, Jungler, ADC, Support)
- ✅ `"Enlace directo"` - URL directa de Drive (si el trigger está configurado)

## Solución de Problemas

### ❌ Si ves un error

```json
{
  "error": "Error al obtener datos",
  "message": "..."
}
```

**Solución:**
1. Verifica que la hoja se llama "Respuestas de formulario 1"
2. Verifica que hay datos en la hoja
3. Revisa los logs en Apps Script

### ❌ Si no hay "Enlace directo"

**Causa:** El trigger `onFormSubmit` no está configurado o no se ha ejecutado.

**Solución:**
1. Configura el trigger como se explica en `INSTRUCCIONES_CONFIGURACION_API.md`
2. Para datos existentes, ejecuta manualmente `onFormSubmit` para cada fila

### ❌ Si las imágenes no cargan en la app

**Posibles causas:**
1. La columna "Enlace directo" está vacía
2. Los permisos del archivo de Drive no son públicos
3. El ID del archivo es incorrecto

**Solución:**
1. Verifica que el script `onFormSubmit` se ejecutó correctamente
2. Verifica en Drive que los archivos tienen permisos "Cualquiera con el enlace"
3. Prueba abrir el "Enlace directo" en el navegador

## Ejemplo de Campos Válidos

### Tipos válidos:
- Luchador
- Mago
- Tanque
- Asesino
- Tirador / Marksman
- Apoyo / Support

### Roles válidos:
- Top
- Mid / Middle
- Jungler / Jungla
- ADC / Bot
- Support / Apoyo

## Prueba la API desde la Terminal

Si quieres probar desde la línea de comandos:

### Windows (PowerShell):
```powershell
Invoke-WebRequest -Uri "https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec" | Select-Object -Expand Content
```

### Windows (curl):
```bash
curl "https://script.google.com/macros/s/AKfycbx8mpLXNoZX4ONqYGQQWnuh708pqbNv6mqyfB6sqnfzL8oZOUDOdto0TQtpXgv-A7zIDA/exec"
```

## Notas Importantes

- ⚠️ Los nombres de las columnas son **case-sensitive** (sensibles a mayúsculas/minúsculas)
- ⚠️ Si cambias el nombre de alguna columna en el formulario, debes actualizar el `@SerializedName` en `Character.kt`
- ✅ El script es tolerante a errores y seguirá funcionando aunque falten algunos campos
- ✅ Los valores vacíos se manejan como strings vacíos (`""`) en la app

