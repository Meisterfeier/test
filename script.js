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

// Funktion für den Münzregen mit Varianz in der Fallgeschwindigkeit
function startCoinRain(interval = 12) { //Standardwert für interval festgelegt
  const coinRainContainer = document.createElement('div');
  coinRainContainer.id = 'coin-rain-container'; // Container für den Regen
  document.body.appendChild(coinRainContainer);

  // Münzen erstellen
  const coinInterval = setInterval(() => {
    const coin = document.createElement('img');
    coin.src = 'coin.svg'; // SVG-Pfad
    coin.alt = 'Münze'; // Alt-Text für Barrierefreiheit
    coin.classList.add('coin');
    
    // Zufällige Position auf der X-Achse (zwischen 0 und 100%)
    const leftPosition = Math.random() * 100 + '%'; 
    coin.style.left = leftPosition; 

    // Setze eine durchschnittliche Fallzeit von 5 Sekunden mit einer zufälligen Varianz zwischen 4 und 6 Sekunden
    const randomDuration = (Math.random() * 2 + 4).toFixed(2) + 's'; // zwischen 4s und 6s
    coin.style.animationDuration = randomDuration;

    // Münze zum Container hinzufügen
    coinRainContainer.appendChild(coin);
  

  // Nach der Animation die Münze aus dem DOM entfernen
  setTimeout(() => {
    coinRainContainer.removeChild(coin);
  }, parseFloat(randomDuration) * 1000); // Zeit, bis die Münze die Animation abgeschlossen hat
}, interval); // Alle 10ms eine neue Münze erstellen (Standard Interval)

// Nach 12 Sekunden den Regen stoppen
setTimeout(() => {
  clearInterval(coinInterval);
  document.body.removeChild(coinRainContainer);
}, 12000); // 12 Sekunden lang
}

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
	popupTimeout = setTimeout(() => {
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
  
// **Geldregen  beim Ergebnis 1000 + 10000 auslösen**
if (resultValue === "1000") {
  startCoinRain(); 
} else if (resultValue === "10000") {
  // Beim Ergebnis 10000 den Münzregen verstärken
  startCoinRain(1); // Intervall auf 1ms setzen für stärkeren Regen ACHTUNG: ES IST NICHT 12 MAL SO VIEL WARUM?
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

//************* TEST */ Simulation der Drehung ohne echte Animation 
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


// Funktion zum manuellen Setzen eines Ergebnisses (TESTZWECKE ONLY)
function setResult(result) {
  const segment = segments.find(s => s.value === result);
  if (!segment) {
    console.error("Ungültiges Ergebnis:", result);
    return;
  }
  // Wähle als Zielwinkel den Durchschnittswert des Segments
  let targetAngle = (segment.min + segment.max) / 2;
  // Spezielle Anpassung für "10000": 1 Grad abziehen, damit es bei 359° landet
  if (result === "10000") {
    targetAngle -= 1;
  }
  
  // Um den bestehenden Ablauf zu nutzen, muss der Drehwinkel so gewählt werden,
  // dass der effektive Winkel (360 - (currentRotation + randomSpin) % 360) % 360 
  // dem targetAngle entspricht.
  // Das heißt, wenn currentRotation % 360 = a, soll gelten:
  // (a + (randomSpin mod 360)) mod 360 = 360 - targetAngle.
  // Daraus folgt:
  // randomSpin mod 360 = (360 - targetAngle - a) mod 360.
  
  const currentRemainder = currentRotation % 360;
  let r = (360 - targetAngle - currentRemainder) % 360;
  if (r < 0) r += 360; // Sicherstellen, dass r positiv ist

  // randomSpin wird so berechnet:
  // randomSpin = Math.floor(Math.random() * 360) + 3600;
  // Damit soll Math.random() so überschrieben werden, dass Math.floor(Math.random() * 360)
  // den Wert r liefert. Das erreichen wir, indem wir Math.random() vorübergehend so
  // überschreiben, dass es r/360 zurückgibt.
  const forcedRandom = r / 360;
  const originalMathRandom = Math.random;
  Math.random = function() {
    return forcedRandom;
  };
  
  // Nun rufe den bestehenden Spin aus:
  spinWheel();
  
  // Math.random wiederherstellen
  Math.random = originalMathRandom;
}

