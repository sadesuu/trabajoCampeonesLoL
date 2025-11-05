package com.example.trabajofinal.data.model

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Character(
    @SerializedName("Marca temporal")
    val timestamp: String = "",

    @SerializedName("nombre")
    val name: String = "",

    @SerializedName("fotografía")
    val imageUrl: String = "",

    @SerializedName("Enlace directo")
    val imagePublicUrl: String = "",

    @SerializedName("tipo")
    val type: String = "", // Tipo del campeón (Luchador, Mago, Tanque, Asesino)

    @SerializedName("rol")
    val role: String = "" // Rol del campeón (Top, Mid, Jungler, ADC, Support)
) : Serializable {
    // Propiedad calculada para usar como ID
    val id: String
        get() = name
}
