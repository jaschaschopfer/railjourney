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

    // Attach event listener to the "Plan journey" button
    document.querySelector('#plan-journey-button').addEventListener('click', planEntireJourney);
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

    const existingVias = viasContainer.querySelectorAll('.via');
    if (existingVias.length >= 5) {
        alert("You can only add up to 5 vias per section."); // Notify the user
        return; // Prevent adding more vias
    }

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



// functions for sending the inputs and getting the results



// TEMPORARY FUNCTION FOR TESTING
document.addEventListener('DOMContentLoaded', () => {
    populateFieldsWithSimulatedUserInput();
});

function populateFieldsWithSimulatedUserInput() {
    // Set Starting Point
    const startingPointInput = document.getElementById('starting-point-location');
    if (startingPointInput) {
        startingPointInput.value = 'Bern';
    }

    const startingPointDeparture = document.getElementById('starting-point-departure');
    if (startingPointDeparture) {
        const departureDate = new Date(2024, 11, 21, 11, 58); // Year is 2024, month is 0-indexed
        const formattedDateTime = departureDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
        startingPointDeparture.value = formattedDateTime;
    }

    // Simulate Adding Stop 1
    const addStopButton = document.querySelector('.add-stop');
    if (addStopButton) {
        // Simulate a user clicking the "+ Add stop" button
        addStopButton.click();

        // add delay to allow the stop to be added
        setTimeout(() => {
            // Find the newly added stop and set values
            const lastStopContainer = document.querySelector('.stop-container');
            if (lastStopContainer) {
                const stopLocationInput = lastStopContainer.querySelector('.stop-location');
                if (stopLocationInput) stopLocationInput.value = 'Worb Dorf';

                const stopDurationInput = lastStopContainer.querySelector('.stop-duration');
                if (stopDurationInput) stopDurationInput.value = 10;
            }
        }, 1000);
    }

    // Simulate Adding Via
    const addViaButton = document.querySelector('.add-via');
    if (addViaButton) {
        // Simulate a user clicking the "+ Add via" button
        addViaButton.click();

        // Find the newly added via and set values
        const lastViaInput = document.querySelector('.vias-container .via-location:last-of-type');
        if (lastViaInput) {
            lastViaInput.value = 'Bern, Egghölzli';
        }
    }

    // Set Destination
    const destinationInput = document.getElementById('destination-location');
    if (destinationInput) {
        destinationInput.value = 'Stettlen';
    }

    const destinationArrival = document.getElementById('destination-arrival');
    if (destinationArrival) {
        destinationArrival.placeholder = 'tt.mm.jjjj, --:--';
    }
}



async function planEntireJourney() {
    try {
        // Step 1: Collect input from the user
        const journeyPlan = collectInput();

        // Step 2: Validate the input
        const validationResult = validateInput(journeyPlan);
        if (!validationResult.isValid) {
            console.error("Validation failed:", validationResult.errors);
            alert("Validation errors:\n" + validationResult.errors.join("\n"));
            return;
        }

        // Step 3: Initialize journeyConnections to store all legs of the journey
        const journeyConnections = { legs: [] }; // Proper initialization of 'legs'

        // Step 4: Plan the first connection
        await planFirstConnection(journeyPlan, journeyConnections);
console.log("First connection:", journeyConnections.legs[0]); // Debug log

        // Step 5: Handle subsequent stops
        for (let i = 1; i < journeyPlan.stops.length; i++) {
            const previousConnection = journeyConnections.legs[journeyConnections.legs.length - 1];
            console.log("Previous Connection:", previousConnection); // Debug log
            const currentStop = journeyPlan.stops[i];
            const stayDuration = currentStop.stayDuration;
            const nextStopName = i + 1 < journeyPlan.stops.length ? journeyPlan.stops[i + 1].name : null;

            // Plan the next connection for the current stop
            await planNextConnection(
                previousConnection,
                stayDuration,
                nextStopName,
                journeyPlan.destination.name,
                journeyConnections,
                currentStop.vias
            );
        }

        // Step 6: Handle the final leg from the last stop to the destination
        if (journeyPlan.stops.length > 0) {
            const previousConnection = journeyConnections.legs[journeyConnections.legs.length - 1];
            const finalStop = journeyPlan.stops[journeyPlan.stops.length - 1];
            await planNextConnection(
                previousConnection,
                finalStop.stayDuration,
                null, // No next stop; go directly to destination
                journeyPlan.destination.name,
                journeyConnections,
                [] // No vias for the final leg
            );
        }

        // Step 7: Extract general journey data
        addGeneralJourneyData(journeyConnections);

        // Step 8: Display the results
        displayResults(journeyConnections);

    } catch (error) {
        console.error("Error planning the journey:", error);
        alert("An error occurred while planning the journey. Please try again.");
    }
}

