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
        // Mostrar nombre del campeón
        binding.tvCharacterName.text = character.name.ifBlank { "Sin nombre" }

        // Mostrar tipo del campeón (Luchador, Mago, Tanque, etc.)
        binding.tvCharacterType.text = character.type.ifBlank { "Tipo desconocido" }

        // Mostrar rol del campeón (Top, Mid, Jungler, ADC, Support)
        binding.tvCharacterRole.text = character.role.ifBlank { "Rol desconocido" }

        // Cargar imagen del campeón
        // Priorizar imagePublicUrl (URL directa) sobre imageUrl
        val imageToLoad = when {
            character.imagePublicUrl.isNotBlank() -> character.imagePublicUrl
            character.imageUrl.isNotBlank() -> character.imageUrl
            else -> ""
        }

        if (imageToLoad.isNotBlank()) {
            Glide.with(this)
                .load(imageToLoad)
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
