<?php
// Include the functions from extract_opentransportAPI.php
require_once 'extract_opentransportAPI.php';

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

    if (!$from || !$to) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Missing required parameters: from and to']);
        exit;
    }

    // Call fetchConnections and return the result
    $connections = fetchConnections($from, $to, $date, $time, $limit);
    echo json_encode($connections);
    exit;

} else {
    // Invalid action
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid action parameter']);
    exit;
}
?>