async function planNextConnection(previousConnection, stayDuration, nextStopName, destinationName, journeyConnections, via = []) {
    try {
        console.log("Previous Connection:", previousConnection);
console.log("Previous Connection 'to':", previousConnection?.to);

        // Validate the structure of previousConnection and its 'to' property
        if (!previousConnection || !previousConnection.to) {
            throw new Error("Invalid previous connection: 'to' property is missing.");
        }

        // Step 1: Get the previous connection's arrival time
        const previousArrivalTimeISO = previousConnection.to.arrivalTimestamp;
        if (!previousArrivalTimeISO) {
            throw new Error("Arrival time is missing in the previous connection.");
        }

        // Step 2: Calculate the next departure time
        const departureTime = calculateNextDepartureTime(previousArrivalTimeISO, stayDuration);
        console.log("Next Departure Time:", departureTime); // Debug log

        // Step 3: Determine the destination for this leg
        const to = nextStopName || destinationName;

        // Step 4: Prepare the query for the next leg
        const queryParams = prepareNextQuery(previousConnection.to.station.name, to, departureTime, via);

        // Step 5: Fetch connections for this leg
        const connections = await fetchConnections(queryParams);

        console.log("Received connections from API:", connections); // Log the connections

        // Step 6: Filter connections by the earliest arrival time
        const bestConnection = filterConnectionsByEarliestArrival(connections);

        // Step 7: Save the best connection for this leg
        saveConnection(bestConnection, journeyConnections);

        console.log("journey connections:", journeyConnections ); // Debug log
    } catch (error) {
        console.error("Error planning the next connection:", error);
        throw error; // Re-throw the error for higher-level handling
    }
}

function collectInput() {
    // Get starting point inputs
    const startingPointName = document.querySelector('#starting-point-location').value.trim();
    const startingDepartureTime = document.querySelector('#starting-point-departure').value.trim();

    // Collect vias for the starting point
    const startingPointVias = [];
    const startingPointViasContainer = document.querySelector('#starting-point-container').nextElementSibling.querySelector('.vias-container');
    startingPointViasContainer.querySelectorAll('.via-location').forEach(viaInput => {
        const viaName = viaInput.value.trim();
        if (viaName) {
            startingPointVias.push(viaName);
        }
    });

    // Collect all stops
    const stops = [];
    document.querySelectorAll('.stop-container').forEach(stopContainer => {
        const stopName = stopContainer.querySelector('.stop-location').value.trim();
        const stayDuration = parseInt(stopContainer.querySelector('.stop-duration').value.trim()) || 0;

        // Collect vias for this stop
        const vias = [];
        const viasContainer = stopContainer.nextElementSibling.querySelector('.vias-container');
        viasContainer.querySelectorAll('.via-location').forEach(viaInput => {
            const viaName = viaInput.value.trim();
            if (viaName) {
                vias.push(viaName);
            }
        });

        // Add stop to the stops array
        stops.push({
            name: stopName,
            stayDuration,
            vias
        });
    });

    // Get destination inputs
    const destinationName = document.querySelector('#destination-location').value.trim();
    const destinationArrivalTime = document.querySelector('#destination-arrival').value.trim();

    // Construct the journeyPlan object
    const journeyPlan = {
        startingPoint: {
            name: startingPointName,
            departureTime: startingDepartureTime,
            vias: startingPointVias
        },
        stops,
        destination: {
            name: destinationName,
            arrivalTime: destinationArrivalTime
        }
    };

    console.log('collected journeyPlan', journeyPlan); // Log the journey plan object

    return journeyPlan;

}

