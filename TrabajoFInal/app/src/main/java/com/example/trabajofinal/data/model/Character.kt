package com.example.trabajofinal.data.model

import com.google.gson.annotations.SerializedName
import java.io.Serializable

/**
 * Modelo de datos para un Campeón de League of Legends
 *
 * Se añaden campos auxiliares para permitir subida de imagen desde el dispositivo y renombrado:
 * - imageBase64: contenido codificado en Base64 de la imagen seleccionada
 * - imageFileName: nombre sugerido del archivo en Drive
 * - originalName: nombre original para localizar la fila al editar (si se renombra)
 * Estos campos NO están presentes en el Sheet, el backend los procesa si llegan.
 */
data class Character(
    /** Marca temporal del formulario de Google Forms */
    @SerializedName("Marca temporal")
    val timestamp: String = "",

    /** Nombre del campeón (ej: "Ahri", "Yasuo", "Lux") */
    @SerializedName("Nombre")
    val name: String = "",

    /** URL de la imagen cargada desde Google Drive (formato original) */
    @SerializedName("Imagen del Campeón")
    val imageUrl: String = "",

    /** URL directa generada por el script para visualización (formato: drive.google.com/uc?export=view&id=...) */
    @SerializedName("Enlace directo")
    val imagePublicUrl: String = "",

    /** Tipo/Clase del campeón (ej: "Luchador", "Mago", "Tanque", "Asesino", "Tirador", "Soporte") */
    @SerializedName("Tipo")
    val type: String = "",

    /** Rol/Posición del campeón (ej: "Top", "Mid", "Jungler", "ADC", "Support") */
    @SerializedName("Rol")
    val role: String = "",

    /** Campo auxiliar para envío de imagen codificada */
    @SerializedName("imageBase64")
    val imageBase64: String = "",

    /** Campo auxiliar para sugerir nombre de archivo */
    @SerializedName("imageFileName")
    val imageFileName: String = "",

    /** Campo auxiliar: nombre original del campeón al editar (para soportar renombrado) */
    @SerializedName("originalName")
    val originalName: String = ""
) : Serializable {
    /** Identificador único del campeón basado en su nombre */
    val id: String
        get() = name
}
