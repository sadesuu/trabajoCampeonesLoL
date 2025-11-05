package com.example.trabajofinal.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.SearchView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.GridLayoutManager
import com.example.trabajofinal.R
import com.example.trabajofinal.databinding.FragmentCharacterListBinding
import com.example.trabajofinal.ui.adapter.CharacterAdapter
import com.example.trabajofinal.ui.viewmodel.CharacterViewModel
import com.google.android.material.bottomsheet.BottomSheetDialog

class CharacterListFragment : Fragment() {

    private var _binding: FragmentCharacterListBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CharacterViewModel by activityViewModels()
    private lateinit var adapter: CharacterAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCharacterListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRecyclerView()
        setupSearchView()
        setupFilterButton()
        setupFab()
        observeViewModel()

        // Load characters
        viewModel.loadCharacters()
    }

    private fun setupRecyclerView() {
        adapter = CharacterAdapter { character ->
            // Navigate to detail fragment
            val detailFragment = CharacterDetailFragment.newInstance(character)
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, detailFragment)
                .addToBackStack(null)
                .commit()
        }

        binding.recyclerViewCharacters.layoutManager = GridLayoutManager(requireContext(), 2)
        binding.recyclerViewCharacters.adapter = adapter
    }

    private fun setupSearchView() {
        binding.searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                return false
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                viewModel.searchCharacters(newText ?: "")
                return true
            }
        })
    }

    private fun setupFilterButton() {
        binding.btnFilter.setOnClickListener {
            showFilterDialog()
        }
    }

    private fun setupFab() {
        binding.fabAddCharacter.setOnClickListener {
            // Navigate to add character fragment
            val addFragment = AddCharacterFragment()
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, addFragment)
                .addToBackStack(null)
                .commit()
        }
    }

    private fun showFilterDialog() {
        val dialog = BottomSheetDialog(requireContext())
        val view = layoutInflater.inflate(R.layout.bottom_sheet_filter, null)

        view.findViewById<View>(R.id.btnSortAlphabetically).setOnClickListener {
            viewModel.sortAlphabetically()
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnFilterTop).setOnClickListener {
            viewModel.filterByRole("Top")
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnFilterMid).setOnClickListener {
            viewModel.filterByRole("Mid")
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnFilterJungler).setOnClickListener {
            viewModel.filterByRole("Jungler")
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnFilterADC).setOnClickListener {
            viewModel.filterByRole("ADC")
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnFilterSupport).setOnClickListener {
            viewModel.filterByRole("Support")
            dialog.dismiss()
        }

        view.findViewById<View>(R.id.btnShowAll).setOnClickListener {
            viewModel.filterByRole("Todos")
            dialog.dismiss()
        }

        dialog.setContentView(view)
        dialog.show()
    }

    private fun observeViewModel() {
        viewModel.filteredCharacters.observe(viewLifecycleOwner) { characters ->
            adapter.submitList(characters)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