function validateInput(journeyPlan) {
    const errors = [];

    // Validate starting point
    if (!journeyPlan.startingPoint.name) {
        errors.push("Starting point is missing.");
    }

    if (journeyPlan.startingPoint.departureTime && isNaN(Date.parse(journeyPlan.startingPoint.departureTime))) {
        errors.push("Starting point departure time is invalid.");
    }

    // Validate stops
    journeyPlan.stops.forEach((stop, index) => {
        if (!stop.name) {
            errors.push(`Stop ${index + 1} is missing a name.`);
        }

        if (stop.stayDuration <= 0 || isNaN(stop.stayDuration)) {
            errors.push(
                `Stop ${index + 1} has an invalid stay duration. Use "via" for stops without a stay duration.`
            );
        }

        stop.vias.forEach((via, viaIndex) => {
            if (!via) {
                errors.push(`Stop ${index + 1} has an empty via at position ${viaIndex + 1}.`);
            }
        });
    });

    // Validate destination
    if (!journeyPlan.destination.name) {
        errors.push("Destination is missing.");
    }

    if (journeyPlan.destination.arrivalTime && isNaN(Date.parse(journeyPlan.destination.arrivalTime))) {
        errors.push("Destination arrival time is invalid.");
    }

    // Check for mutually exclusive departure and arrival times
    if (journeyPlan.startingPoint.departureTime && journeyPlan.destination.arrivalTime) {
        errors.push("Only one of departure time or arrival time must be provided.");
    }

    if (!journeyPlan.startingPoint.departureTime && !journeyPlan.destination.arrivalTime) {
        errors.push("Either a departure time or an arrival time must be provided.");
    }

    // Return validation results
    return {
        isValid: errors.length === 0,
        errors
    };
}

function prepareFirstQuery(journeyPlan) {
    // Extract starting point details
    const from = journeyPlan.startingPoint.name;
    const departureTime = journeyPlan.startingPoint.departureTime;

    // Determine the first destination
    let to;
    if (journeyPlan.stops.length > 0) {
        to = journeyPlan.stops[0].name;
    } else {
        to = journeyPlan.destination.name;
    }

    // Collect via locations from the starting point
    const via = journeyPlan.startingPoint.vias || [];

    // Construct the query object
    const queryParams = {
        from,
        to,
        departureTime,
        via
    };
    console.log('First query:', queryParams); // Log the query object

    return queryParams;
}

async function planFirstConnection(journeyPlan, journeyConnections) {
    try {
        // Step 1: Prepare the query for the first leg
        const queryParams = prepareFirstQuery(journeyPlan);

        // Step 2: Fetch connections for the first leg
        const connections = await fetchConnections(queryParams);

        if (connections.length === 0) {
            throw new Error("No connections found for the first leg.");
        }

        // Step 3: Select the best connection based on the earliest arrival time
        const bestConnection = filterConnectionsByEarliestArrival(connections);

        // Step 4: Save the chosen connection to journeyConnections
        saveConnection(bestConnection, journeyConnections);
    } catch (error) {
        console.error("Error planning the first connection:", error);
        throw error; // Re-throw the error to be handled by the calling function
    }
}

