// adding events listeners when loading the page

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            openTab(tabName);
        });
    });

    // Add event listeners to input fields
    const fromInput = document.querySelector('#from');
    const fromSuggestions = document.querySelector('#fromSuggestions');

    const toInput = document.querySelector('#to');
    const toSuggestions = document.querySelector('#toSuggestions');

    fromInput.addEventListener('input', event => handleStationInput(event, fromSuggestions));
    toInput.addEventListener('input', event => handleStationInput(event, toSuggestions));

    // Set default values for date and time fields
    const dateInput = document.querySelector('#date');
    const timeInput = document.querySelector('#time');

    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0]; // Sets default date in YYYY-MM-DD

    const hours = String(now.getHours()).padStart(2, '0'); // Ensures two digits
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Ensures two digits
    timeInput.value = `${hours}:${minutes}`; // Format: HH:MM

    // Add event listener to the search button
    const searchButton = document.querySelector('#searchButton');
    searchButton.addEventListener('click', searchConnections);

});



// helping functions for displaying content

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

function formatDateForDisplay(isoDate) {
    console.log('Formatting date:', isoDate);
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
}

function formatTime(isoDateTime) {
    if (!isoDateTime) return 'Unknown';
    const date = new Date(isoDateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(duration) {
    const match = /(\d{2})d(\d{2}):(\d{2}):(\d{2})/.exec(duration);
    if (match) {
        const [, days, hours, minutes] = match;
        const totalHours = parseInt(days) * 24 + parseInt(hours);
        return `${totalHours}h ${minutes}min`;
    }
    return 'Unknown';
}





// functions when input is changed

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





// functions when search is started

function searchConnections() {
    const from = document.querySelector('#from').value;
    const to = document.querySelector('#to').value;
    const date = document.querySelector('#date').value;
    const time = document.querySelector('#time').value;

    const resultsContainer = document.querySelector('#results');
    resultsContainer.style.display = 'none'; // Hide results while fetching

    fetch(`/etl/transform_opentransportAPI.php?action=fetchConnections&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`)
        .then(response => response.json())
        .then(data => {
            console.log('Connections:', data);
            displayConnections(data); // Pass data to rendering function

            // Show results after fetching
            resultsContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching connections:', error);
            resultsContainer.style.display = 'none'; // Hide results on error
        });
}

function displayConnections(data) {
    const resultsContainer = document.querySelector('#results');
    resultsContainer.innerHTML = ''; // Clear any previous results

    const titleElement = document.querySelector('h2'); // Select the main title element
    titleElement.textContent = 'Connections'; // Change the title to "Connections"

    if (data.connections && data.connections.length > 0) {
        data.connections.forEach((connection) => {
            const connectionContainer = document.createElement('div');
            connectionContainer.classList.add('connection');

            // Analyze the sections to extract walk and journey details
            const { walkBefore, walkAfter, firstJourneySection } = analyzeSections(connection.sections);

            // Extract details from the first journey section
            const journeyDirection = firstJourneySection?.journey?.to || 'Unknown'; // Get the direction from the first valid journey
            const firstLine = `${firstJourneySection?.journey?.category || 'Unknown'} ${firstJourneySection?.journey?.number || ''}`.trim(); // Combine category and number

            // Departure and arrival times from the first journey section
            const departureTime = firstJourneySection?.departure?.departure || 'Unknown';
            const arrivalTime = firstJourneySection?.arrival?.arrival || 'Unknown';

            // Platform from the first journey section
            const platform = firstJourneySection?.departure?.platform || 'Unknown';

            // Display the line and direction
            const lineDirection = document.createElement('p');
            lineDirection.textContent = `Line: ${firstLine}, Direction: ${journeyDirection}`;
            connectionContainer.appendChild(lineDirection);

            // Display departure and arrival times with walking durations
            const departureArrival = document.createElement('p');
            let departureArrivalText = '';

            // Add walk before if it exists
            if (walkBefore) {
                departureArrivalText += `Walk: ${walkBefore}, `;
            }

            // Add departure and arrival times
            departureArrivalText += `Departure Time: ${formatTime(departureTime)}, Arrival Time: ${formatTime(arrivalTime)}`;

            // Add walk after if it exists
            if (walkAfter) {
                departureArrivalText += `, Walk: ${walkAfter}`;
            }

            departureArrival.textContent = departureArrivalText;
            connectionContainer.appendChild(departureArrival);

            // Display platform and duration
            const platformDuration = document.createElement('p');
            const duration = connection.duration || 'Unknown';
            platformDuration.textContent = `Platform: ${platform}, Duration: ${formatDuration(duration)}`;
            connectionContainer.appendChild(platformDuration);

            // Add click listener to show connection details
            connectionContainer.addEventListener('click', () => {
                showConnectionDetails(connection); // Render details when clicked
            });

            resultsContainer.appendChild(connectionContainer);
        });
    } else {
        resultsContainer.innerHTML += `<p>No connections found.</p>`;
    }
}




// helper functions with walks (duration, check if walks exist at departure/arrival location)
function analyzeSections(sections) {
    let walkBefore = null;
    let walkAfter = null;
    let firstJourneySection = null;

    let foundJourney = false;

    sections.forEach((section) => {
        if (section.walk && !foundJourney) {
            // This walk is before the first journey
            walkBefore = calculateWalkDuration(section);
        } else if (section.journey && !foundJourney) {
            // First journey section
            firstJourneySection = section;
            foundJourney = true;
        } else if (section.walk && foundJourney) {
            // This walk is after the last journey
            walkAfter = calculateWalkDuration(section);
        }
    });

    return {
        walkBefore,
        walkAfter,
        firstJourneySection
    };
}


function calculateWalkDuration(section) {
    if (section.walk) {
        const duration = section.walk.duration;

        // Check for explicitly missing or negligible duration
        if (duration === null || duration === 0) {
            const departureTimestamp = section.departure?.departureTimestamp;
            const arrivalTimestamp = section.arrival?.arrivalTimestamp;

            if (departureTimestamp && arrivalTimestamp) {
                const durationInSeconds = arrivalTimestamp - departureTimestamp;
                const durationInMinutes = Math.round(durationInSeconds / 60);
                return `${durationInMinutes} min`;
            } else {
                return 'Unknown duration'; // Fallback if timestamps are missing
            }
        }

        // If a valid duration is provided, convert it to minutes
        const durationInMinutes = Math.round(duration / 60);
        return `${durationInMinutes} min`;
    }

    return 'Unknown duration'; // Fallback for non-walk sections
}








// functions when connection is clicked

function showConnectionDetails(connection) {
    const connectionDetailsContainer = document.querySelector('#connectionDetails');
    const searchContainer = document.querySelector('.search-container'); // Assuming the search bar is in this container

    connectionDetailsContainer.innerHTML = ''; // Clear previous details

    const titleElement = document.querySelector('h2'); // Select the main title element
    titleElement.textContent = 'Connection'; // Change the title to "Connection"

    // Hide the search bar and results
    searchContainer.style.display = 'none';
    document.querySelector('#results').style.display = 'none';

    // Add a "Back" button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.addEventListener('click', showSearchScreen); // Attach event listener to navigate back
    connectionDetailsContainer.appendChild(backButton);

    // Overview
    const overview = document.createElement('div');
    overview.innerHTML = `
        <p>${connection.from.station.name} → ${connection.to.station.name}</p>
        <p>Date: ${formatDateForDisplay(connection.from.departure.split('T')[0])}</p>
        <p>Duration: ${formatDuration(connection.duration)}</p>
        <p>${formatTime(connection.from.departure)} → ${formatTime(connection.to.arrival)}</p>
    `;
    connectionDetailsContainer.appendChild(overview);

    // Buttons
    const buttons = document.createElement('div');
    buttons.innerHTML = `
        <button id="addJourney">Add Journey</button>
        <button id="removeJourney" style="display: none;">Remove Journey</button>
        <button id="shareJourney" disabled>Share Journey</button>
    `;
    connectionDetailsContainer.appendChild(buttons);

    // Sections for journey details
    connection.sections.forEach((section, index) => {
        const sectionContainer = document.createElement('div');
        sectionContainer.classList.add('section');

        if (section.walk) {
            const walkDuration = calculateWalkDuration(section); // Use the new function
            sectionContainer.innerHTML = `
                <h4>Walk</h4>
                <p>Duration: ${walkDuration}</p>
                <p>From: ${section.departure.station.name}</p>
                <p>To: ${section.arrival.station.name}</p>
            `;
        }
         else if (section.journey) {
            // Journey Section
            const departure = section.departure;
            const arrival = section.arrival;
            const journey = section.journey;

            sectionContainer.innerHTML = `
                <h4>Section ${index + 1}</h4>
                <p>${formatTime(departure.departure)}: ${departure.station.name} (Platform: ${departure.platform || 'Unknown'})</p>
                <p>Line: ${journey.category || 'Unknown'} ${journey.number || ''}</p>
                <p>Direction: ${journey.to || 'Unknown'}</p>
                <p>${formatTime(arrival.arrival)}: ${arrival.station.name} (Platform: ${arrival.platform || 'Unknown'})</p>
                <button class="adjustTime">Adjust Time</button>
                <button class="splitJourney">Split</button>
                <button class="addStop">Add Stop</button>
            `;
        } else {
            // Fallback for unexpected section type
            sectionContainer.innerHTML = `
                <p>Unknown section type.</p>
            `;
        }

        connectionDetailsContainer.appendChild(sectionContainer);
    });

    // Show the connection details container
    connectionDetailsContainer.style.display = 'block';
}







// functions when going back to search
function showSearchScreen() {
    const searchContainer = document.querySelector('.search-container');
    const resultsContainer = document.querySelector('#results');
    const connectionDetailsContainer = document.querySelector('#connectionDetails');

    // Restore visibility of search bar and results
    searchContainer.style.display = 'block';
    resultsContainer.style.display = 'block';

    // Hide connection details
    connectionDetailsContainer.style.display = 'none';

    // Reset title
    const titleElement = document.querySelector('h2');
    titleElement.textContent = 'Connections';
}

function showSearchBar() {
    const searchContainer = document.querySelector('.search-container');
    const connectionDetailsContainer = document.querySelector('#connectionDetails');

    // Show the search bar
    searchContainer.style.display = 'block';

    // Hide the connection details
    connectionDetailsContainer.style.display = 'none';
}
