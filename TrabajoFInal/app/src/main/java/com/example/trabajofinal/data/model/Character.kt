package com.example.trabajofinal.data.model

import java.io.Serializable

data class Character(
    val id: String,
    val name: String,
    val imageUrl: String,
    val race: String, // Human, Orc, Elf, Machine, etc.
    val role: String, // DPS, Tank, Support, Healer, Assassin
    val type: String, // Knight, Orc, Elf, Machine, Human
    val faction: String,
    val level: Int,
    val attack: Int,
    val defense: Int,
    val speed: Int,
    val magic: Int,
    val biography: String
) : Serializable

