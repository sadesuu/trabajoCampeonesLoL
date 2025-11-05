package com.example.trabajofinal.data.model

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Character(
    @SerializedName("Marca temporal")
    val timestamp: String = "",

    @SerializedName("Nombre")  // ← Cambiado de "nombre" a "Nombre" (con mayúscula)
    val name: String = "",

    @SerializedName("Imaguen Del Campeon")  // ← Cambiado de "fotografía" a "Imaguen Del Campeon"
    val imageUrl: String = "",

    @SerializedName("Enlace directo")  // ← Mantener por si el trigger genera esta columna
    val imagePublicUrl: String = "",

    @SerializedName("Tipo")  // ← Cambiado de "tipo" a "Tipo" (con mayúscula)
    val type: String = "", // Tipo del campeón (Luchador, Mago, Tanque, Asesino)

    @SerializedName("Rol")  // ← Cambiado de "rol" a "Rol" (con mayúscula)
    val role: String = "" // Rol del campeón (Top, Mid, Jungler, ADC, Support)
) : Serializable {
    // Propiedad calculada para usar como ID
    val id: String
        get() = name
}
