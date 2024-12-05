document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openTab(tabName);
        });
    });

    // Add event listener to the search button
    const searchButton = document.querySelector('#searchButton');
    searchButton.addEventListener('click', searchConnections);

    // Add event listeners to input fields
    const fromInput = document.querySelector('#from');
    const fromSuggestions = document.querySelector('#fromSuggestions');

    const toInput = document.querySelector('#to');
    const toSuggestions = document.querySelector('#toSuggestions');

    fromInput.addEventListener('input', event => handleStationInput(event, fromSuggestions));
    toInput.addEventListener('input', event => handleStationInput(event, toSuggestions));
});

function openTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Reset all tab buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Activate the selected tab and button
    document.querySelector(`#${tabName}`).classList.add('active');
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    activeButton.classList.add('active');
}

function handleStationInput(event, suggestionBox) {
    const query = event.target.value.trim();

    console.log('Input changed:', query);

    // If the input is empty, hide suggestions
    if (!query) {
        suggestionBox.style.display = 'none';
        return;
    }

    // Call fetchStations endpoint
    fetch(`/etl/transform_opentransportAPI.php?action=fetchStations&query=${encodeURIComponent(query)}`)
    .then(response => {
        console.log('Raw response:', response); // Logs the fetch response object
        return response.json(); // Parses the JSON response
    })
    .then(data => {
        console.log('Parsed response data:', data); // Ensure data is logged
    
        // Access the stations array and check its length
        const stations = data.stations || []; // Default to an empty array if undefined
        if (stations.length > 0) {
            displayStationSuggestions(suggestionBox, stations, event.target);
            console.log('DISPLAY SUGGESTIONS TRIGGERED'); // This should now appear
        } else {
            console.log('Stations array is empty or missing.');
            suggestionBox.style.display = 'none';
        }
    })    
    .catch(error => {
        console.error('Error fetching stations:', error);
        suggestionBox.style.display = 'none';
    });

}

function displayStationSuggestions(suggestionBox, stations, inputElement) {
    // Clear any existing suggestions
    suggestionBox.innerHTML = '';

    console.log('Displaying suggestions:', stations);

    // Populate suggestions
    stations.forEach(station => {
        // Create a new suggestion item
        const item = document.createElement('div');
        item.textContent = station.name; // Assuming station has a "name" property
        item.classList.add('dropdown-item');

        // Add click listener to select station
        item.addEventListener('click', () => {
            inputElement.value = station.name; // Set input value to selected station
            suggestionBox.style.display = 'none'; // Hide suggestions
        });

        suggestionBox.appendChild(item);
    });

    // Show the suggestion box if stations exist
    if (stations.length > 0) {
        suggestionBox.style.display = 'block';
    } else {
        suggestionBox.style.display = 'none';
    }
}


function searchConnections() {
    // Get user input
    const from = document.querySelector('#from').value;
    const to = document.querySelector('#to').value;

    // Display placeholder results
    const resultsContainer = document.querySelector('#results');
    resultsContainer.innerHTML = `<p>Searching for connections from ${from} to ${to}...</p>`;

    // TODO: Add logic to fetch and display results
}
