<?php

// Include the scripts to extract data from the Publibike API and the Elevation API
require_once('extract_publiAPI.php');
require_once('extract_altiAPI.php'); // Include the elevation API extractor

$stations = extractPubliData();

// workaround for api's structure (which has stations over all stations TO BE INTEGRATED IN EXTRACT PUBLIAPI AM BESTEN)
$stations = $stations['stations'];

// Initialize an array to store transformed data
$transformedData = [];

// Transform and add necessary information
foreach ($stations as $station) {

    if ($station['network']['id'] == 5) {

        // Use the 'id' from the API response for 'api_id'
        $apiId = $station['id'];

        // Get the station name
        $stationName = $station['name'];

        // Get latitude and longitude
        $latitude = $station['latitude'];
        $longitude = $station['longitude'];

        // Fetch elevation data using the coordinates
        $elevationData = extractElevationData($latitude, $longitude);

        // Safely get the elevation or null if not available
        $elevation = $elevationData['elevation'] ?? null;

        // Construct the new structure with all specified fields
        $transformedData[] = [
            'api_id' => $apiId,           // Store the Publibike API ID
            'name' => $stationName,       // Station name
            'latitude' => $latitude,      // Latitude
            'longitude' => $longitude,    // Longitude
            'elevation' => $elevation,    // Elevation from the elevation API
        ];
    }
}

// Encode the transformed data to JSON
$jsonData = json_encode($transformedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

var_dump($jsonData);    

// Return the JSON data
return $jsonData;

?>
