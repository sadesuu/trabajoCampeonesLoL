package com.example.trabajofinal.ui.fragments

import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.bumptech.glide.Glide
import com.example.trabajofinal.data.model.Character
import com.example.trabajofinal.databinding.FragmentAddCharacterBinding
import com.example.trabajofinal.ui.viewmodel.CharacterViewModel
import android.util.Base64
import java.io.InputStream
import android.graphics.BitmapFactory
import java.io.ByteArrayOutputStream

class EditCharacterFragment : Fragment() {

    private var _binding: FragmentAddCharacterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()
    private lateinit var character: Character

    private var selectedImageBase64: String = ""
    private var selectedImageFileName: String = ""

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { handleImageSelected(it) }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAddCharacterBinding.inflate(inflater, container, false)
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

        setupSpinners()
        populateFields()
        setupButtons()
        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.successMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                // Limpiar el mensaje antes de navegar
                viewModel.clearMessages()
                // Navigate back to character list (pop twice to skip detail fragment)
                parentFragmentManager.popBackStack()
                parentFragmentManager.popBackStack()
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_LONG).show()
                // Limpiar el error después de mostrarlo
                viewModel.clearMessages()
            }
        }
    }

    private fun setupSpinners() {
        // Type spinner
        val types = arrayOf("Luchador", "Mago", "Tanque", "Asesino")
        val typeAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, types)
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerType.adapter = typeAdapter

        // Role spinner
        val roles = arrayOf("Top", "Mid", "Jungler", "ADC", "Support")
        val roleAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, roles)
        roleAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerRole.adapter = roleAdapter
    }

    private fun populateFields() {
        binding.etName.setText(character.name)
        binding.etImageUrl.setText(character.imageUrl)
        // preview
        val previewUrl = if (character.imagePublicUrl.isNotBlank()) character.imagePublicUrl else character.imageUrl
        if (previewUrl.isNotBlank()) {
            Glide.with(this).load(previewUrl).into(binding.ivPreview)
        }

        // Set spinner selections
        val types = arrayOf("Luchador", "Mago", "Tanque", "Asesino")
        val roles = arrayOf("Top", "Mid", "Jungler", "ADC", "Support")

        binding.spinnerRole.setSelection(roles.indexOf(character.role).coerceAtLeast(0))
        binding.spinnerType.setSelection(types.indexOf(character.type).coerceAtLeast(0))
    }

    private fun setupButtons() {
        binding.btnCancel.setOnClickListener {
            parentFragmentManager.popBackStack()
        }

        binding.btnSave.setOnClickListener {
            updateCharacter()
        }

        binding.btnSelectImage.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }
    }

    private fun handleImageSelected(uri: Uri) {
        Glide.with(this).load(uri).into(binding.ivPreview)
        selectedImageFileName = queryDisplayName(uri) ?: "imagen_${System.currentTimeMillis()}.jpg"
        selectedImageBase64 = readImageAsBase64(uri) ?: ""
        if (selectedImageBase64.isNotEmpty()) {
            Toast.makeText(requireContext(), "Imagen preparada para subir", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(requireContext(), "No se pudo leer la imagen", Toast.LENGTH_SHORT).show()
        }
    }

    private fun queryDisplayName(uri: Uri): String? {
        return try {
            val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1 && it.moveToFirst()) it.getString(nameIndex) else null
            }
        } catch (_: Exception) { null }
    }

    private fun readImageAsBase64(uri: Uri): String? {
        return try {
            val input: InputStream? = requireContext().contentResolver.openInputStream(uri)
            input.use { ins ->
                if (ins == null) return null
                val bytes = ins.readBytes()
                val MAX_SIZE = 1_500_000
                if (bytes.size > MAX_SIZE) {
                    val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    val out = ByteArrayOutputStream()
                    bmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, out)
                    Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
                } else {
                    Base64.encodeToString(bytes, Base64.NO_WRAP)
                }
            }
        } catch (_: Exception) { null }
    }

    private fun updateCharacter() {
        val name = binding.etName.text.toString()
        val imageUrl = binding.etImageUrl.text.toString()
        val role = binding.spinnerRole.selectedItem.toString()
        val type = binding.spinnerType.selectedItem.toString()

        if (name.isEmpty()) {
            Toast.makeText(requireContext(), "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
            return
        }

        val updatedCharacter = Character(
            timestamp = character.timestamp,
            name = name,
            imageUrl = imageUrl,
            imagePublicUrl = character.imagePublicUrl,
            type = type,
            role = role,
            imageBase64 = selectedImageBase64,
            imageFileName = if (selectedImageFileName.isNotBlank()) selectedImageFileName else "${name.replace(' ', '_')}.jpg",
            originalName = character.name // <- clave para localizar fila si el nombre cambió
        )

        // Use the updateCharacter function from ViewModel
        viewModel.updateCharacter(updatedCharacter)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val ARG_CHARACTER = "character"

        fun newInstance(character: Character): EditCharacterFragment {
            val fragment = EditCharacterFragment()
            val args = Bundle()
            args.putSerializable(ARG_CHARACTER, character)
            fragment.arguments = args
            return fragment
        }
    }
}
