package com.example.trabajofinal.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.trabajofinal.R
import com.example.trabajofinal.data.model.Character

class CharacterAdapter(
    private var characters: List<Character>,
    private val onCharacterClick: (Character) -> Unit
) : RecyclerView.Adapter<CharacterAdapter.CharacterViewHolder>() {

    class CharacterViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val cardView: CardView = view.findViewById(R.id.cardCharacter)
        val imageView: ImageView = view.findViewById(R.id.ivCharacterImage)
        val nameTextView: TextView = view.findViewById(R.id.tvCharacterName)
        val raceTextView: TextView = view.findViewById(R.id.tvCharacterRace)
        val roleTextView: TextView = view.findViewById(R.id.tvCharacterRole)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CharacterViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_character, parent, false)
        return CharacterViewHolder(view)
    }

    override fun onBindViewHolder(holder: CharacterViewHolder, position: Int) {
        val character = characters[position]

        holder.nameTextView.text = character.name
        holder.raceTextView.text = character.type
        holder.roleTextView.text = character.role

        // Convert Google Drive URL if needed
        val imageUrl = convertDriveUrl(character.imageUrl)

        // Load image with Glide
        Glide.with(holder.imageView.context)
            .load(imageUrl)
            .placeholder(R.drawable.ic_launcher_foreground)
            .error(R.drawable.ic_launcher_foreground)
            .into(holder.imageView)

        holder.cardView.setOnClickListener {
            onCharacterClick(character)
        }
    }

    override fun getItemCount() = characters.size

    fun updateCharacters(newCharacters: List<Character>) {
        characters = newCharacters
        notifyDataSetChanged()
    }

    private fun convertDriveUrl(url: String): String {
        if (url.isEmpty()) return url
        
        // Si ya es una URL directa, retornarla
        if (url.contains("drive.google.com/uc?")) {
            return url
        }
        
        // Convertir URL de Google Drive al formato directo
        // Formato: https://drive.google.com/file/d/FILE_ID/view
        // A: https://drive.google.com/uc?export=view&id=FILE_ID
        val driveFilePattern = "drive\\.google\\.com/file/d/([^/]+)".toRegex()
        val match = driveFilePattern.find(url)
        
        return if (match != null) {
            val fileId = match.groupValues[1]
            "https://drive.google.com/uc?export=view&id=$fileId"
        } else {
            url
        }
    }
}

