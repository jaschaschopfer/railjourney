document.addEventListener('DOMContentLoaded', () => {
    // Set default departure time
    const departureInput = document.getElementById('starting-point-departure');
    if (departureInput) {
        const now = new Date();

        // Format the current time in MEZ (Central European Time)
        const formatter = new Intl.DateTimeFormat('de-DE', {
            timeZone: 'Europe/Berlin',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        });

        // Parse the formatted MEZ time into ISO format (YYYY-MM-DDTHH:mm)
        const parts = formatter.formatToParts(now).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        const formattedDateTime = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
        departureInput.value = formattedDateTime;

        // Calculate the min date (9 calendar days ago in MEZ)
        const nineDaysAgo = new Date(now);
        nineDaysAgo.setDate(nineDaysAgo.getDate() - 9);

        const nineDaysAgoParts = formatter.formatToParts(nineDaysAgo).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        const formattedMinDateTime = `${nineDaysAgoParts.year}-${nineDaysAgoParts.month}-${nineDaysAgoParts.day}T00:00`;
        departureInput.min = formattedMinDateTime;
    }

    // Attach event listeners
    document.querySelectorAll('.add-via').forEach(button => button.addEventListener('click', handleAddVia));
    document.querySelectorAll('.add-stop').forEach(button => button.addEventListener('click', handleAddStop));
    document.querySelectorAll('.location-input').forEach(input => input.addEventListener('input', handleLocationInput));
    document.querySelector('#plan-journey-button').addEventListener('click', planEntireJourney);

    // Tab navigation functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Hide all tabs and remove active class from all buttons
            tabs.forEach(tab => tab.classList.remove('visible'));
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Show target tab and mark button as active
            document.getElementById(targetTab).classList.add('visible');
            button.classList.add('active');

            // Check if the "Your Journeys" tab is activated and refresh saved journeys
            if (targetTab === 'saved-journeys-tab') {
                listSavedJourneys();
            }
        });
    });

    // Default tab visibility
    document.getElementById('new-journey-tab').classList.add('visible');

    // Load saved journeys
    listSavedJourneys();
});

let stopCounter = 1; // To track the number of stops dynamically

// Function to handle the "Add via" click event
function handleAddVia(event) {
    // Find the nearest inbetween-stops-container...
    const inbetweenStopsContainer = event.target.closest('.inbetween-stops-container');
    if (!inbetweenStopsContainer) return;

    const viasContainer = inbetweenStopsContainer.querySelector('.vias-container');
    if (!viasContainer) return;

    const existingVias = viasContainer.querySelectorAll('.via');
    if (existingVias.length >= 5) {
        alert("You can only add up to 5 vias per section.");
        return;
    }

    // Create a new via element
    const viaElement = document.createElement('div');
    viaElement.classList.add('via');

    // Create the wrapper
    const viaInputWrapper = document.createElement('div');
    viaInputWrapper.classList.add('location-input-wrapper');

    // Add input field for via location
    const viaInput = document.createElement('input');
    viaInput.type = 'text';
    viaInput.classList.add('via-location', 'location-input');
    viaInput.placeholder = 'Enter via location';
    viaInput.addEventListener('input', handleLocationInput);

    // Place the input inside the wrapper
    viaInputWrapper.appendChild(viaInput);

    // Add remove button for the via
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-via');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        viaElement.remove();
    });

    // Construct the final structure
    viaElement.appendChild(viaInputWrapper);
    viaElement.appendChild(removeButton);

    // Append the via element to the vias-container
    viasContainer.appendChild(viaElement);
}

