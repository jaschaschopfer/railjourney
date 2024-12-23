<?php
// Include the functions from extract_opentransportAPI.php
require_once 'extract_opentransportAPI.php';

// Debug logging function
function logDebugMessage($message) {
    $logFile = __DIR__ . '/debug.log'; // Path to a custom debug file
    $timestamp = date('Y-m-d H:i:s'); // Add a timestamp to each log entry
    file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND); // Append the message
}

// Set the header to return JSON response
header('Content-Type: application/json');

// Get the `action` parameter to determine the function to call
$action = $_GET['action'] ?? null;

// Handle the request based on the action
if ($action === 'fetchStations') {
    // Validate and get the `query` parameter
    $query = $_GET['query'] ?? null;
    if (!$query) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing query parameter']);
        exit;
    }

    // Construct the API URL for stations
    $url = "http://transport.opendata.ch/v1/locations?query=" . urlencode($query);

    // Call fetchStations with the constructed URL
    $stations = fetchStations($url);
    echo json_encode($stations);
    exit;

} elseif ($action === 'fetchConnections') {
    // Fetch GET data
    $from = $_GET['from'] ?? null;
    $to = $_GET['to'] ?? null;
    $departureTime = $_GET['departureTime'] ?? null;
    $vias = $_GET['via'] ?? [];

    if (!$from || !$to || !$departureTime) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required parameters.']);
        exit;
    }

    // Split departureTime into date and time
    $dateTime = explode('T', $departureTime);
    $date = $dateTime[0] ?? date('Y-m-d'); // Default to today
    $time = $dateTime[1] ?? date('H:i');   // Default to current time

    // Construct "via" query string
    $viaQuery = '';
    if (is_array($vias)) {
        foreach ($vias as $via) {
            $viaQuery .= '&via[]=' . urlencode($via);
        }
    }

    // Construct the API URL for connections
    $url = "http://transport.opendata.ch/v1/connections?"
         . "from=" . urlencode($from)
         . "&to=" . urlencode($to)
         . "&date=" . urlencode($date)
         . "&time=" . urlencode($time)
         . $viaQuery;

    // Log the constructed URL for debugging
    logDebugMessage("Constructed URL: " . $url);

    // Fetch data from the API
    $connections = fetchConnections($url);
    echo json_encode($connections);
    exit;
}
else {
    // Invalid action
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid action parameter']);
    exit;
}
