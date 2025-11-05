package com.example.trabajofinal.ui.adapter

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.trabajofinal.R
import com.example.trabajofinal.data.model.Character

class CharacterAdapter(
    private val onCharacterClick: (Character) -> Unit
) : ListAdapter<Character, CharacterAdapter.CharacterViewHolder>(CharacterDiffCallback()) {

    class CharacterViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val cardView: CardView = view.findViewById(R.id.cardCharacter)
        val imageView: ImageView = view.findViewById(R.id.ivCharacterImage)
        val nameTextView: TextView = view.findViewById(R.id.tv_character_name)
        val raceTextView: TextView = view.findViewById(R.id.tvCharacterRace)
        val roleTextView: TextView = view.findViewById(R.id.tvCharacterRole)

        fun bind(character: Character, onCharacterClick: (Character) -> Unit) {
            // Log para debugging
            Log.d("CharacterViewHolder", "Binding character: ${character.name}, type: ${character.type}, role(raw): ${character.role}, imageUrl(raw): ${character.imageUrl}, imagePublicUrl: ${character.imagePublicUrl}")

            // Asignar textos
            nameTextView.text = character.name
            raceTextView.text = if (character.type.isNotBlank()) character.type else "Tipo desconocido"

            fun looksLikeUrl(s: String): Boolean {
                if (s.isBlank()) return false
                val lower = s.lowercase()
                val extPattern = ".*\\.(png|jpg|jpeg|gif|webp)".toRegex(RegexOption.IGNORE_CASE)
                return lower.contains("http") || lower.contains("drive.google.com") || lower.contains("docs.google.com") || lower.contains("googleusercontent.com") || extPattern.matches(s)
            }

            // Preferir la URL ya normalizada que viene del backend
            val candidateFromBackend = if (character.imagePublicUrl.isNotBlank()) character.imagePublicUrl else ""

            val candidateImageField = when {
                candidateFromBackend.isNotBlank() -> candidateFromBackend
                looksLikeUrl(character.role) -> character.role
                looksLikeUrl(character.imageUrl) -> character.imageUrl
                else -> ""
            }

            val roleText = when {
                character.imageUrl.isNotBlank() && !looksLikeUrl(character.imageUrl) -> character.imageUrl
                character.role.isNotBlank() && !looksLikeUrl(character.role) -> character.role
                else -> "Rol desconocido"
            }

            roleTextView.text = roleText

            // Cargar imagen (sin conversión) - confiar en que el backend ya normalizó la URL
            if (candidateImageField.isBlank()) {
                Log.w("CharacterViewHolder", "No se encontró URL de imagen válida para ${character.name}; se usa placeholder")
                imageView.setImageResource(R.drawable.ic_launcher_foreground)
            } else {
                Log.d("CharacterViewHolder", "Loading image from: $candidateImageField for ${character.name}")
                Glide.with(itemView.context)
                    .load(candidateImageField)
                    .placeholder(R.drawable.ic_launcher_foreground)
                    .error(R.drawable.ic_launcher_background)
                    .into(imageView)
            }

            cardView.setOnClickListener {
                onCharacterClick(character)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CharacterViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_character, parent, false)
        return CharacterViewHolder(view)
    }

    override fun onBindViewHolder(holder: CharacterViewHolder, position: Int) {
        val character = getItem(position)
        Log.d("Adapter", "Binding position $position: ${character.name}, ${character.type}, ${character.role}")
        holder.bind(character, onCharacterClick)
    }

    class CharacterDiffCallback : DiffUtil.ItemCallback<Character>() {
        override fun areItemsTheSame(oldItem: Character, newItem: Character): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Character, newItem: Character): Boolean {
            return oldItem == newItem
        }
    }
}
