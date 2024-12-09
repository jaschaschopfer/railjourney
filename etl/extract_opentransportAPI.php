<?php

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
        return ['error' => 'No response from API'];
    }

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
        return ['error' => 'No response from API'];
    }
    
    // Decode the JSON response and return it
    return json_decode($response, true);
}
?>