function calculateNextDepartureTime(previousArrivalISO, stayDuration) {
    console.log("Previous Arrival (UNIX):", previousArrivalISO); // Debug log
    console.log("Stay Duration:", stayDuration); // Debug log

    // Convert previousArrival from seconds to milliseconds ((BECAUSE OF UNIX FORMAT)) and create a Date object
    const previousArrivalTime = new Date(previousArrivalISO * 1000);

    console.log("Previous Arrival Time (Date):", previousArrivalTime.toISOString()); // Debug log

    // Add stayDuration (in minutes) to the arrival time
    const nextDepartureTime = new Date(previousArrivalTime.getTime() + stayDuration * 60000);

    console.log("Next Departure Time:", nextDepartureTime.toISOString()); // Debug log

    // Return the new departure time as an ISO string
    return nextDepartureTime.toISOString();
}


function prepareNextQuery(from, to, departureTime, via = []) {
    // Construct the query object
    const queryParams = {
        from,               // Starting point of the leg
        to,                 // Destination for this leg
        departureTime,      // Time to depart
        via                 // Optional via locations (empty by default)
    };

    return queryParams;
}

async function fetchConnections(queryParams) {
    try {
        const baseUrl = '/etl/transform_opentransportAPI.php?action=fetchConnections';

        // Construct query string from queryParams
        const viaQueryString = queryParams.via
            .map(via => `via[]=${encodeURIComponent(via)}`)
            .join('&');

        const queryString = `from=${encodeURIComponent(queryParams.from)}&to=${encodeURIComponent(queryParams.to)}&departureTime=${encodeURIComponent(queryParams.departureTime)}${viaQueryString ? `&${viaQueryString}` : ''}`;

        const url = `${baseUrl}&${queryString}`;

        console.log("Constructed URL:", url); // Debug log for the URL

        // Fetch the connections from the API
        const response = await fetch(url);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();

        console.log("Fetched connections:", data.connections); // Debug log for the response

        // Return the list of connections
        return data.connections || [];
    } catch (error) {
        console.error("Error fetching connections:", error);
        throw error; // Re-throw the error to handle it upstream
    }
}



function filterConnectionsByEarliestArrival(connections) {
    if (!Array.isArray(connections) || connections.length === 0) {
        throw new Error("Invalid or empty connections array.");
    }

    // Find the connection with the earliest arrival time using the 'to.arrival' field
    const earliestConnection = connections.reduce((earliest, current) => {
        const earliestArrival = new Date(earliest.to?.arrival).getTime();
        const currentArrival = new Date(current.to?.arrival).getTime();

        return currentArrival < earliestArrival ? current : earliest;
    });

    return earliestConnection;
}

function saveConnection(chosenConnection, journeyConnections) {
    if (!chosenConnection) {
        throw new Error("No connection provided to save.");
    }

    if (!Array.isArray(journeyConnections.legs)) {
        throw new Error("Invalid journeyConnections object: 'legs' must be an array.");
    }

    // Append the chosen connection to the journeyConnections.legs array
    journeyConnections.legs.push(chosenConnection);
}

function addGeneralJourneyData(journeyConnections) {
    if (!journeyConnections || !Array.isArray(journeyConnections.legs) || journeyConnections.legs.length === 0) {
        throw new Error("Invalid journeyConnections structure or no legs found.");
    }

    // Extract the first leg and last leg
    const firstLeg = journeyConnections.legs[0];
    const lastLeg = journeyConnections.legs[journeyConnections.legs.length - 1];

    // Calculate total stay duration by summing all stop durations
    let totalStayDuration = 0;
    for (let i = 1; i < journeyConnections.legs.length; i++) {
        const previousArrival = journeyConnections.legs[i - 1].to.arrivalTimestamp;
        const currentDeparture = journeyConnections.legs[i].from.departureTimestamp;

        if (previousArrival && currentDeparture) {
            const stayDuration = (currentDeparture - previousArrival) / 60; // Convert seconds to minutes
            totalStayDuration += stayDuration;
        }
    }

    // Calculate total duration of the journey
    const journeyStart = new Date(firstLeg.from.departureTimestamp * 1000); // Convert UNIX to milliseconds
    const journeyEnd = new Date(lastLeg.to.arrivalTimestamp * 1000); // Convert UNIX to milliseconds
    const totalJourneyDurationMinutes = (journeyEnd - journeyStart) / (1000 * 60); // Convert milliseconds to minutes

    // Attach details directly to the journeyConnections object
    journeyConnections.from = firstLeg.from.station.name;
    journeyConnections.to = lastLeg.to.station.name;
    journeyConnections.startingDateTime = journeyStart.toISOString();
    journeyConnections.endingDateTime = journeyEnd.toISOString();
    journeyConnections.totalDurationMinutes = totalJourneyDurationMinutes;
    journeyConnections.totalStayDurationMinutes = totalStayDuration;

    console.log("Updated journeyConnections with General Journey Data:", journeyConnections); // Debug log
}




