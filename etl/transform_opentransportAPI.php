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
    // Validate and get required parameters
    $from = $_GET['from'] ?? null;
    $to = $_GET['to'] ?? null;
    $date = $_GET['date'] ?? date('Y-m-d'); // Default to today
    $time = $_GET['time'] ?? date('H:i');   // Default to current time
    $limit = $_GET['limit'] ?? 5;           // Default to 5 results
    $isArrivalTime = $_GET['isArrivalTime'] ?? 0; // Default to departure time

    // Collect "via" fields (via[] is expected to be an array)
    $vias = $_GET['via'] ?? [];
    if (!is_array($vias)) {
        $vias = [$vias]; // Convert to array if a single value is passed
    }

    // Limit to 5 vias as per API constraints
    $vias = array_slice(array_filter($vias, fn($via) => !empty($via)), 0, 5);

    logDebugMessage("Received vias: " . json_encode($vias));


    if (!$from || !$to) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required parameters: from and to']);
        exit;
    }

    // Pass "via[]" parameters as part of the query string
    $viaQuery = '';
    foreach ($vias as $via) {
        $viaQuery .= '&via[]=' . urlencode($via);
    }

    // Construct the API URL
    $url = "http://transport.opendata.ch/v1/connections?from=" . urlencode($from)
         . "&to=" . urlencode($to)
         . "&date=" . urlencode($date)
         . "&time=" . urlencode($time)
         . "&isArrivalTime=" . urlencode($isArrivalTime)
         . $viaQuery;

    // logDebugMessage("Constructed URL: " . $url); // Custom debug log message

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