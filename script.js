console.log("JavaScript ist geladen!");

// Globale Variable, um die aktuelle Rotation zu speichern
let currentRotation = 0;
let popupTimeout;

// Mapping der Segmente anhand des Winkels (in Grad)
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

// Ergebnis an den Server senden
function saveResultToServer(resultValue) {
  const timestamp = new Date().toISOString();

  const data = {
    result: resultValue,
    timestamp: timestamp
  };

  fetch('save-result.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Ergebnis erfolgreich gespeichert:', data);
    })
    .catch((error) => {
      console.error('Fehler beim Speichern des Ergebnisses:', error);
    });
}

// Glücksrad drehen
function spinWheel() {
  const wheel = document.getElementById('wheel');
  const spinButton = document.getElementById('spin-button');
  const popup = document.getElementById('popup-result');

  // Verstecke das Popup, wenn der Button erneut gedrückt wird und lösche vorherigen Timeout (zur Sicherheit)
   popup.classList.remove('show');
   if (popupTimeout) {
    clearTimeout(popupTimeout); // alten Timeout abbrechen
  }
	
  spinButton.disabled = true;
  spinButton.textContent = "Dreht...";
  spinButton.style.pointerEvents = 'none';

  console.log("Rad dreht...");

  const randomSpin = Math.floor(Math.random() * 360) + 3600;
  currentRotation += randomSpin;
  wheel.style.transform = 'rotate(' + currentRotation + 'deg)';

  setTimeout(() => {
    const effectiveAngle = (360 - (currentRotation % 360)) % 360;
    let resultValue = "";

    console.log("Effektiver Winkel:", effectiveAngle);

    for (let segment of segments) {
      if (effectiveAngle >= segment.min && effectiveAngle < segment.max) {
        resultValue = segment.value;
        break;
      }
    }

    console.log("Ergebnis:", resultValue);

    // Ergebnis im Banner anzeigen
    document.getElementById('result-banner').textContent = "Ergebnis: " + resultValue;

    // Ergebnis zur Liste hinzufügen
    const resultList = document.getElementById('result-list');
    const li = document.createElement('li');
    li.textContent = resultValue;
    resultList.appendChild(li);

    // Liste automatisch nach unten scrollen
    resultList.scrollTop = resultList.scrollHeight;
	  
	 // Ergebnis als Pop-up anzeigen; Timeout sicher setzen; hier mit quick fix mit manuellem Euro Zeichen das sollte noch geändert werden sodass die eurozeichen auch zum Ergebnis gehören
	popup.textContent = "🎉" + resultValue + " €"; 
	popup.classList.add('show');

	// Nach 5 Sekunden wieder ausblenden
	setTimeout(() => {
  	popup.classList.remove('show');
	}, 5000);

	// Konfetti anzeigen, wenn das Ergebnis 50, 100 oder 200 ist
    if (resultValue === "50" || resultValue === "100" || resultValue === "200") {
    // Konfetti generieren
    confetti({
      particleCount: 200, // Anzahl der Konfetti-Teilchen
      spread: 70, // Winkel der Streuung
      origin: { x: 0.5, y: 0.5 }, // Mitte des Bildschirms
      colors: ['#ff8800', '#e96df7', '#4242ff', '#7a039e', '#039401', '#00bdfc', '#f0fc00', '#e81717'], // Farben der Konfetti
      scalar: 1.2 // Größe der Konfetti
    });
    }

    // Ergebnis an Server senden
    saveResultToServer(resultValue);

    // Button wieder aktivieren
    spinButton.disabled = false;
    spinButton.style.pointerEvents = 'auto';
    spinButton.textContent = "Drehen";

    console.log("Button wieder aktiviert");
  }, 4000);
}

// "Drehen"-Button initialisieren
document.addEventListener('DOMContentLoaded', function () {
  const spinButton = document.getElementById('spin-button');

  spinButton.addEventListener('click', function () {
    console.log("Button wurde geklickt");
    spinWheel();
  });
});

// Simulation der Drehung ohne echte Animation
function simulateSpin() {
  const randomSpin = Math.floor(Math.random() * 360) + 3600;
  const effectiveAngle = (randomSpin % 360);

  for (let segment of segments) {
    if (effectiveAngle >= segment.min && effectiveAngle < segment.max) {
      return segment.value;
    }
  }
}

// Test 1.000.000 Drehungen simulieren
function testSpins(numSpins) {
  const resultCounts = {
    "5": 0,
    "10": 0,
    "20": 0,
    "50": 0,
    "100": 0,
    "200": 0,
    "1000": 0,
    "10000": 0
  };

  for (let i = 0; i < numSpins; i++) {
    const result = simulateSpin();
    resultCounts[result]++;
  }

  console.log("Ergebnisse nach " + numSpins + " Drehungen:");
  for (const [key, value] of Object.entries(resultCounts)) {
    console.log(key + ": " + value + " (Prozent: " + ((value / numSpins) * 100).toFixed(2) + "%)");
  }
}

// Testdurchlauf starten
testSpins(1000000);