// Function to handle the "Add stop" click event
function handleAddStop(event) {
    // Find the nearest inbetween-stops-container for this button
    const currentInbetweenStopsContainer = event.target.closest('.inbetween-stops-container');
    if (!currentInbetweenStopsContainer) return; // Safety check

    // Renumber existing stops before adding a new one
    renumberStops();

    // Create a new stop-container
    const stopContainer = createStopContainer();

    // Create a new inbetween-stops-container
    const newInbetweenStopsContainer = createInbetweenStopsContainer();

    // Insert the new stop-container and the new inbetween-stops-container after the current inbetween-stops-container
    currentInbetweenStopsContainer.insertAdjacentElement('afterend', stopContainer);
    stopContainer.insertAdjacentElement('afterend', newInbetweenStopsContainer);

    // Renumber stops again after adding the new stop
    renumberStops();
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
    stopTitle.textContent = `Stop ${stopCounter++}`;
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-stop');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        stopContainer.nextElementSibling.remove(); // remove the inbetween-stops-container
        stopContainer.remove();
        renumberStops();
    });

    titleContainer.appendChild(stopTitle);
    titleContainer.appendChild(removeButton);

    // Create the input container
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    // Add the location input
    const locationInputContainer = document.createElement('div');
    locationInputContainer.classList.add('location-input-container');

    // Create the wrapper
    const locationInputWrapper = document.createElement('div');
    locationInputWrapper.classList.add('location-input-wrapper');

    const locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.classList.add('stop-location', 'location-input');
    locationInput.placeholder = 'Enter stop location';
    locationInput.addEventListener('input', handleLocationInput);

    // Append the input into the wrapper, then the wrapper into the container
    locationInputWrapper.appendChild(locationInput);
    locationInputContainer.appendChild(locationInputWrapper);

    // Add the duration input
    const durationInputContainer = document.createElement('div');
    durationInputContainer.classList.add('duration-input-container');
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.classList.add('stop-duration');
    durationInput.placeholder = 'Min stay (minutes)';
    durationInputContainer.appendChild(durationInput);

    // Assemble the input container
    inputContainer.appendChild(locationInputContainer);
    inputContainer.appendChild(durationInputContainer);

    // Final assembly of stopContainer
    stopContainer.appendChild(titleContainer);
    stopContainer.appendChild(inputContainer);

    return stopContainer;
}

function renumberStops() {
    // Select all stop containers
    const stopContainers = document.querySelectorAll('.stop-container');

    // Loop through each stop container and update its number
    stopContainers.forEach((stopContainer, index) => {
        const stopTitle = stopContainer.querySelector('.title-container h2');
        if (stopTitle) {
            stopTitle.textContent = `Stop ${index + 1}`; // Update the stop title with the correct number
        }
    });
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
    // Clear existing suggestions first
    clearSuggestions(inputField);

    // Create a dropdown for suggestions
    const dropdown = document.createElement('div');
    dropdown.classList.add('suggestions-dropdown');

    // Populate the dropdown
    suggestions.forEach(station => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = station.name;
        suggestionItem.addEventListener('click', () => {
            inputField.value = station.name;
            clearSuggestions(inputField);
        });
        dropdown.appendChild(suggestionItem);
    });

    // Append the dropdown to the wrapper
    const wrapper = inputField.closest('.location-input-wrapper');
    if (wrapper) {
        wrapper.appendChild(dropdown);
    } else {
        // Fallback if no wrapper found (shouldn't happen with the new structure)
        inputField.parentNode.appendChild(dropdown);
    }
}

