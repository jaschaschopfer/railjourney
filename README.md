**RailJourney**  
Plan your multi-stop train journey effortlessly.

RailJourney offers a powerful and user-friendly way to plan, save, and view multi-step journeys with intermediate stops. Unlike standard apps such as SBB Mobile, this app provides the unique ability to add multiple stops with customizable stay durations. This eliminates the need to save multiple individual connections or perform repeated searches, streamlining the entire journey planning process. By integrating user inputs, the OpenTransport API, and local storage, the app delivers detailed step-by-step results for seamless travel management.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)
3. [Usage](#usage)  
4. [Project Structure](#project-structure)  
5. [Technical Details](#technical-details)  
6. [Saving & Loading Journeys](#saving--loading-journeys)  
7. [Future Improvements](#future-improvements)  

---

## Overview

**RailJourney** is a web application that helps you plan train trips with multiple stops (including “via” locations and stops with stay durations). Users can:
- Start from an origin station at a specific time.
- Add intermediate stops, each with a desired minimum stay duration.
- Incorporate “via” stations for each leg of the journey.
- View a dynamically generated itinerary with route details, stop durations, and connection times.
- Save completed journeys to review them later.

The application uses an external OpenTransport API via a local endpoint (`/etl/transform_opentransportAPI.php`) for real-time train connections and station name suggestions.

---

## Features

- **Auto-suggestions** for train stations: As you type, the app fetches station names from the OpenTransport API.  
- **Multistop Journeys**: Add as many stops as you need, each with a stay duration. RailJourney gets the best connections for you (earliest arrival).
- **Via Locations**: Specify up to five “vias” for each journey leg.  
- **Dynamic Timestamps**: Automatically handles your departure time in Central European Time and enforces constraints (e.g., not more than 9 days old).  
- **Journey Overview**: Summaries include total travel time, total stay time, departure, and arrival details.  
- **Save Journeys**: Keep a record of your planned itineraries in local storage.  
- **Responsive UI**: The layout adjusts for desktop and mobile devices, with a tab navigation fixed at the bottom.

---

## Usage

1. **Plan a New Journey**  
   - Upon page load, the default active tab is **"Plan Journey"**.  
   - Enter a starting location and pick a departure time (or leave it if it’s pre-filled with the current time).  
   - Add intermediate stops by clicking **+ Add stop**, each with an optional stay duration in minutes.  
   - For each leg (starting point, stops, or destination), you can add “via” stations by clicking **+ Add via**.  
   - Finally, enter your destination station.  
   - Press **Let's Go!** to fetch and display connections.

2. **View the Results**  
   - After processing your inputs, the app displays the entire route.  
   - Each leg shows train times, platforms, changes, and walking sections.  
   - You also get an overview of total travel time, total stay time, departure, and arrival info.

3. **Save Your Journey**  
   - Click the **Save Journey** button in the results section to store the itinerary in your browser’s localStorage.

4. **Load or Remove Saved Journeys**  
   - Switch to the **"Your Journeys"** tab to see all saved itineraries.  
   - Click on any journey to view its detailed breakdown.  
   - Use the **Remove** button to delete a journey from storage.

---

## Project Structure

```
.
├── css
│   └── styles.css              # Application's main CSS file
├── images
│   └── logo.png                # RailJourney logo
├── favicon_io                  # Favicon files and manifest
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── site.webmanifest
├── js
│   └── scripts.js              # Main JavaScript application logic
├── etl
│   └── transform_opentransportAPI.php  # PHP wrapper for API requests
├── index.html                  # Primary HTML page
└── README.md                   # You're reading this file
```

**Key Files**  
- **index.html**: The main entry point with the markup for planning and viewing journeys.  
- **scripts.js**: Houses the core logic, including collecting user inputs, validating data, fetching from the API, rendering results, and managing local storage.  
- **styles.css**: Contains all the custom styles used by the app.  
- **transform_opentransportAPI.php**: PHP script that queries the OpenTransport API and returns JSON data in a suitable format.

---

## Technical Details

1. **Front-End**  
   - Vanilla JavaScript for interactivity.  
   - HTML/CSS for structure and styling.  
   - DOM manipulation is done via `document.querySelector()`, `document.createElement()`, and event listeners.

2. **Date and Time Handling**  
   - By default, the departure time is set to the user’s current date/time in *Central European Time* (MEZ).  
   - The code ensures a 9-day limit for backdating departure times.  
   - When chaining multiple stops, the app re-calculates the next departure time by adding a stay duration to the prior leg’s arrival time.

3. **API Requests**  
   - The app calls `fetch()` on the local PHP endpoint, which then retrieves data from the OpenTransport API.  
   - Station suggestions: `action=fetchStations&query=<searchTerm>`  
   - Connections: `action=fetchConnections&from=…&to=…&date=…&time=…[&via[]=…]`

4. **Local Storage**  
   - Journeys are saved and loaded using `localStorage`.  
   - Each saved journey has a unique `id`, a `displayName`, `displayDateTime`, and the entire `journeyConnections` object.

---

## Saving & Loading Journeys

- **Saving**  
  When you see your itinerary and click **Save Journey**, the app wraps your route details (from local variables like `journeyPlan` and `journeyConnections`) into a JSON object. It then appends it to `localStorage` under the `savedJourneys` key.

- **Listing**  
  The **"Your Journeys"** tab fetches all saved journeys from localStorage, sorts them chronologically by departure time, and displays each in a clickable list.

- **Loading**  
  Clicking on a saved journey in the **"Your Journeys"** tab calls `displaySavedJourney()`, which reconstructs the same result overview used in the "Plan Journey" tab.

- **Removing**  
  Each saved journey in the list has a **Remove** button. Clicking it asks for confirmation, then deletes the journey’s entry from localStorage.

---

## Future Improvements
- **Refresh Journeys**: Allow users to refresh journeys to retrieve updated delays, platform changes, and real-time availability.
- **Editing Journeys**: Allow users to modify saved journeys.
- **Find Connections by Arrival Time**: Allow users to plan a journey based on desired arrival time instead of departure time.
- **User Accounts**: Allow user authentication and cloud-based storage for journeys.

---

**Thank you for using RailJourney!** If you have any questions or feedback, feel free to open an issue or contribute to the repository. Happy travels!

