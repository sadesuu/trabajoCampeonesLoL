# 🔄 FLUJO DE DATOS: Google Sheet → App Android

## 📊 DIAGRAMA DEL PROCESO

```
┌─────────────────────────────────────────────────────────────┐
│  1. GOOGLE FORMS                                            │
│  Usuario llena el formulario con:                          │
│  - Nombre del campeón                                       │
│  - Tipo (Luchador, Mago, etc.)                             │
│  - Rol (Top, Mid, ADC, etc.)                               │
│  - Foto (upload a Drive)                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GOOGLE SHEETS                                           │
│  "Respuestas de formulario 1"                              │
│                                                             │
│  Columna A: Marca temporal                                 │
│  Columna B: nombre         ← "Jinx"                        │
│  Columna C: fotografía     ← "https://drive.../open?id..." │
│  Columna D: tipo           ← "Tirador"                     │
│  Columna E: rol            ← "ADC"                         │
│  Columna F: Enlace directo ← (vacío inicialmente)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. TRIGGER: onFormSubmit                                   │
│  Se ejecuta automáticamente al enviar el formulario        │
│                                                             │
│  Paso 3.1: Extrae el ID del archivo de Drive              │
│            "https://drive.../open?id=ABC123"               │
│            → extrae: "ABC123"                              │
│                                                             │
│  Paso 3.2: Cambia permisos del archivo                    │
│            DriveApp.setSharing(ANYONE_WITH_LINK)           │
│                                                             │
│  Paso 3.3: Genera URL directa                              │
│            "https://drive.google.com/uc?export=view&id=ABC123" │
│                                                             │
│  Paso 3.4: Guarda en columna "Enlace directo"             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. API ENDPOINT: doGet()                                   │
│  URL: .../exec                                             │
│                                                             │
│  Devuelve JSON:                                            │
│  [                                                          │
│    {                                                        │
│      "Marca temporal": "05/11/2025 10:30:45",             │
│      "nombre": "Jinx",              ← USADO EN APP        │
│      "fotografía": "https://drive.../open?id=...",        │
│      "tipo": "Tirador",             ← USADO EN APP        │
│      "rol": "ADC",                  ← USADO EN APP        │
│      "Enlace directo": "https://drive.../uc?..."  ← USADO │
│    }                                                        │
│  ]                                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  5. APP ANDROID: CharacterRepository                        │
│  URL: apiUrl                                               │
│                                                             │
│  5.1: HttpURLConnection.GET(apiUrl)                        │
│  5.2: Lee response JSON                                    │
│  5.3: Log: "Response code: 200"                           │
│  5.4: Log: "Response JSON: [...]"                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  6. PARSEO JSON → OBJETO KOTLIN                             │
│  Gson.fromJson<List<Character>>(response)                  │
│                                                             │
│  Character.kt con @SerializedName:                         │
│  @SerializedName("nombre")         → name: String          │
│  @SerializedName("tipo")           → type: String          │
│  @SerializedName("rol")            → role: String          │
│  @SerializedName("Enlace directo") → imagePublicUrl        │
│                                                             │
│  Resultado:                                                │
│  Character(                                                │
│    name = "Jinx",                                          │
│    type = "Tirador",                                       │
│    role = "ADC",                                           │
│    imagePublicUrl = "https://drive.../uc?..."             │
│  )                                                          │
│                                                             │
│  Log: "Parsed 3 characters"                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  7. CharacterViewModel                                      │
│  Recibe: List<Character>                                   │
│                                                             │
│  7.1: allCharacters = data                                 │
│  7.2: _characters.value = data                            │
│  7.3: _filteredCharacters.value = data                    │
│                                                             │
│  Log: "Received 3 characters"                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  8. CharacterListFragment                                   │
│  Observa: viewModel.filteredCharacters                     │
│                                                             │
│  8.1: adapter.submitList(characters)                       │
│  8.2: Toast: "Personajes recibidos: 3"  ← DEBUG           │
│                                                             │
│  Log: "filteredCharacters updated: size=3"                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  9. CharacterAdapter.onBindViewHolder                       │
│  Para cada Character en la lista:                          │
│                                                             │
│  9.1: holder.bind(character)                               │
│                                                             │
│  Log: "Binding position 0: Jinx, Tirador, ADC"           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  10. CharacterViewHolder.bind()                             │
│  Asigna valores a las vistas:                              │
│                                                             │
│  nameTextView.text = character.name        → "Jinx"        │
│  raceTextView.text = character.type        → "Tirador"     │
│  roleTextView.text = character.role        → "ADC"         │
│                                                             │
│  Glide.load(character.imagePublicUrl)                      │
│       .into(imageView)                                     │
│                                                             │
│  Log: "Binding character: Jinx, type: Tirador, role: ADC" │
│  Log: "Loading image from: https://drive.../uc?..."       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  11. UI FINAL - CARTA DEL CAMPEÓN                           │
│  ┌─────────────────────────────────┐                       │
│  │ [FOTO DEL CAMPEÓN]              │                       │
│  │                                 │                       │
│  │ Jinx                            │  ← character.name     │
│  │ [Tirador] [ADC]                 │  ← type + role        │
│  └─────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## ⚠️ PUNTOS CRÍTICOS DONDE PUEDE FALLAR

### Punto A: Nombres de columnas no coinciden
```
Google Sheet columna: "Nombre"  ← Con mayúscula
Android @SerializedName: "nombre"  ← minúscula
❌ GSON no encuentra coincidencia → campo queda vacío
```

**Solución:** Usar exactamente los mismos nombres (case-sensitive)

### Punto B: Trigger onFormSubmit no configurado
```
Google Sheet:
- Columna "Enlace directo" → VACÍA
App Android:
- character.imagePublicUrl → ""
- character.imageUrl → "https://drive.../open?id=..." (no funciona)
❌ Las imágenes no cargan
```

**Solución:** Configurar trigger o ejecutar `procesarTodasLasFilas()`

### Punto C: Response code != 200
```
CharacterRepository:
- Log: "Response code: 302" o "Response code: 404"
- Devuelve: emptyList()
CharacterViewModel:
- Recibe: []
UI:
- Toast: "Personajes recibidos: 0"
```

**Solución:** Verificar URL de la API, permisos del script

### Punto D: JSON con estructura diferente
```
API devuelve:
{
  "data": [
    { "nombre": "Jinx", ... }
  ]
}