// Functions for displaying the results

function displayResults(journeyConnections) {
    // Step 1: Select the #results-container in the DOM
    const resultsContainer = document.querySelector("#results-container");

    // Step 2: Clear any existing content in the container
    resultsContainer.innerHTML = "";

    // Step 3: Create and append the journey overview
    const journeyOverview = createJourneyOverview(journeyConnections);
    resultsContainer.appendChild(journeyOverview);

    // Step 4: Create and append the starting point container
    const startingPointContainer = createStartingPointContainer(journeyConnections);
    resultsContainer.appendChild(startingPointContainer);

    // Step 5: Iterate over each leg and render connections and stops
    journeyConnections.legs.forEach((leg, index) => {
        // Create and append the connection container for the leg
        const connectionContainer = createConnectionContainer(leg);
        resultsContainer.appendChild(connectionContainer);

        // If there's a stop after this leg, create and append the stop container
        if (index < journeyConnections.legs.length - 1) {
            const stopContainer = createResultsStopContainer(index, journeyConnections);
            resultsContainer.appendChild(stopContainer);
        }
    });

    // Step 6: Create and append the destination container
    const destinationContainer = createDestinationContainer(journeyConnections);
    resultsContainer.appendChild(destinationContainer);
}

function createJourneyOverview(journeyConnections) {
    // Step 1: Extract relevant data from journeyConnections
    const from = journeyConnections.from;
    const to = journeyConnections.to;
    const totalDurationMinutes = journeyConnections.totalDurationMinutes;
    const totalStayDurationMinutes = journeyConnections.totalStayDurationMinutes;
    const startingDateTime = new Date(journeyConnections.startingDateTime);
    const endingDateTime = new Date(journeyConnections.endingDateTime);

    // Format total durations
    const formattedDuration = `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`;
    const formattedStayDuration = `${Math.floor(totalStayDurationMinutes / 60)}h ${totalStayDurationMinutes % 60}m`;

    // Format start and end times
    const options = { day: "2-digit", month: "2-digit" }; // For date formatting
    const formattedStartDate = startingDateTime.toLocaleDateString("de-DE", options);
    const formattedStartTime = startingDateTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    const formattedEndDate = endingDateTime.toLocaleDateString("de-DE", options);
    const formattedEndTime = endingDateTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

    // Step 2: Create the journey overview container
    const overviewContainer = document.createElement("div");
    overviewContainer.classList.add("journey-overview");

    // Step 3: Populate the journey overview container
    const title = document.createElement("h2");
    title.textContent = "Your Journey";

    const route = document.createElement("p");
    route.textContent = `${from} → ${to}`;

    const duration = document.createElement("p");
    duration.textContent = `Duration: ${formattedDuration}`;

    const stayDuration = document.createElement("p");
    stayDuration.textContent = `Total stay duration: ${formattedStayDuration}`;

    const timeRange = document.createElement("p");
    timeRange.textContent = `${formattedStartDate} ${formattedStartTime} → ${formattedEndDate} ${formattedEndTime}`;

    // Step 4: Append the elements to the overview container
    overviewContainer.appendChild(title);
    overviewContainer.appendChild(route);
    overviewContainer.appendChild(duration);
    overviewContainer.appendChild(stayDuration);
    overviewContainer.appendChild(timeRange);

    // Step 5: Return the completed container
    return overviewContainer;
}

