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

    // Call fetchStations and return the result
    $stations = fetchStations($query);
    echo json_encode($stations);
    exit;

} elseif ($action === 'fetchConnections') {
    // Fetch raw POST data
    $input = json_decode(file_get_contents('php://input'), true);

    error_log("Received input: " . print_r($input, true));
    error_log("Constructed URL: " . $url);


    // Validate and get required parameters
    $from = $input['from'] ?? null;
    $to = $input['to'] ?? null;
    $departureTime = $input['departureTime'] ?? null;
    $vias = $input['via'] ?? [];

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
    foreach ($vias as $via) {
        $viaQuery .= '&via[]=' . urlencode($via);
    }

    // Construct the API URL
    $url = "http://transport.opendata.ch/v1/connections?from=" . urlencode($from)
         . "&to=" . urlencode($to)
         . "&date=" . urlencode($date)
         . "&time=" . urlencode($time)
         . $viaQuery;

    // Fetch data from the API
    $connections = fetchConnections($url);
    echo json_encode($connections);
    exit;

} else {
    // Invalid action
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid action parameter']);
    exit;
}
?>