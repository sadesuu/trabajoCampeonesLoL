package com.example.trabajofinal.ui.adapter

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
import com.example.trabajofinal.util.UrlUtils

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
            nameTextView.text = character.name.ifBlank { "Sin nombre" }
            raceTextView.text = character.type.ifBlank { "Tipo desconocido" }
            roleTextView.text = character.role.ifBlank { "Rol desconocido" }

            // Priorizar imagePublicUrl (URL directa de Google Drive) sobre imageUrl
            val imageToLoad = when {
                isValidUrl(character.imagePublicUrl) -> character.imagePublicUrl
                isValidUrl(character.imageUrl) -> character.imageUrl
                else -> null
            }

            val normalized = imageToLoad?.let { UrlUtils.toDirectDriveImageUrl(it) }
            if (imageToLoad != normalized) {
                android.util.Log.d("CharacterAdapter", "Normalized URL: '$imageToLoad' -> '$normalized'")
            }

            // Log para debug
            android.util.Log.d("CharacterAdapter", "Character: ${character.name}")
            android.util.Log.d("CharacterAdapter", "imageUrl: '${character.imageUrl}'")
            android.util.Log.d("CharacterAdapter", "imagePublicUrl: '${character.imagePublicUrl}'")
            android.util.Log.d("CharacterAdapter", "imageToLoad: '$imageToLoad'")
            android.util.Log.d("CharacterAdapter", "imageNormalized: '$normalized'")

            // Cargar imagen con Glide
            if (normalized != null) {
                Glide.with(itemView.context)
                    .load(normalized)
                    .placeholder(R.drawable.ic_launcher_foreground)
                    .error(R.drawable.ic_launcher_background)
                    .listener(object : com.bumptech.glide.request.RequestListener<android.graphics.drawable.Drawable> {
                        override fun onLoadFailed(
                            e: com.bumptech.glide.load.engine.GlideException?,
                            model: Any?,
                            target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>,
                            isFirstResource: Boolean
                        ): Boolean {
                            android.util.Log.e("CharacterAdapter", "Error loading image: $imageToLoad", e)
                            e?.logRootCauses("CharacterAdapter")
                            return false
                        }

                        override fun onResourceReady(
                            resource: android.graphics.drawable.Drawable,
                            model: Any,
                            target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>?,
                            dataSource: com.bumptech.glide.load.DataSource,
                            isFirstResource: Boolean
                        ): Boolean {
                            android.util.Log.d("CharacterAdapter", "Image loaded successfully: $imageToLoad")
                            return false
                        }
                    })
                    .into(imageView)
            } else {
                android.util.Log.w("CharacterAdapter", "No valid image URL for ${character.name}")
                imageView.setImageResource(R.drawable.ic_launcher_foreground)
            }

            cardView.setOnClickListener {
                onCharacterClick(character)
            }
        }

        /**
         * Valida si una cadena es una URL válida para mostrar imágenes
         */
        private fun isValidUrl(s: String?): Boolean {
            if (s.isNullOrBlank()) return false
            val lower = s.lowercase()
            return lower.startsWith("http://") ||
                   lower.startsWith("https://") ||
                   lower.contains("drive.google.com") ||
                   lower.contains("docs.google.com") ||
                   lower.contains("googleusercontent.com")
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CharacterViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_character, parent, false)
        return CharacterViewHolder(view)
    }

    override fun onBindViewHolder(holder: CharacterViewHolder, position: Int) {
        holder.bind(getItem(position), onCharacterClick)
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
