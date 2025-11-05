# Cambios Realizados - API de Campeones de League of Legends

## Resumen de Cambios

Se han actualizado los siguientes archivos para corregir el problema de carga de campeones y actualizar los tipos y roles:

### 1. **CharacterRepository.kt**
- ✅ Actualizada la URL del endpoint de la API a: `https://script.google.com/macros/s/AKfycby8S4ntLE3Aa2ckd45rTS49QzLXtirdA5vdqDKx_7vKthIj11zbsvJGHysi8Z-hmhrQlw/exec`

### 2. **AddCharacterFragment.kt**
- ✅ Actualizado el spinner de Tipos a: **Luchador, Mago, Tanque, Asesino**
- ✅ Actualizado el spinner de Roles a: **Top, Mid, Jungler, ADC, Support**

### 3. **EditCharacterFragment.kt**
- ✅ Actualizado el spinner de Tipos a: **Luchador, Mago, Tanque, Asesino**
- ✅ Actualizado el spinner de Roles a: **Top, Mid, Jungler, ADC, Support**

### 4. **Character.kt (modelo)**
- ✅ Actualizado el comentario para reflejar los nuevos tipos y roles

### 5. **CharacterListFragment.kt**
- ✅ Actualizados los filtros por rol para usar: **Top, Mid, Jungler, ADC, Support**

### 6. **bottom_sheet_filter.xml (layout)**
- ✅ Actualizados los botones de filtro para mostrar los nuevos roles de LoL
- ✅ Cambiados los IDs de los botones: btnFilterTop, btnFilterMid, btnFilterJungler, btnFilterADC, btnFilterSupport

### 7. **Nuevo Script: google-apps-script-lol-backend.gs**
- ✅ Creado un script actualizado con validación de tipos y roles
- ✅ Incluye comentarios mejorados específicos para League of Legends
- ✅ Validación de datos en POST y PUT

## Tipos y Roles Válidos

### Tipos (Type):
1. **Luchador** - Campeones de combate cuerpo a cuerpo
2. **Mago** - Campeones que usan hechizos y poder mágico
3. **Tanque** - Campeones resistentes con mucha vida
4. **Asesino** - Campeones que eliminan objetivos rápidamente

### Roles (Role):
1. **Top** - Línea superior
2. **Mid** - Línea central
3. **Jungler** - Jungla
4. **ADC** - Tirador (Bot lane)
5. **Support** - Apoyo (Bot lane)

## Verificación de la API

Para verificar que el endpoint de Google Apps Script está funcionando correctamente, puedes:

1. **Probar el endpoint GET** en un navegador:
   ```
   https://script.google.com/macros/s/AKfycby8S4ntLE3Aa2ckd45rTS49QzLXtirdA5vdqDKx_7vKthIj11zbsvJGHysi8Z-hmhrQlw/exec
   ```
   
   Debería devolver un JSON con la lista de campeones.

2. **Verificar la estructura de respuesta esperada**:
   ```json
   [
     {
       "id": "champ_1",
       "name": "Garen",
       "imageUrl": "https://example.com/garen.jpg",
       "type": "Luchador",
       "role": "Top"
     },
     {
       "id": "champ_2",
       "name": "Ahri",
       "imageUrl": "https://example.com/ahri.jpg",
       "type": "Mago",
       "role": "Mid"
     }
   ]
   ```

## Posibles Problemas y Soluciones

### Problema 1: La API no devuelve datos
**Solución**: Verifica que:
- El Google Sheet tenga los encabezados correctos: `id | name | imageUrl | type | role`
- El script de Google Apps esté desplegado correctamente
- La URL del endpoint sea la correcta

### Problema 2: Los datos no se muestran en la app
**Solución**: Verifica que:
- Los permisos de Internet estén habilitados en el AndroidManifest.xml
- La URL en CharacterRepository.kt sea exactamente la que proporcionaste
- El Google Apps Script permita acceso a "Cualquiera"

### Problema 3: Error de parsing JSON
**Solución**: Asegúrate de que:
- Los datos en el Google Sheet estén formateados correctamente
- No haya filas vacías entre los datos
- Los campos type y role usen los valores correctos (con mayúscula inicial)

## Google Apps Script

Si necesitas actualizar el script de Google Apps, usa el archivo `google-apps-script-lol-backend.gs` que incluye:
- Validación de tipos y roles
- Mejores mensajes de error
- Soporte completo para CRUD (Create, Read, Update, Delete)

### Pasos para actualizar el script:
1. Abre tu proyecto de Google Apps Script
2. Reemplaza el código con el contenido de `google-apps-script-lol-backend.gs`
3. Actualiza `SHEET_ID` con el ID de tu hoja de cálculo
4. Actualiza `SHEET_NAME` si es diferente (por defecto: 'Champions')
5. Despliega una nueva versión de la aplicación web

## Estructura del Google Sheet

Tu hoja de cálculo debe tener esta estructura:

| id | name | imageUrl | type | role |
|----|------|----------|------|------|
| champ_1 | Garen | https://... | Luchador | Top |
| champ_2 | Ahri | https://... | Mago | Mid |
| champ_3 | Lee Sin | https://... | Luchador | Jungler |
| champ_4 | Jinx | https://... | Asesino | ADC |
| champ_5 | Thresh | https://... | Tanque | Support |

## Próximos Pasos

1. ✅ Compila y ejecuta la aplicación Android
2. ✅ Verifica que los campeones se carguen desde la API
3. ✅ Prueba crear un nuevo campeón con los nuevos tipos y roles
4. ✅ Prueba editar un campeón existente
5. ✅ Verifica que los cambios se sincronicen con el Google Sheet

## Notas Adicionales

- Los cambios son retrocompatibles, pero los campeones existentes con tipos/roles antiguos deberán ser actualizados manualmente en el Google Sheet
- La app ahora valida que solo se puedan seleccionar tipos y roles válidos
- Si tienes problemas de conectividad, verifica los permisos de red en el AndroidManifest.xml