function clearSuggestions(inputField) {
    const wrapper = inputField.closest('.location-input-wrapper');
    if (!wrapper) return;
    const existingDropdown = wrapper.querySelector('.suggestions-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
}



// ########################################################################################################################
// FUNCTIONS FOR SENDING THE INPUTS AND GETTING THE RESULTS

// Orchestral function to plan the entire journey and display the result
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

            const currentStop = journeyPlan.stops[i - 1]; // Current stop is the one we've just reached
            const nextStop = journeyPlan.stops[i];       // Next stop is the one we're planning the journey to
            const stayDuration = currentStop.stayDuration;

            // Plan the next connection for the current stop
            await planNextConnection(
                previousConnection,
                stayDuration,
                nextStop.name,                  // Plan to the next stop
                journeyPlan.destination.name,   // Destination is still passed for context, but not used here
                journeyConnections,
                currentStop.vias
            );
        }

        // Step 6: Handle the final leg from the last stop to the destination (only if there were stops in the journeyPlan)
        if (journeyPlan.stops.length > 0) {
            const previousConnection = journeyConnections.legs[journeyConnections.legs.length - 1];
            const finalStop = journeyPlan.stops[journeyPlan.stops.length - 1];
            const stayDuration = finalStop.stayDuration;

            // Plan the final connection from the last stop to the destination
            await planNextConnection(
                previousConnection,
                stayDuration,
                null, // No next stop; go directly to destination
                journeyPlan.destination.name, // Destination
                journeyConnections,
                [] // No vias for the final leg
            );
        }


        // Step 7: Extract general journey data
        addGeneralJourneyData(journeyConnections);

        // Step 8: Display the results
        displayResults(journeyConnections);

         // Step 9: Show the save button and add event listener
         const saveButton = document.querySelector('.save-journey-button');
         saveButton.style.display = 'block';
 
         // Add event listener to the save button
         saveButton.addEventListener("click", () => {
             saveJourney(journeyPlan, journeyConnections);
         });

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
        console.log("Previous Arrival TimeISO:", previousArrivalTime); // Debug log
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

        console.log("Next Query Params:", queryParams); // Debug log

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
    } else if (journeyPlan.startingPoint.departureTime) {
        const departureTime = new Date(journeyPlan.startingPoint.departureTime);
        const now = new Date();
        const nineDaysAgo = new Date(now);
        nineDaysAgo.setDate(nineDaysAgo.getDate() - 9);
        nineDaysAgo.setHours(0, 0, 0, 0); // Set to midnight 9 days ago

        if (departureTime < nineDaysAgo) {
            errors.push(
                `Starting point departure time cannot be earlier than ${nineDaysAgo.toLocaleString("de-DE")}.`
            );
        }
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

    // Parse departureTime into date and time components
    const departureDateObj = new Date(departureTime);
    const date = departureDateObj.toISOString().slice(0, 10); // Format YYYY-MM-DD
    const time = departureDateObj.toTimeString().slice(0, 5); // Format HH:mm

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
        date, // Use the parsed date
        time, // Use the parsed time
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
    console.log("Previous Arrival gotten in CALCNEXTDEPART:", previousArrival); // Debug log
    console.log("Stay Duration:", stayDuration); // Debug log

    // Convert previousArrival from seconds to milliseconds ((BECAUSE OF UNIX FORMAT)) and create a Date object
    const previousArrivalTime = new Date(previousArrival    * 1000);

    console.log("Previous Arrival Time (Date):", previousArrivalTime.toISOString()); // Debug log

    // Add stayDuration (in minutes) to the arrival time
    const nextDepartureTime = new Date(previousArrivalTime.getTime() + stayDuration * 60000);

    console.log("Next Departure Time calculated:", nextDepartureTime.toISOString()); // Debug log

    // Return the new departure time as an ISO string
    return nextDepartureTime.toISOString();
}

//gets departureTime in ISO format, converts it to MEZ and splits it into date and time
function prepareNextQuery(from, to, departureTime, via = []) {
    // Convert the ISO departureTime to MEZ date and time
    const departureDate = new Date(departureTime);

    // Adjust to MEZ timezone (+1)
    const MEZOffset = 60 * 60 * 1000; // 1 hour in milliseconds
    const MEZTime = new Date(departureDate.getTime() + MEZOffset);

    // Format the date and time for the API
    const date = MEZTime.toISOString().split('T')[0]; // Extract YYYY-MM-DD
    const time = MEZTime.toISOString().split('T')[1].substring(0, 5); // Extract hh:mm

    console.log("Converted Departure Time to MEZ:", { date, time }); // Debug log

    // Construct the query object
    const queryParams = {
        from,               // Starting point of the leg
        to,                 // Destination for this leg
        date,               // Date in YYYY-MM-DD format
        time,               // Time in hh:mm format
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

        const queryString = `from=${encodeURIComponent(queryParams.from)}&to=${encodeURIComponent(queryParams.to)}&date=${encodeURIComponent(queryParams.date)}&time=${encodeURIComponent(queryParams.time)}${viaQueryString ? `&${viaQueryString}` : ''}`;

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

        // Skip invalid timestamps
        if (previousArrival && currentDeparture && currentDeparture > previousArrival) {
            const stayDuration = (currentDeparture - previousArrival) / 60; // Convert seconds to minutes
            totalStayDuration += stayDuration;
        } else {
            console.warn(
                `Invalid timestamps for leg ${i}: Previous Arrival: ${previousArrival}, Current Departure: ${currentDeparture}`
            );
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




// ########################################################################################################################
// FUNCTIONS FOR DISPLAYING THE RESULTS


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

    // Step 7: Show the results container
    resultsContainer.style.display = "block";
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

    // Step 3: Create and populate the journey overview title container
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("journey-overview-title-container");

    const title = document.createElement("h2");
    title.textContent = "Your Journey";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Journey";
    saveButton.classList.add("save-journey-button");
    saveButton.style.display = "none"; // Hide the button by default

    titleContainer.appendChild(title);
    titleContainer.appendChild(saveButton);

    // Step 4: Populate the journey overview container
    const route = document.createElement("p");
    route.textContent = `${from} → ${to}`;

    const duration = document.createElement("p");
    duration.textContent = `Duration: ${formattedDuration}`;

    const stayDuration = document.createElement("p");
    stayDuration.textContent = `Total stay duration: ${formattedStayDuration}`;

    const timeRange = document.createElement("p");
    timeRange.textContent = `${formattedStartDate} ${formattedStartTime} → ${formattedEndDate} ${formattedEndTime}`;

    // Step 5: Append the elements to the overview container
    overviewContainer.appendChild(titleContainer); // Add the title container
    overviewContainer.appendChild(route);
    overviewContainer.appendChild(duration);
    overviewContainer.appendChild(stayDuration);
    overviewContainer.appendChild(timeRange);

    // Step 6: Return the completed container
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

    // Format departure and arrival times without commas
    const departureDate = new Date(leg.from?.departure).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
    });
    const departureTime = new Date(leg.from?.departure).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const arrivalDate = new Date(leg.to?.arrival).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
    });
    const arrivalTime = new Date(leg.to?.arrival).toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
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
    timeText.textContent = `${departureDate} ${departureTime} → ${arrivalDate} ${arrivalTime}`;
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

        // Always calculate walk duration because API has false walk durations
        let walkDuration = 0; // Initialize with default value
        if (section.departure?.departureTimestamp && section.arrival?.arrivalTimestamp) {
            walkDuration = Math.round(
                (section.arrival.arrivalTimestamp - section.departure.departureTimestamp) / 60 // Convert seconds to minutes
            );
        }
        console.log("Calculated Walk Duration:", walkDuration); // Debug log


        // Create walk details
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




