package com.example.trabajofinal.ui.fragments

import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
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
import java.io.ByteArrayOutputStream
import java.io.InputStream
import android.util.Base64

class AddCharacterFragment : Fragment() {

    private var _binding: FragmentAddCharacterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()

    // Estado de la imagen seleccionada
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

        setupSpinners()
        setupButtons()
        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.successMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                // Limpiar el mensaje antes de navegar para evitar que se muestre de nuevo
                viewModel.clearMessages()
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

    private fun setupButtons() {
        binding.btnCancel.setOnClickListener {
            parentFragmentManager.popBackStack()
        }

        binding.btnSave.setOnClickListener {
            saveCharacter()
        }

        binding.btnSelectImage.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }
    }

    private fun handleImageSelected(uri: Uri) {
        // Mostrar preview
        Glide.with(this)
            .load(uri)
            .into(binding.ivPreview)

        // Determinar nombre del archivo
        selectedImageFileName = queryDisplayName(uri) ?: "imagen_${System.currentTimeMillis()}.jpg"

        // Leer y comprimir a un tamaño razonable
        val base64 = readImageAsBase64(uri)
        if (base64 != null) {
            selectedImageBase64 = base64
            Toast.makeText(requireContext(), "Imagen preparada para subir", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(requireContext(), "No se pudo leer la imagen", Toast.LENGTH_SHORT).show()
        }
    }

    private fun queryDisplayName(uri: Uri): String? {
        return try {
            val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                val nameIndex = it.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1 && it.moveToFirst()) {
                    it.getString(nameIndex)
                } else null
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun readImageAsBase64(uri: Uri): String? {
        return try {
            val input: InputStream? = requireContext().contentResolver.openInputStream(uri)
            input.use { ins ->
                if (ins == null) return null
                // Opcional: decodificar y recomprimir para no exceder tamaño (p.e., máx ~1.5MB)
                val bytes = ins.readBytes()
                // Si el archivo es muy grande, recomprimir a JPEG
                val MAX_SIZE = 1_500_000 // ~1.5MB
                if (bytes.size > MAX_SIZE) {
                    val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    val out = ByteArrayOutputStream()
                    // calidad 80 para reducir tamaño
                    bmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, out)
                    val reduced = out.toByteArray()
                    Base64.encodeToString(reduced, Base64.NO_WRAP)
                } else {
                    Base64.encodeToString(bytes, Base64.NO_WRAP)
                }
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun saveCharacter() {
        val name = binding.etName.text.toString().trim()
        val type = binding.spinnerType.selectedItem.toString()
        val role = binding.spinnerRole.selectedItem.toString()
        val imageUrlTyped = binding.etImageUrl.text.toString().trim()

        if (name.isEmpty()) {
            Toast.makeText(requireContext(), "El nombre es obligatorio", Toast.LENGTH_SHORT).show()
            return
        }

        // Si no hay imagen seleccionada por archivo ni URL, avisar
        if (selectedImageBase64.isEmpty() && imageUrlTyped.isEmpty()) {
            Toast.makeText(requireContext(), "Sube una imagen o pega una URL", Toast.LENGTH_SHORT).show()
            return
        }

        val character = Character(
            timestamp = "",
            name = name,
            imageUrl = imageUrlTyped, // si viene vacío, el backend usará la subida base64
            imagePublicUrl = "",
            type = type,
            role = role,
            imageBase64 = selectedImageBase64,
            imageFileName = if (selectedImageFileName.isNotBlank()) selectedImageFileName else "${name.replace(' ', '_')}.jpg"
        )

        viewModel.addCharacter(character)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
