package com.example.trabajofinal.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import com.bumptech.glide.Glide
import com.example.trabajofinal.R
import com.example.trabajofinal.databinding.FragmentCharacterDetailBinding
import com.example.trabajofinal.ui.viewmodel.CharacterViewModel
import com.example.trabajofinal.util.UrlUtils
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class CharacterDetailFragment : Fragment() {

    private var _binding: FragmentCharacterDetailBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()
    private val args: CharacterDetailFragmentArgs by navArgs()

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
        binding.tvCharacterName.text = args.characterName.ifBlank { "Sin nombre" }

        // Mostrar tipo del campeón (Luchador, Mago, Tanque, etc.)
        binding.tvCharacterType.text = args.characterType.ifBlank { "Tipo desconocido" }

        // Mostrar rol del campeón (Top, Mid, Jungler, ADC, Support)
        binding.tvCharacterRole.text = args.characterRole.ifBlank { "Rol desconocido" }

        // Cargar imagen del campeón
        val imageToLoad = args.characterImageUrl
        val normalized = UrlUtils.toDirectDriveImageUrl(imageToLoad)

        if (imageToLoad != normalized) {
            android.util.Log.d("CharacterDetail", "Normalized URL: '$imageToLoad' -> '$normalized'")
        }

        // Log para debug
        android.util.Log.d("CharacterDetail", "Character: ${args.characterName}")
        android.util.Log.d("CharacterDetail", "imageUrl: '${args.characterImageUrl}'")
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
            findNavController().navigateUp()
        }

        binding.btnDelete.setOnClickListener {
            showDeleteConfirmationDialog()
        }

        binding.btnEdit.setOnClickListener {
            // Navigate to edit fragment using Navigation Component
            val action = CharacterDetailFragmentDirections
                .actionCharacterDetailFragmentToEditCharacterFragment(
                    characterTimestamp = args.characterTimestamp,
                    characterName = args.characterName,
                    characterRole = args.characterRole,
                    characterType = args.characterType,
                    characterImageUrl = args.characterImageUrl
                )
            findNavController().navigate(action)
        }
    }

    private fun showDeleteConfirmationDialog() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Eliminar Personaje")
            .setMessage("¿Estás seguro de que deseas eliminar a ${args.characterName}?")
            .setPositiveButton("Eliminar") { _, _ ->
                viewModel.deleteCharacter(args.characterName)
                // Quitar navigateUp inmediato; el observer de successMessage hará el pop
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
