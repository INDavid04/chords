/// Move the section to the top
function totop(event) {
    const label = event.currentTarget;
    const section = label.closest('section');
    if (section) {
        const parentContainer = section.parentElement;
        parentContainer.prepend(section);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const addButtons = document.querySelectorAll('.add input[type="checkbox"]');
    
    addButtons.forEach(function(checkbox) {
        checkbox.addEventListener('change', totop);
    });
});

/// Input type search based on find in page CTRL+F shortcut
function searchText() {
    const searchInput = document.getElementById('searchInput');
    const searchText = searchInput.value.trim().toLowerCase();
    const h2Elements = document.querySelectorAll('section h2'); // Select all h2 elements within sections
    
    if (searchText === '') {
        return;
    }
    
    let found = false;
    h2Elements.forEach(function(h2) {
        const text = h2.textContent.trim().toLowerCase();
        if (text.includes(searchText)) {
            found = true;
            const section = h2.closest('section');
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
    });
    /// if (!found) { alert('No results found'); } /// pretty annoying to give an allert at any small letter mistakes
}

/// Remove searched input from search bar on Enter
function clearInput(event) {
    if (event.key === 'Enter') {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = ''; // Clear the value of the input
    }
}
