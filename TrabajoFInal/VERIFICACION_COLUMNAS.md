# Verificación de Columnas del Google Sheet

## ⚠️ IMPORTANTE: Los nombres de las columnas son SENSIBLES A MAYÚSCULAS

Tu script de Google Apps Script usa:
```javascript
row[headers[j]] = valor;
```

Esto significa que devuelve los nombres de columna **exactamente como están en la fila 1** de tu hoja de cálculo.

## Nombres que debe tener tu Google Sheet (Fila 1)

La primera fila de tu hoja "Respuestas de formulario 1" debe tener **exactamente** estos nombres:

| Columna | Nombre EXACTO requerido | Uso en la app |
|---------|------------------------|---------------|
| A | `Marca temporal` | Fecha de creación |
| B | `nombre` | Nombre del campeón ⭐ |
| C | `fotografía` | URL de Drive original |
| D | `tipo` | Tipo del campeón ⭐ |
| E | `rol` | Rol del campeón ⭐ |
| F | `Enlace directo` | URL directa de imagen ⭐ |

⭐ = Campos visibles en la carta del campeón

## ❌ Errores comunes que rompen la app

### Error 1: Mayúsculas incorrectas
- ❌ `Nombre` → debe ser `nombre` (minúscula)
- ❌ `Tipo` → debe ser `tipo` (minúscula)
- ❌ `Rol` → debe ser `rol` (minúscula)
- ❌ `Fotografía` → debe ser `fotografía` (minúscula con tilde)

### Error 2: Nombres en inglés
- ❌ `name` → debe ser `nombre`
- ❌ `type` → debe ser `tipo`
- ❌ `role` → debe ser `rol`
- ❌ `photo` → debe ser `fotografía`

### Error 3: Espacios extra
- ❌ `nombre ` (con espacio al final)
- ❌ ` nombre` (con espacio al inicio)

## ✅ Cómo verificar tus columnas

### Opción 1: Ver en el navegador
1. Abre tu URL de la API en el navegador:
   ```
   https://script.google.com/macros/s/TU_SCRIPT_ID/exec
   ```

2. Mira el primer objeto del JSON:
   ```json
   {
     "Marca temporal": "05/11/2025 10:30:45",
     "nombre": "Garen",
     "fotografía": "https://drive.google.com...",
     "tipo": "Luchador",
     "rol": "Top",
     "Enlace directo": "https://drive.google.com/uc?..."
   }
   ```

3. **Los nombres de las claves deben coincidir EXACTAMENTE** con los de la tabla de arriba.

### Opción 2: Ver en Google Sheets
1. Abre tu Google Sheet
2. Mira la fila 1 (encabezados)
3. Verifica que sean exactamente:
   - `Marca temporal`
   - `nombre`
   - `fotografía`
   - `tipo`
   - `rol`
   - `Enlace directo`

## 🔧 Cómo corregir si los nombres son diferentes

### Si Google Forms creó los nombres automáticamente

Google Forms suele usar los nombres de las preguntas. Debes:

1. Abrir el Google Sheet
2. Hacer clic derecho en la fila 1 (encabezados)
3. Renombrar las columnas manualmente a:
   - La pregunta del nombre → cambiar a `nombre`
   - La pregunta del tipo → cambiar a `tipo`
   - La pregunta del rol → cambiar a `rol`
   - La columna de foto → cambiar a `fotografía`

### Si quieres mantener los nombres actuales

Alternativa: Modificar el modelo en Android para que coincida con TUS nombres.

**Ejemplo:** Si tu hoja tiene `Nombre` (con mayúscula) en lugar de `nombre`:

```kotlin
// En Character.kt, cambiar de:
@SerializedName("nombre")
val name: String = "",

// A:
@SerializedName("Nombre")  // ← Con mayúscula
val name: String = "",
```

## 📋 Checklist de verificación

- [ ] He abierto la URL de mi API en el navegador
- [ ] Veo un array JSON con objetos
- [ ] Cada objeto tiene las claves: `Marca temporal`, `nombre`, `fotografía`, `tipo`, `rol`, `Enlace directo`
- [ ] Los nombres de las claves coinciden EXACTAMENTE (mayúsculas/minúsculas) con la tabla de arriba
- [ ] La columna `Enlace directo` tiene URLs (no está vacía)
- [ ] He ejecutado la app y veo logs en Logcat

## 🆘 Si aún no funciona

Copia y pega aquí:

1. **La primera línea del JSON** que ves en el navegador (un objeto completo)
2. **Los logs de Logcat** filtrados por:
   - CharacterRepository
   - CharacterViewModel
   - CharacterListFragment

Con esa información puedo identificar exactamente qué está fallando.

## 📝 Ejemplo de JSON correcto

```json
[
  {
    "Marca temporal": "05/11/2025 10:30:45",
    "nombre": "Jinx",
    "fotografía": "https://drive.google.com/open?id=1ABC...",
    "tipo": "Tirador",
    "rol": "ADC",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=1ABC..."
  },
  {
    "Marca temporal": "05/11/2025 11:15:22",
    "nombre": "Garen",
    "fotografía": "https://drive.google.com/open?id=2DEF...",
    "tipo": "Luchador",
    "rol": "Top",
    "Enlace directo": "https://drive.google.com/uc?export=view&id=2DEF..."
  }
]
```

Si tu JSON se ve diferente, necesitas ajustar los nombres de las columnas en el Google Sheet o el modelo en Android.

