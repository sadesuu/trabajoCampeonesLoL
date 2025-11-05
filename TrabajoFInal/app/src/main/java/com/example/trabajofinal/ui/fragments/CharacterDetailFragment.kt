package com.example.trabajofinal.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.bumptech.glide.Glide
import com.example.trabajofinal.R
import com.example.trabajofinal.data.model.Character
import com.example.trabajofinal.databinding.FragmentCharacterDetailBinding
import com.example.trabajofinal.ui.viewmodel.CharacterViewModel
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class CharacterDetailFragment : Fragment() {

    private var _binding: FragmentCharacterDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()
    private lateinit var character: Character

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCharacterDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Get character from arguments
        character = arguments?.getSerializable(ARG_CHARACTER) as Character

        displayCharacterDetails()
        setupButtons()
    }

    private fun displayCharacterDetails() {
        binding.tvCharacterName.text = character.name
        binding.tvCharacterType.text = character.type

        // Función local para detectar si una cadena parece una URL/imagen
        fun looksLikeUrl(s: String): Boolean {
            if (s.isBlank()) return false
            val lower = s.lowercase()
            val extPattern = ".*\\.(png|jpg|jpeg|gif|webp)".toRegex(RegexOption.IGNORE_CASE)
            return lower.contains("http") || lower.contains("drive.google.com") || lower.contains("docs.google.com") || lower.contains("googleusercontent.com") || extPattern.matches(s)
        }

        // Preferir la URL normalizada desde el backend
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

        binding.tvCharacterRole.text = roleText

        if (candidateImageField.isNotBlank()) {
            Glide.with(this)
                .load(candidateImageField)
                .placeholder(R.drawable.ic_launcher_foreground)
                .error(R.drawable.ic_launcher_foreground)
                .into(binding.ivCharacterImage)
        } else {
            binding.ivCharacterImage.setImageResource(R.drawable.ic_launcher_foreground)
        }
    }

    private fun setupButtons() {
        binding.btnBack.setOnClickListener {
            parentFragmentManager.popBackStack()
        }

        binding.btnDelete.setOnClickListener {
            showDeleteConfirmationDialog()
        }

        binding.btnEdit.setOnClickListener {
            // Navigate to edit fragment
            val editFragment = EditCharacterFragment.newInstance(character)
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, editFragment)
                .addToBackStack(null)
                .commit()
        }
    }

    private fun showDeleteConfirmationDialog() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Eliminar Personaje")
            .setMessage("¿Estás seguro de que deseas eliminar a ${character.name}?")
            .setPositiveButton("Eliminar") { _, _ ->
                viewModel.deleteCharacter(character.id)
                parentFragmentManager.popBackStack()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val ARG_CHARACTER = "character"

        fun newInstance(character: Character): CharacterDetailFragment {
            val fragment = CharacterDetailFragment()
            val args = Bundle()
            args.putSerializable(ARG_CHARACTER, character)
            fragment.arguments = args
            return fragment
        }
    }
}