function createStartingPointContainer(journeyConnections) {
    // Step 1: Extract the starting point name
    const startingPointName = journeyConnections.legs[0]?.from?.station?.name;

    if (!startingPointName) {
        console.error("Starting point name is missing.");
        return; // Exit if data is invalid
    }

    // Step 2: Create the starting point container
    const startingPointContainer = document.createElement("div");
    startingPointContainer.classList.add("results-starting-point-container");

    // Step 3: Create title container
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("results-title-container");

    const title = document.createElement("h3");
    title.textContent = "Starting Point";
    titleContainer.appendChild(title);

    // Step 4: Create location container
    const locationContainer = document.createElement("div");
    locationContainer.classList.add("results-location-container");

    const locationName = document.createElement("p");
    locationName.textContent = startingPointName;
    locationContainer.appendChild(locationName);

    // Step 5: Append title and location to the starting point container
    startingPointContainer.appendChild(titleContainer);
    startingPointContainer.appendChild(locationContainer);

    // Step 6: Return the completed container
    return startingPointContainer;
}

function createConnectionContainer(leg) {
    // Step 1: Extract connection details
    const fromStation = leg.from?.station?.name;
    const toStation = leg.to?.station?.name;
    const departureTime = new Date(leg.from?.departure).toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
    const arrivalTime = new Date(leg.to?.arrival).toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });

    const duration = formatDuration(leg.duration); // Helper function to format duration

    // Step 2: Create the main connection container
    const connectionContainer = document.createElement("div");
    connectionContainer.classList.add("results-connection-container");

    // Step 3: Create connection overview container
    const overviewContainer = document.createElement("div");
    overviewContainer.classList.add("results-connection-overview-container");

    const title = document.createElement("h3");
    title.textContent = `${fromStation} → ${toStation}`;
    overviewContainer.appendChild(title);

    const durationText = document.createElement("p");
    durationText.textContent = `Duration: ${duration}`;
    overviewContainer.appendChild(durationText);

    const timeText = document.createElement("p");
    timeText.textContent = `${departureTime} → ${arrivalTime}`;
    overviewContainer.appendChild(timeText);

    // Append the overview container to the main connection container
    connectionContainer.appendChild(overviewContainer);

    // Step 4: Add sections for this connection
    leg.sections.forEach((section) => {
        const sectionContainer = createSectionContainer(section);
        connectionContainer.appendChild(sectionContainer);
    });

    // Step 5: Return the completed container
    return connectionContainer;
}

// Helper Function: Format duration from "00d00:12:00" to "0h 12min"
function formatDuration(durationString) {
    const [days, hours, minutes] = durationString
        .replace("d", ":")
        .split(":")
        .map((part) => parseInt(part, 10) || 0);

    return `${days * 24 + hours}h ${minutes}min`;
}