// ########################################################################################################################
// FUNCTIONS TO SAVE AND LIST SAVED JOURNEYS


// Function to save the journey to localStorage
function saveJourney(journeyPlan, journeyConnections) {
    try {
        // Step 1: Build display fields
        const from = journeyConnections.from;
        const to = journeyConnections.to;
        const startingDateTime = new Date(journeyConnections.startingDateTime);
        const displayName = `${from} → ${to}`;
        const displayDateTime = startingDateTime.toLocaleString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Step 2: Create the Saved Journey Object
        const newJourney = {
            id: Date.now().toString(), // Unique ID
            timestamp: Date.now(),    // Timestamp for sorting
            displayName,              // User-friendly display name
            displayDateTime,          // User-friendly date and time
            journeyConnections        // Store the full journeyConnections
        };

        // Step 3: Retrieve existing saved journeys from localStorage
        const savedJourneys = JSON.parse(localStorage.getItem('savedJourneys')) || [];

        // Step 4: Append the new journey to the array
        savedJourneys.push(newJourney);

        // Step 5: Save the updated array back to localStorage
        localStorage.setItem('savedJourneys', JSON.stringify(savedJourneys));

        alert("Journey saved successfully!");
        console.log("Journey saved successfully:", newJourney); // Debug log

    } catch (error) {
        console.error("Error saving journey:", error);
    }
}

function listSavedJourneys() {
    // Retrieve the saved journeys from local storage
    const journeysString = localStorage.getItem("savedJourneys");
    const savedJourneys = journeysString ? JSON.parse(journeysString) : [];

    // Sort journeys by departure time
    savedJourneys.sort((a, b) => {
        const timeA = a.journeyConnections.legs[0].from.departureTimestamp;
        const timeB = b.journeyConnections.legs[0].from.departureTimestamp;
        return timeA - timeB; // Ascending order
    });

    // Select the container for saved journeys
    const container = document.getElementById("saved-journeys-list");
    container.innerHTML = ""; // Clear any existing content

    // Display the title "Your Journeys"
    const titleElement = document.createElement("h2");
    titleElement.textContent = "Your Journeys";
    container.appendChild(titleElement);

    // Create an entry for each journey
    savedJourneys.forEach((journey) => {
        // Create the journey item container
        const journeyItem = document.createElement("div");
        journeyItem.classList.add("saved-journey-item");
        journeyItem.dataset.id = journey.id; // Attach the journey ID

        // Left side: Journey title and date
        const journeyDetails = document.createElement("div");

        // Add the journey display name
        const displayName = document.createElement("p");
        displayName.textContent = journey.displayName;
        journeyDetails.appendChild(displayName);

        // Add the journey date/time
        const displayDateTime = document.createElement("p");
        displayDateTime.textContent = journey.displayDateTime;
        journeyDetails.appendChild(displayDateTime);

        // Add the details to the left container
        journeyItem.appendChild(journeyDetails);

        // Right side: Remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent the journey from being loaded
            confirmAndRemoveJourney(journey.id, journey.displayName);
        });

        // Add the remove button to the journey item
        journeyItem.appendChild(removeButton);

        // Attach click event to load the journey
        journeyItem.addEventListener("click", () => {
            loadJourneyFromLocalStorage(journey.id);
        });

        // Append the journey item to the container
        container.appendChild(journeyItem);
    });
}

