// Globale Variable, um die aktuelle Rotation zu speichern
let currentRotation = 0;

// Mapping der Segmente anhand des Winkels (in Grad)
// Die Segmente definieren, welche Werte angezeigt werden, wenn das Feld am oberen Rand (0°) liegt.
const segments = [
  { min: 0, max: 45, value: "5" },
  { min: 45, max: 117, value: "10" },
  { min: 117, max: 207, value: "20" },
  { min: 207, max: 279, value: "50" },
  { min: 279, max: 328, value: "100" },
  { min: 328, max: 353, value: "200" },
  { min: 353, max: 359, value: "1000" },
  { min: 359, max: 360, value: "10000" }
];

// Funktion, um das Ergebnis an den Server zu senden
function saveResultToServer(resultValue) {
  const timestamp = new Date().toISOString(); // Erstelle einen Zeitstempel

  // Die Daten, die an den Server geschickt werden sollen
  const data = {
    result: resultValue,  // Das Ergebnis des Glücksrads
    timestamp: timestamp  // Der aktuelle Zeitstempel
  };

  // Sende die Daten per HTTP POST an das PHP-Skript (save-result.php)
  fetch('save-result.php', {  // Das PHP-Skript, das die Daten empfängt
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',  // Gib an, dass die Daten im JSON-Format gesendet werden
    },
    body: JSON.stringify(data),  // Wandelt die Daten in einen JSON-String um
  })
  .then(response => response.json())  // Die Antwort als JSON verarbeiten
  .then(data => {
    console.log('Ergebnis erfolgreich gespeichert:', data);
  })
  .catch((error) => {
    console.error('Fehler beim Speichern des Ergebnisses:', error);
  });
}

// Funktion, um das Glücksrad zu drehen
function spinWheel() {
  const wheel = document.getElementById('wheel');
  // Zufälliger Drehwert: mindestens 3600 Grad plus zusätzlich 0 bis 359 Grad
  const randomSpin = Math.floor(Math.random() * 360) + 3600;
  currentRotation += randomSpin;  // Hier wird der Drehwert kumulativ zur aktuellen Rotation hinzugefügt
  wheel.style.transform = 'rotate(' + currentRotation + 'deg)';
  
  // Nach 4 Sekunden (Ende der Transition) das Ergebnis ermitteln:
  setTimeout(() => {
    const effectiveAngle = (360 - (currentRotation % 360)) % 360;
    let resultValue = "";
    // Bestimme, in welches Segment der effectiveAngle fällt:
    for (let segment of segments) {
      if (effectiveAngle >= segment.min && effectiveAngle < segment.max) {
        resultValue = segment.value;
        break;
      }
    }
    // Ergebnis im Banner anzeigen
    const resultBanner = document.getElementById('result-banner');
    resultBanner.textContent = "Ergebnis: " + resultValue;
    
    // Ergebnis in die Liste speichern
    const resultList = document.getElementById('result-list');
    const li = document.createElement('li');
    li.textContent = resultValue;
    resultList.appendChild(li); 

    // Speichern des Ergebnisses auf dem Server
    saveResultToServer(resultValue);
  }, 4000); // entspricht der Transition-Zeit
}
  
