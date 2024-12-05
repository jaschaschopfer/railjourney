<?php
echo "hi and "; // This will be displayed after the function output
echo "test4"; // This will be displayed after the function output

// Function call with dynamic parameters
$from = 'Worb Dorf';
$to = 'Bern';
$date = '2024-11-22';
$time = '15:40';
$limit = 1;


// TODO: CONNECT TO THE FUNCTIONS PHP FILE (LIKE THAT IT DOESN'T WORK YET)
fetchStations('Worb Dorf');
fetchConnections($from, $to, $date, $time, $limit);


?>