document.addEventListener('DOMContentLoaded', () => {
    // Set the default departure time to the current time
    const departureInput = document.getElementById('starting-point-departure');
    if (departureInput) {
        const now = new Date();
        const formattedDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        departureInput.value = formattedDateTime;
    }

    // Attach event listener to all "Add via" buttons
    document.querySelectorAll('.add-via').forEach(button => {
        button.addEventListener('click', handleAddVia);
    });

    // Attach event listener to all "Add stop" buttons
    document.querySelectorAll('.add-stop').forEach(button => {
        button.addEventListener('click', handleAddStop);
    });

    // Attach event listeners to all existing location-input fields
    document.querySelectorAll('.location-input').forEach(input => {
        input.addEventListener('input', handleLocationInput);
    });
});

let stopCounter = 1; // To track the number of stops dynamically

// Function to handle the "Add via" click event
function handleAddVia(event) {
    // Find the nearest inbetween-stops-container for this button
    const inbetweenStopsContainer = event.target.closest('.inbetween-stops-container');
    if (!inbetweenStopsContainer) return; // Safety check

    // Find the vias-container within this inbetween-stops-container
    const viasContainer = inbetweenStopsContainer.querySelector('.vias-container');
    if (!viasContainer) return; // Safety check

    // Create a new via element
    const viaElement = document.createElement('div');
    viaElement.classList.add('via');

    // Add input field for via location
    const viaInput = document.createElement('input');
    viaInput.type = 'text';
    viaInput.classList.add('via-location', 'location-input');
    viaInput.placeholder = 'Enter via location';
    viaInput.addEventListener('input', handleLocationInput);

    // Add remove button for the via
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-via');
    removeButton.textContent = 'Remove';

    // Attach event listener to the remove button
    removeButton.addEventListener('click', () => {
        viaElement.remove(); // Remove the via element from the DOM
    });

    // Append input and remove button to the via element
    viaElement.appendChild(viaInput);
    viaElement.appendChild(removeButton);

    // Append the via element to the vias-container
    viasContainer.appendChild(viaElement);
}

// Function to handle the "Add stop" click event
function handleAddStop(event) {
    // Find the nearest inbetween-stops-container for this button
    const currentInbetweenStopsContainer = event.target.closest('.inbetween-stops-container');
    if (!currentInbetweenStopsContainer) return; // Safety check

    // Create a new stop-container
    const stopContainer = createStopContainer();

    // Create a new inbetween-stops-container
    const newInbetweenStopsContainer = createInbetweenStopsContainer();

    // Insert the new stop-container and the new inbetween-stops-container after the current inbetween-stops-container
    currentInbetweenStopsContainer.insertAdjacentElement('afterend', stopContainer);
    stopContainer.insertAdjacentElement('afterend', newInbetweenStopsContainer);
}

// Function to create a new stop-container
function createStopContainer() {
    // Create the main stop container
    const stopContainer = document.createElement('div');
    stopContainer.classList.add('stop-container');

    // Create the title container
    const titleContainer = document.createElement('div');
    titleContainer.classList.add('title-container');

    // Add the stop title and remove button
    const stopTitle = document.createElement('h2');
    stopTitle.textContent = `Stop ${stopCounter++}`; // Dynamically set the stop number
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-stop');
    removeButton.textContent = 'Remove';

    // Attach event listener to the remove button
    removeButton.addEventListener('click', () => {
        stopContainer.nextElementSibling.remove(); // Remove the associated inbetween-stops-container
        stopContainer.remove(); // Remove the stop-container itself
        renumberStops(); // Renumber remaining stops
    });

    // Append title and button to the title container
    titleContainer.appendChild(stopTitle);
    titleContainer.appendChild(removeButton);

    // Create the input container
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // Add the location input
    const locationInputContainer = document.createElement('div');
    locationInputContainer.classList.add('location-input-container');
    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.classList.add('stop-location', 'location-input');
    locationInput.placeholder = 'Enter stop location';
    locationInput.addEventListener('input', handleLocationInput);
    locationInputContainer.appendChild(locationInput);

    // Add the duration input
    const durationInputContainer = document.createElement('div');
    durationInputContainer.classList.add('duration-input-container');
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.classList.add('stop-duration');
    durationInput.placeholder = 'Min stay (minutes)';
    durationInputContainer.appendChild(durationInput);

    // Append inputs to the input container
    inputContainer.appendChild(locationInputContainer);
    inputContainer.appendChild(durationInputContainer);

    // Append the title container and input container to the stop container
    stopContainer.appendChild(titleContainer);
    stopContainer.appendChild(inputContainer);

    return stopContainer;
}