function createSectionContainer(section) {
    // Step 1: Create the container for this section
    const sectionContainer = document.createElement("div");

    // Check if this is a ride section or a walk section
    if (section.journey) {
        // This is a ride section
        sectionContainer.classList.add("results-section-container");

        // Extract journey details
        const departureStation = section.departure?.station?.name;
        const departureTime = new Date(section.departure?.departure).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const departurePlatform = section.departure?.platform
            ? `Platform ${section.departure.platform}`
            : "";

        const arrivalStation = section.arrival?.station?.name;
        const arrivalTime = new Date(section.arrival?.arrival).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const arrivalPlatform = section.arrival?.platform
            ? `Platform ${section.arrival.platform}`
            : "";

        const line = section.journey?.category + section.journey?.number;
        const direction = section.journey?.to;

        // Create and append section details
        const departureInfo = document.createElement("p");
        departureInfo.textContent = `${departureTime}: ${departureStation} (${departurePlatform})`;
        sectionContainer.appendChild(departureInfo);

        const lineInfo = document.createElement("p");
        lineInfo.textContent = `Line: ${line} | Direction: ${direction}`;
        sectionContainer.appendChild(lineInfo);

        const arrivalInfo = document.createElement("p");
        arrivalInfo.textContent = `${arrivalTime}: ${arrivalStation} (${arrivalPlatform})`;
        sectionContainer.appendChild(arrivalInfo);
    } else if (section.walk) {
        // This is a walk section
        sectionContainer.classList.add("results-connection-walksection-container");

        const walkDuration = Math.round(section.walk.duration / 60); // Convert seconds to minutes

        const walkInfo = document.createElement("p");
        walkInfo.textContent = `Walk`;
        sectionContainer.appendChild(walkInfo);

        const walkDurationInfo = document.createElement("p");
        walkDurationInfo.textContent = `Duration: ${walkDuration}min`;
        sectionContainer.appendChild(walkDurationInfo);
    }

    // Step 2: Return the completed section container
    return sectionContainer;
}

function createResultsStopContainer(stopIndex, journeyConnections) {
    // Step 1: Get the stop details from the journeyConnections object
    const stopLeg = journeyConnections.legs[stopIndex];
    const nextLeg = journeyConnections.legs[stopIndex + 1];
    const stopName = stopLeg?.to?.station?.name || "";

    // Step 2: Calculate the stay duration dynamically
    let stayDurationMinutes = 0;
    if (stopLeg?.to?.arrivalTimestamp && nextLeg?.from?.departureTimestamp) {
        stayDurationMinutes = Math.max(
            0,
            (nextLeg.from.departureTimestamp - stopLeg.to.arrivalTimestamp) / 60
        );
    }

    const hours = Math.floor(stayDurationMinutes / 60);
    const minutes = stayDurationMinutes % 60;

    // Step 3: Create the container for the stop
    const stopContainer = document.createElement("div");
    stopContainer.classList.add("results-stop-container");

    // Step 4: Add the title for the stop
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("results-title-container");
    const title = document.createElement("h3");
    title.textContent = `Stop ${stopIndex + 1}`;
    titleContainer.appendChild(title);

    // Step 5: Add the stop details
    const locationContainer = document.createElement("div");
    locationContainer.classList.add("results-location-container");
    const stopNameElement = document.createElement("p");
    stopNameElement.textContent = stopName;

    const stayDurationInfo = document.createElement("p");
    stayDurationInfo.textContent = `Stay for: ${hours}h ${minutes}min`;

    locationContainer.appendChild(stopNameElement);
    locationContainer.appendChild(stayDurationInfo);

    // Step 6: Append title and location containers to the stop container
    stopContainer.appendChild(titleContainer);
    stopContainer.appendChild(locationContainer);

    // Step 7: Return the completed stop container
    return stopContainer;
}


function createDestinationContainer(journeyConnections) {
    // Step 1: Get the destination details from the journeyConnections object
    const destination = journeyConnections.to || "";
    
    // Step 2: Create the destination container
    const destinationContainer = document.createElement("div");
    destinationContainer.classList.add("results-destination-container");

    // Step 3: Add the title for the destination
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("results-title-container");
    const title = document.createElement("h3");
    title.textContent = "Destination";
    titleContainer.appendChild(title);

    // Step 4: Add the destination details
    const locationContainer = document.createElement("div");
    locationContainer.classList.add("results-location-container");
    const destinationName = document.createElement("p");
    destinationName.textContent = destination;

    locationContainer.appendChild(destinationName);

    // Step 5: Append title and location containers to the destination container
    destinationContainer.appendChild(titleContainer);
    destinationContainer.appendChild(locationContainer);

    // Step 6: Return the completed destination container
    return destinationContainer;
}
