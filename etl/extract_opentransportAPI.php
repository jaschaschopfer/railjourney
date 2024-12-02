<?php

echo "hi and "; // This will be displayed after the function output
echo "test4"; // This will be displayed after the function output

// Function call with dynamic parameters
$from = 'Worb Dorf';
$to = 'Bern';
$date = '2024-11-22';
$time = '15:40';
$limit = 1;

fetchStations('Worb Dorf');
fetchConnections($from, $to, $date, $time, $limit);

function fetchStations($query) {
    // URL-encode the parameter to ensure that spaces and other special characters are handled correctly
    $encodedQuery = urlencode($query);

    // Dynamic URL with the passed parameter
    $url = "http://transport.opendata.ch/v1/locations?query=$encodedQuery";

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

function fetchConnections($from, $to, $date, $time, $limit) {
    $encodedFrom = urlencode($from);
    $encodedTo = urlencode($to);
    $encodedDate = urlencode($date);
    $encodedTime = urlencode($time);
    $encodedLimit = urlencode($limit);

    // Dynamic URL with the passed parameters
    $url = "http://transport.opendata.ch/v1/connections?from=$encodedFrom&to=$encodedTo&date=$encodedDate&time=$encodedTime&limit=$encodedLimit";

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