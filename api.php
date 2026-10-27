<?php
// PHP Proxy for Simpel Momen - Forward requests from LAN clients to Google Apps Script
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$googleScriptUrl = "https://script.google.com/macros/s/AKfycbxcYF0YeOTg106tFjE9rDWT9_hvUXN9Ai8fNzNKUYIJQGtBADqUi8DcAR1BVCGoROX5hg/exec";

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Handler khusus untuk sinkronisasi token prioritas Antrian Dukcapil (Sheet antrian)
    if (isset($_GET['action']) && $_GET['action'] === 'get_antrian_priority') {
        $antrianSheetUrl = "https://docs.google.com/spreadsheets/d/169cLHhc22o4az0BfJY_OLRmMZDVOtaJ0eaD2y1chQfU/gviz/tq?tqx=out:csv&sheet=antrian";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $antrianSheetUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        $csvData = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if (!$error && $csvData && strlen($csvData) > 20 && strpos($csvData, 'google.visualization') === false) {
            echo json_encode(["status" => "success", "source" => "google_sheets_csv", "csv" => $csvData]);
            exit;
        }

        // Fallback ke file queue_state.json jika offline / kendala jaringan
        $localAntrianState = dirname(__DIR__) . '/antrian/data/queue_state.json';
        if (file_exists($localAntrianState)) {
            $jsonRaw = file_get_contents($localAntrianState);
            $parsed = json_decode($jsonRaw, true);
            echo json_encode([
                "status" => "success",
                "source" => "local_queue_state",
                "tickets" => $parsed['tickets'] ?? []
            ]);
            exit;
        }

        echo json_encode(["status" => "error", "message" => "Gagal mengambil data antrian: " . ($error ?: "Data tidak ditemukan")]);
        exit;
    }

    $queryString = $_SERVER['QUERY_STRING'] ?? '';
    $targetUrl = $googleScriptUrl . ($queryString ? ('?' . $queryString) : '');
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo json_encode(["status" => "error", "message" => "PHP Proxy Error: " . $error]);
    } else {
        echo $response;
    }
    exit;
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = file_get_contents('php://input');
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $googleScriptUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo json_encode(["status" => "error", "message" => "PHP Proxy Error: " . $error]);
    } else {
        echo $response;
    }
    exit;
}
?>
