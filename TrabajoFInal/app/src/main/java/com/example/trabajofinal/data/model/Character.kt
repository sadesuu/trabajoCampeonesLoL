package com.example.trabajofinal.data.model

import java.io.Serializable

data class Character(
    val id: String = "",
    val name: String = "",
    val imageUrl: String = "",
    val type: String = "", // Tipo del campeón (Luchador, Mago, Tanque, Asesino)
    val role: String = "" // Rol del campeón (Top, Mid, Jungler, ADC, Support)
) : Serializable