// Function to create a new inbetween-stops-container
function createInbetweenStopsContainer() {
    // Create the main inbetween-stops-container
    const inbetweenStopsContainer = document.createElement('div');
    inbetweenStopsContainer.classList.add('inbetween-stops-container');

    // Create the vias container
    const viasContainer = document.createElement('div');
    viasContainer.classList.add('vias-container');

    // Create the add buttons container
    const addContainer = document.createElement('div');
    addContainer.classList.add('add-container');

    // Add "Add via" and "Add stop" buttons
    const addViaButton = document.createElement('button');
    addViaButton.classList.add('add-via');
    addViaButton.textContent = '+ Add via';
    addViaButton.addEventListener('click', handleAddVia); // Attach event listener for "Add via"

    const addStopButton = document.createElement('button');
    addStopButton.classList.add('add-stop');
    addStopButton.textContent = '+ Add stop';
    addStopButton.addEventListener('click', handleAddStop); // Attach event listener for "Add stop"

    // Append buttons to the add container
    addContainer.appendChild(addViaButton);
    addContainer.appendChild(addStopButton);

    // Append vias container and add container to the inbetween-stops-container
    inbetweenStopsContainer.appendChild(viasContainer);
    inbetweenStopsContainer.appendChild(addContainer);

    return inbetweenStopsContainer;
}

// Function to renumber stops after a stop is removed
function renumberStops() {
    const stopContainers = document.querySelectorAll('.stop-container');
    stopCounter = 1; // Reset the counter
    stopContainers.forEach(stopContainer => {
        const title = stopContainer.querySelector('h2');
        title.textContent = `Stop ${stopCounter++}`; // Update the stop number
    });
}








// Function to handle the "input" event for location inputs
function handleLocationInput(event) {
    const inputField = event.target;
    const query = inputField.value.trim();

    // If the input is empty, clear suggestions
    if (!query) {
        clearSuggestions(inputField);
        return;
    }

    // Call the API to fetch suggestions
    fetchSuggestions(query)
        .then(suggestions => {
            displaySuggestions(inputField, suggestions);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            clearSuggestions(inputField); // Clear suggestions on error
        });
}

// Function to fetch suggestions from the API
async function fetchSuggestions(query) {
    const response = await fetch(`/etl/transform_opentransportAPI.php?action=fetchStations&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
    }
    const data = await response.json();
    return data.stations || []; // Return an empty array if no stations found
}

// Function to display suggestions in a dropdown
function displaySuggestions(inputField, suggestions) {
    // Clear existing suggestions
    clearSuggestions(inputField);

    // Create a dropdown for suggestions
    const dropdown = document.createElement('div');
    dropdown.classList.add('suggestions-dropdown');

    // Populate the dropdown with suggestion items
    suggestions.forEach(station => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = station.name;

        // Handle click on a suggestion
        suggestionItem.addEventListener('click', () => {
            inputField.value = station.name; // Set the input value to the selected station
            clearSuggestions(inputField); // Clear the suggestions dropdown
        });

        dropdown.appendChild(suggestionItem);
    });

    // Append the dropdown below the input field
    inputField.parentNode.appendChild(dropdown);
}

// Function to clear suggestions
function clearSuggestions(inputField) {
    const dropdown = inputField.parentNode.querySelector('.suggestions-dropdown');
    if (dropdown) {
        dropdown.remove();
    }
}