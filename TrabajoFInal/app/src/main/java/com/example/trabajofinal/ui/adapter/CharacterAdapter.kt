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
        holder.raceTextView.text = character.race
        holder.roleTextView.text = character.role

        // Load image with Glide
        Glide.with(holder.imageView.context)
            .load(character.imageUrl)
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
}

