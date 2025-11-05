package com.example.trabajofinal.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.example.trabajofinal.data.model.Character
import com.example.trabajofinal.databinding.FragmentAddCharacterBinding
import com.example.trabajofinal.ui.viewmodel.CharacterViewModel

class EditCharacterFragment : Fragment() {

    private var _binding: FragmentAddCharacterBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()
    private lateinit var character: Character

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
        character = arguments?.getSerializable(ARG_CHARACTER) as Character

        setupSpinners()
        populateFields()
        setupButtons()
    }

    private fun setupSpinners() {
        // Type spinner
        val types = arrayOf("Knight", "Warrior", "Mage", "Ranger", "Rogue", "Paladin")
        val typeAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, types)
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerType.adapter = typeAdapter

        // Role spinner
        val roles = arrayOf("DPS", "Tank", "Support", "Healer", "Assassin")
        val roleAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, roles)
        roleAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerRole.adapter = roleAdapter
    }

    private fun populateFields() {
        binding.etName.setText(character.name)
        binding.etImageUrl.setText(character.imageUrl)

        // Set spinner selections
        val roles = arrayOf("DPS", "Tank", "Support", "Healer", "Assassin")
        val types = arrayOf("Knight", "Warrior", "Mage", "Ranger", "Rogue", "Paladin")

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
    }

    private fun updateCharacter() {
        val name = binding.etName.text.toString()
        val imageUrl = binding.etImageUrl.text.toString()
        val role = binding.spinnerRole.selectedItem.toString()
        val type = binding.spinnerType.selectedItem.toString()

        if (name.isEmpty() || imageUrl.isEmpty()) {
            Toast.makeText(requireContext(), "Por favor completa todos los campos", Toast.LENGTH_SHORT).show()
            return
        }

        val updatedCharacter = Character(
            id = character.id, // Keep the same ID
            name = name,
            imageUrl = imageUrl,
            race = "",
            role = role,
            type = type,
            faction = "",
            level = 0,
            attack = 0,
            defense = 0,
            speed = 0,
            magic = 0,
            biography = ""
        )

        // Use the updateCharacter function from ViewModel
        viewModel.updateCharacter(updatedCharacter)

        Toast.makeText(requireContext(), "Personaje actualizado exitosamente", Toast.LENGTH_SHORT).show()

        // Navigate back to character list (pop twice to skip detail fragment)
        parentFragmentManager.popBackStack()
        parentFragmentManager.popBackStack()
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

