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
    populateInitialFields();
});
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

        // // Step 2: Validate the input
        // const validationResult = validateInput(journeyPlan);
        // if (!validationResult.isValid) {
        //     console.error("Validation failed:", validationResult.errors);
        //     alert("Validation errors:\n" + validationResult.errors.join("\n"));
        //     return;
        // }

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

        // Step 7: Display the results
        // displayResults(journeyConnections);
        console.log(journeyConnections); // Log the journey connections

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
        const previousArrivalTime = previousConnection.to.arrivalTimestamp;
        if (!previousArrivalTime) {
            throw new Error("Arrival time is missing in the previous connection.");
        }

        // Step 2: Calculate the next departure time
        const departureTime = calculateNextDepartureTime(previousArrivalTime, stayDuration);
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

function calculateNextDepartureTime(previousArrival, stayDuration) {
    console.log("Previous Arrival (UNIX):", previousArrival); // Debug log
    console.log("Stay Duration:", stayDuration); // Debug log

    // Convert previousArrival (UNIX timestamp in seconds) to milliseconds
    const arrivalTime = new Date(previousArrival * 1000);

    console.log("Previous Arrival Time (Date):", arrivalTime); // Debug log

    // Add stayDuration (in minutes) to the arrival time
    const nextDepartureTime = new Date(arrivalTime.getTime() + stayDuration * 60000);

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

        // Send queryParams directly to the backend as JSON
        const response = await fetch(baseUrl, {
            method: 'POST', // Use POST for sending complex data
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryParams)
        });

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


// LOL GITHUB SUCKS
