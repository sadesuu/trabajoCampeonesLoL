package com.example.trabajofinal.ui.fragments

import android.os.Build
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
import com.example.trabajofinal.util.UrlUtils
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
        character = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arguments?.getSerializable(ARG_CHARACTER, Character::class.java)!!
        } else {
            @Suppress("DEPRECATION")
            arguments?.getSerializable(ARG_CHARACTER) as Character
        }

        displayCharacterDetails()
        setupButtons()
        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.successMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                android.widget.Toast.makeText(requireContext(), it, android.widget.Toast.LENGTH_SHORT).show()
                parentFragmentManager.popBackStack()
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let {
                android.widget.Toast.makeText(requireContext(), it, android.widget.Toast.LENGTH_LONG).show()
            }
        }
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

        val normalized = UrlUtils.toDirectDriveImageUrl(imageToLoad)
        if (imageToLoad != normalized) {
            android.util.Log.d("CharacterDetail", "Normalized URL: '$imageToLoad' -> '$normalized'")
        }

        // Log para debug
        android.util.Log.d("CharacterDetail", "Character: ${character.name}")
        android.util.Log.d("CharacterDetail", "imageUrl: '${character.imageUrl}'")
        android.util.Log.d("CharacterDetail", "imagePublicUrl: '${character.imagePublicUrl}'")
        android.util.Log.d("CharacterDetail", "imageToLoad: '$imageToLoad'")
        android.util.Log.d("CharacterDetail", "imageNormalized: '$normalized'")

        if (normalized?.isNotBlank() == true) {
            Glide.with(this)
                .load(normalized)
                .placeholder(R.drawable.ic_launcher_foreground)
                .error(R.drawable.ic_launcher_foreground)
                .listener(object : com.bumptech.glide.request.RequestListener<android.graphics.drawable.Drawable> {
                    override fun onLoadFailed(
                        e: com.bumptech.glide.load.engine.GlideException?,
                        model: Any?,
                        target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>,
                        isFirstResource: Boolean
                    ): Boolean {
                        android.util.Log.e("CharacterDetail", "Error loading image: $normalized", e)
                        e?.logRootCauses("CharacterDetail")
                        return false
                    }

                    override fun onResourceReady(
                        resource: android.graphics.drawable.Drawable,
                        model: Any,
                        target: com.bumptech.glide.request.target.Target<android.graphics.drawable.Drawable>?,
                        dataSource: com.bumptech.glide.load.DataSource,
                        isFirstResource: Boolean
                    ): Boolean {
                        android.util.Log.d("CharacterDetail", "Image loaded successfully: $normalized")
                        return false
                    }
                })
                .into(binding.ivCharacterImage)
        } else {
            android.util.Log.w("CharacterDetail", "No hay URL de imagen disponible")
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