function loadJourneyFromLocalStorage(journeyId) {
    // Retrieve saved journeys from local storage
    const journeysString = localStorage.getItem("savedJourneys");
    const savedJourneys = journeysString ? JSON.parse(journeysString) : [];

    // Find the journey by ID
    const foundJourney = savedJourneys.find(j => j.id === journeyId);
    if (foundJourney) {
        // Display the journey using the existing displayResults function
        displaySavedJourney(foundJourney.journeyConnections);
    } else {
        console.error("Journey not found!");
        alert("Journey not found.");
    }
}

// Ask the user for confirmation before removing a journey
function confirmAndRemoveJourney(journeyId, displayName) {
    const isConfirmed = confirm(`Are you sure you want to remove the journey "${displayName}"?`);
    if (isConfirmed) {
        removeJourneyFromLocalStorage(journeyId);
    }
}

// Remove Journey from Local Storage
function removeJourneyFromLocalStorage(journeyId) {
    const journeysString = localStorage.getItem("savedJourneys");
    const savedJourneys = journeysString ? JSON.parse(journeysString) : [];
    const updatedJourneys = savedJourneys.filter((journey) => journey.id !== journeyId);
    localStorage.setItem("savedJourneys", JSON.stringify(updatedJourneys));

    // Refresh the list after removal
    listSavedJourneys();
}

// Display the saved journey with the same logic as "displayResults" function
function displaySavedJourney(journeyConnections) {
    // Step 1: Select the #savedJourney-Container and the #saved-journeys-list in the DOM
    const savedJourneyContainer = document.querySelector("#saved-journey-container");
    const savedJourneysList = document.querySelector("#saved-journeys-list");

    // Step 2: Clear any existing content in the container
    savedJourneyContainer.innerHTML = "";

    // Step 3: Hide the saved journeys list and show the saved journey container
    savedJourneysList.style.display = "none";
    savedJourneyContainer.style.display = "block";

    // Step 5: Add a "Back to List" button
    const backButton = document.createElement("button");
    backButton.innerHTML = "← Back";
    backButton.classList.add("back-to-list-button");
    backButton.addEventListener("click", () => {
        // Show the saved journeys list and hide the saved journey container
        savedJourneysList.style.display = "block";
        savedJourneyContainer.style.display = "none";

        // Clear the saved journey container
        savedJourneyContainer.innerHTML = "";
    });

    // Append the button to the container
    savedJourneyContainer.appendChild(backButton);

    // Step 6: Create and append the journey overview
    const journeyOverview = createJourneyOverview(journeyConnections);
    savedJourneyContainer.appendChild(journeyOverview);

    // Step 7: Create and append the starting point container
    const startingPointContainer = createStartingPointContainer(journeyConnections);
    savedJourneyContainer.appendChild(startingPointContainer);

    // Step 8: Iterate over each leg and render connections and stops
    journeyConnections.legs.forEach((leg, index) => {
        // Create and append the connection container for the leg
        const connectionContainer = createConnectionContainer(leg);
        savedJourneyContainer.appendChild(connectionContainer);

        // If there's a stop after this leg, create and append the stop container
        if (index < journeyConnections.legs.length - 1) {
            const stopContainer = createResultsStopContainer(index, journeyConnections);
            savedJourneyContainer.appendChild(stopContainer);
        }
    });

    // Step 9: Create and append the destination container
    const destinationContainer = createDestinationContainer(journeyConnections);
    savedJourneyContainer.appendChild(destinationContainer);
}