Pero Android espera:
[
  { "nombre": "Jinx", ... }
]

❌ GSON no puede parsear
```

**Solución:** Ajustar el script o el modelo en Android

## 🔍 CÓMO DIAGNOSTICAR PROBLEMAS

### Método 1: Seguir los logs
```bash
# En Android Studio → Logcat, busca en orden:

1. "Fetching characters from:"
   → ✅ Si aparece: la app está intentando cargar
   → ❌ Si no aparece: loadCharacters() no se llamó

2. "Response code: 200"
   → ✅ Si es 200: la API respondió OK
   → ❌ Si es 302/404/etc: problema en la API

3. "Response JSON:"
   → ✅ Si muestra datos: el JSON llegó
   → ❌ Si muestra error: problema en el script

4. "Parsed 3 characters"
   → ✅ Si > 0: GSON parseó correctamente
   → ❌ Si = 0: problema en @SerializedName

5. "Received 3 characters"
   → ✅ Si > 0: ViewModel tiene datos
   → ❌ Si = 0: problema en Repository

6. "filteredCharacters updated: size=3"
   → ✅ Si > 0: Fragment recibió datos
   → ❌ Si = 0: problema en ViewModel

7. "Binding character: Jinx, ..."
   → ✅ Si aparece: Adapter está funcionando
   → ❌ Si no aparece: problema en RecyclerView
```

### Método 2: Ver el Toast
```
Toast: "Personajes recibidos: X"

X = 0  → Problema en pasos 1-6 (API/parseo)
X > 0  → Problema en pasos 7-11 (UI)
```

### Método 3: Verificar la API directamente
```
Navegador: Abre la URL de la API
✅ Ves JSON → API funciona
❌ Ves error → Problema en Google Apps Script
```

## 📝 CHECKLIST RÁPIDO

- [ ] Columnas en Google Sheet: `nombre`, `tipo`, `rol`, `Enlace directo`
- [ ] Script desplegado como Web App con acceso "Cualquiera"
- [ ] Trigger `onFormSubmit` configurado
- [ ] Columna "Enlace directo" tiene URLs (no vacía)
- [ ] URL en `CharacterRepository.kt` termina en `/exec`
- [ ] `@SerializedName` en `Character.kt` coinciden con columnas
- [ ] App ejecutada y Toast visible
- [ ] Logcat filtrado por tags relevantes

Si todos los checkmarks están ✅, la app debería mostrar los campeones correctamente.

