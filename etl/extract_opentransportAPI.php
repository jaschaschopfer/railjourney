<?php

echo "hi"; // Dies wird nach der Funktionsausgabe angezeigt

// Funktionsaufruf mit dynamischen Parametern
$from = 'Worb Dorf';
$to = 'Bern';
$date = '2024-11-22';
$time = '15:40';
fetchStations('Worb Dorf');
fetchConnections($from, $to, $date, $time);

function fetchStations($query) {
    // URL-kodieren des Parameters, um sicherzustellen, dass Leerzeichen und andere Sonderzeichen korrekt behandelt werden
    $encodedQuery = urlencode($query);

    // Dynamische URL mit dem übergebenen Parameter
    $url = "http://transport.opendata.ch/v1/locations?query=$query";

    // Initialize a cURL session
    $ch = curl_init($url);

    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL session and get the content
    $response = curl_exec($ch);

    // Error checking for cURL
    if (curl_errno($ch)) {
        // Log error and return
        error_log('cURL error: ' . curl_error($ch));
        curl_close($ch);
        echo "cURL error: " . curl_error($ch); // Optional: Display error message
        return null; // Return null on error
    }

    // Close the cURL session
    curl_close($ch);

    // Check if the response is empty
    if (!$response) {
        echo "No response from API."; // Display a message if no response
        return;
    }

    // Print the response on the screen (optional)
    echo "<pre>";
    print_r(json_decode($response, true)); // Nicely formatted JSON output
    echo "</pre>";

    // Decode the JSON response and return it
    return json_decode($response, true);

}

function fetchConnections($from, $to, $date, $time) {
    // Dynamische URL mit den übergebenen Parametern
    $url = "http://transport.opendata.ch/v1/connections?from=$from&to=$to&date=$date&time=$time";

    // Initialize a cURL session
    $ch = curl_init($url);

    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the cURL session and get the content
    $response = curl_exec($ch);

    // Error checking for cURL
    if (curl_errno($ch)) {
        // Log error and return
        error_log('cURL error: ' . curl_error($ch));
        curl_close($ch);
        echo "cURL error: " . curl_error($ch); // Optional: Display error message
        return null; // Return null on error
    }

    // Close the cURL session
    curl_close($ch);

    // Check if the response is empty
    if (!$response) {
        echo "No response from API."; // Display a message if no response
        return;
    }

    // Print the response on the screen (optional)
    echo "<pre>";
    print_r(json_decode($response, true)); // Nicely formatted JSON output
    echo "</pre>";

    // Decode the JSON response and return it
    return json_decode($response, true);
}
?>