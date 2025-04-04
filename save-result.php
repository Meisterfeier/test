<?php
// Empfang der POST-Daten
$data = json_decode(file_get_contents("php://input"), true);

// Überprüfen, ob die benötigten Daten (result und timestamp) vorhanden sind
if (isset($data['result']) && isset($data['timestamp'])) {
    $result = $data['result'];  // Ergebnis des Glücksrads
    $timestamp = $data['timestamp'];  // Zeitstempel

    // Erstelle ein Array mit den Daten
    $resultData = [
        'result' => $result,
        'timestamp' => $timestamp
    ];

    // Überprüfen, ob die results.json-Datei existiert und gültige Daten enthält
    $file = 'results.json';

    // Falls die Datei existiert, lesen wir den Inhalt
    if (file_exists($file)) {
        // Dateiinhalt lesen
        $jsonData = file_get_contents($file);
        $results = json_decode($jsonData, true);
        
        // Wenn die Datei leer ist oder keine gültige JSON enthält, setzen wir das Array zurück
        if ($results === null) {
            $results = [];
        }
    } else {
        // Wenn die Datei nicht existiert, beginnen wir mit einem leeren Array
        $results = [];
    }

    // Füge das neue Ergebnis zum Array hinzu
    $results[] = $resultData;

    // Speichern die aktualisierten Ergebnisse als JSON in der Datei
    file_put_contents($file, json_encode($results, JSON_PRETTY_PRINT));

    // Erfolgsnachricht zurückgeben
    echo json_encode(['message' => 'Ergebnis erfolgreich gespeichert']);
} else {
    // Fehlermeldung, wenn die erforderlichen Daten fehlen
    echo json_encode(['message' => 'Ungültige Daten']);
}
?>
