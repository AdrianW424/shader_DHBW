#ifdef GL_ES
precision highp float;
#endif

#define NUM_OCTAVES 5

const float PI = 3.1415926535897932384626433832795;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const int   complexity      = 30;           // Höhere Komplexität der Farbmuster innerhalb der Formen des Patterns.
float color_intensity       = 0.5;
float pattern_zoom          = 4.0;          // Wie weit das Pattern herausgezoomt ist.
float pattern_speed         = 0.11;         // Wie schnell sich das Pattern bewegt.
int   pattern_sides         = 6;            // Die Menge an Seiten, die die Formen des Patterns besitzen.

// Diese Funktion gibt einen Zufallsfaktor zurück, der auf den übergebenen Koordinaten basiert

float getRandomValue(in vec2 coordinates) {
    // Berechne einen Zufallsfaktor durch Interpolation des sinusförmigen Wertes von coordinates
    return fract(sin(dot(coordinates, vec2(12.9898, 78.233))) * 437580.5453123);
}

// Diese Funktion gibt eine zufällige Koordinate zurück, die auf den übergebenen Koordinaten basiert

vec2 getRandom2D(vec2 coordinates) {
    // Verschiebe und skaliere die Koordinaten, um eine zufällige Koordinate zu erhalten
    coordinates = vec2( dot(coordinates, vec2(100.0, 300.0)),
    dot(coordinates, vec2(270.0, 180.0)) );
    // Berechne die zufällige Textur-Koordinate durch Interpolation des sinusförmigen Wertes von xy
    return -1.0 + 2.0 * fract(sin(coordinates) * 45555.5454545);
}

// Diese Funktion generiert einen noise-Wert für gegebene Koordinaten.

float getNoise(in vec2 coordinates) {
    // Runde die Texture Koordinaten auf die nächste ganze Zahl ab
    vec2 tileIndex = floor(coordinates);
    
    // Berechne die Bruchteile der Koordinaten
    vec2 fractionalPart = fract(coordinates);

    // Berechne den Zufallsfaktor für jede Ecke des Kachel
    float cornerA = getRandomValue(tileIndex);
    float cornerB = getRandomValue(tileIndex + vec2(1.0, 0.0));
    float cornerC = getRandomValue(tileIndex + vec2(0.0, 1.0));
    float cornerD = getRandomValue(tileIndex + vec2(1.0, 1.0));

    // Berechne den Interpolationsfaktor für die lineare Interpolation
    vec2 interpolationFactor = fractionalPart * fractionalPart * (3.0 - 2.0 * fractionalPart);

    // Berechne den gefilterten Wert durch Interpolation der Eckenwerte
    return  mix (cornerA, cornerB, interpolationFactor.x) +
                (cornerC - cornerA) * interpolationFactor.y * (1.0 - interpolationFactor.x) +
                (cornerD - cornerB) * interpolationFactor.x * interpolationFactor.y;
}

// Diese Funktion generiert einen noise-Wert für gegebene Koordinaten.

float generateNoise2D(vec2 coordinates) {
    
    // Bestimme den Bruchteil der auf eine Ganzzahl gerundeten Koordinate.
    vec2 integerPart = floor(coordinates);
    vec2 fractionalPart = fract(coordinates);

    // Erstelle einen weicheren Übergang der Bruchteile, indem man die Bruchteile zwischen 0 und 1 Zwischenwerten zuordnet.
    vec2 smootherFractionalPart = smoothstep(0.0, 1.0, fractionalPart);

    // Mische den Noise-Wert zwischen den vier benachbarten Integralteilen anhand des Bruchteils und gib den resultierenden Wert zurück.
    return  mix(    mix(    dot(getRandom2D(integerPart + vec2(0.0, 0.0)),
                                            fractionalPart - vec2(0.0, 0.0)),
                            dot(getRandom2D(integerPart + vec2(1.0, 0.0)),
                                            fractionalPart - vec2(1.0, 0.0)),
                                            smootherFractionalPart.x),
                    mix(    dot(getRandom2D(integerPart + vec2(0.0, 1.0)),
                                            fractionalPart - vec2(0.0, 1.0)),
                            dot(getRandom2D(integerPart + vec2(1.0, 1.0)),
                                            fractionalPart - vec2(1.0, 1.0)),
                            smootherFractionalPart.x), 
                    smootherFractionalPart.y);
}

// Die Funktion nimmt einen Punkt mit den Koordinaten coordinates und zwei float-Werte "radius" und "randomValue" entgegen.
// Sie berechnet einen Wert zwischen 0 und 1 und gibt ihn zurück.

float calculateShapeInForms(vec2 coordinates, float radius, float randomValue) {
    // Stelle sicher, dass der Punkt im Bereich von (-0.5, -0.5) bis (0.5, 0.5) liegt.
    coordinates = vec2(0.5) - coordinates;
    float distanceToOrigin = length(coordinates) * 2.0;
    float noiseRadius = radius;

    // Berechne den Winkel von dem Punkt zum Ursprung.
    float angle = atan(coordinates.y, coordinates.x);

    // Füge noiseRadius eine kosinusförmige Komponente hinzu, die von dem Winkel abhängt.
    noiseRadius += cos(angle * 60.0) * generateNoise2D(coordinates + u_time * 0.7) * 0.1;
    // Füge noiseRadius eine sinusförmige Komponente hinzu, die von dem Winkel und dem randomValue abhängt.
    noiseRadius += (sin(angle * 10.0) * 0.1 * sin(u_time + randomValue));

    // Berechne den Wert zwischen 0 und 1 und gib ihn zurück.
    return 1.0 - smoothstep(noiseRadius, noiseRadius + 0.007, distanceToOrigin);
}

// Die Funktion berechnet den Abstand zwischen einem Punkt mit den Koordinaten coordinates und der Form
// mit dem Radius radius. Der Faktor randomValue wird verwendet, um den
// Radius der Form zu verändern und damit zufällige Formen zu erzeugen.
// Die Funktion gibt 1 zurück, wenn der Punkt innerhalb der Form ist und 0, wenn
// er außerhalb der Form ist.

float shapeBorderWidth(vec2 coordinates, float radius, float width, float randomValue) {
    // Berechne den Abstand von coordinates zur Form
    float distanceToShape = calculateShapeInForms(coordinates, radius, randomValue);
    
    // Berechne den Abstand von dem Punkt zur Form minus der Dicke der Form
    float distanceToShapeBorder = calculateShapeInForms(coordinates, radius-width, randomValue);
    
    // Gib 1 zurück, wenn der Punkt innerhalb der Form ist und 0, wenn er außerhalb der Form ist.
    return distanceToShape-distanceToShapeBorder;
}

// Diese Funktion berechnet den Inhalt der Formen anhand der Eingabe-Koordinaten (coordinates) und dem zufälligen Element (randomElement)

vec3 CalculateFormContent(vec2 coordinates, float randomElement) {
    // Normalisiere die Maus-Koordinaten anhand der Auflösung
    vec2 mouseCoords = vec2(u_mouse.x / u_resolution.x, 1.0 - u_mouse.y / u_resolution.y);
    
    // Setze die Maus-Multiplikator-Konstante (mouseMult) auf 10.0
    float mouseMult = 10.0;
    
    // Setze den Maus-Offset (mouseOffset) auf 0.0
    float mouseOffset = 0.0;
    
    // Berechne die Flüssigkeits-Geschwindigkeit (fluidSpeed) anhand des zufälligen Elements (randomElement)
    float fluidSpeed = (sin(randomElement * 5.0)) + 1.8;
    
    // Initialisiere die Basisfarbe (color) als Schwarz
    vec3 color = vec3(0.0);
    
    // Berechne den Positionsvektor (position) anhand der Eingabe-Koordinaten (coordinates), der Maus-Koordinaten (mouseCoords) und der Flüssigkeits-Geschwindigkeit (fluidSpeed)
    vec2 position = coordinates;

    // Beeinfluss den Positionsvektor in einem Maße, abhängig von der eingestellten Komplexität.
    for (int i = 1; i < complexity; i++) {
        vec2 newPoint = position + 2. * 0.001 + (randomElement * 0.25);
        newPoint.x += 0.6 / float(i) * sin(float(i) * position.y + (0.5 * cos(u_time) + 0.5) / fluidSpeed + 17.0 * float(i)) - 0.5 - mouseCoords.y / mouseMult + mouseOffset;
        newPoint.y += 0.6 / float(i) * sin(float(i) * position.x + (0.5 * sin(u_time) + 0.5) / fluidSpeed + 0.6 * float(i + 10)) - 0.5 - mouseCoords.x / mouseMult + mouseOffset;
        position = newPoint;
    }
    
    // Berechne die Basisfarbe (baseColor) anhand von (position)
    vec3 baseColor = vec3(color_intensity * cos(5.0 * position.x) + color_intensity, color_intensity * cos(3.0 * position.y) + color_intensity, color_intensity * cos(position.x + position.y) + color_intensity);
    float borderWidth = 0.02;
    float pulseSpeed = 0.5;
    
    for (float i = 1.0; i < 4.0; i++) {
        color += baseColor * shapeBorderWidth(coordinates, 0.9 - i * 0.23, ((sin(u_time * pulseSpeed) + 1.0) / 10.0) + borderWidth, randomElement);
    }
    // Gebe die berechnete Farbe (color) zurück
    return color;
}



// Diese Funktion berechnet den fractional Brownian Motion Wert anhand der Eingabe-Koordinaten coordinates

float CalculatefBm(vec2 coordinates) {
    // Initialisiere die Ausgabe-Variable (v) mit 0.0
    float v = 0.0;
    
    // Initialisiere die Hilfs-Variable (a) mit 0.5
    float a = 0.5;
    // Initialisiere den Verschiebungs-Vektor mit (100.0, 100.0)
    vec2 shift = vec2(100.0);
    // Erstelle eine Rotation der Koordinaten (rot) um 90°
    mat2 rot = mat2(cos(0.5), sin(0.5),
    -sin(0.5), cos(0.50));
    // Iteriere über alle Octaven
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        // Addiere den aktuellen Wert (a) von Noise an die Ausgabe-Variable (v)
        v += a * getNoise(coordinates);
        // Rotiere und verschiebe die Koordinaten coordinates
        coordinates = rot * coordinates * 2.0 + shift;
        // Halbiere den Hilfs-Wert (a)
        a *= 0.5;
    }
    // Gebe den berechneten fBm Wert (v) zurück
    return v;
}

// Diese Funktion erstellt einen Hintergrund anhand der aktuellen Auflösung (resolution) und der aktuellen Zeit (time)

vec3 CreateBackground() {
    // Berechne die Koordinaten (coordinates) anhand der aktuellen Fragment-Koordinaten und der Auflösung
    vec2 coordinates = gl_FragCoord.xy / u_resolution.xy * 3.0;
    
    // Mappe die Koordinaten so, dass der Ursprung in der Mitte des Bildschirm liegt
    coordinates -= 1.5;
    
    // Skaliere die Koordinaten mit der Zeit, sodass es so aussieht, als ob sich die Kamera nach vorne und hinten bewegt.
    coordinates = coordinates * (sin(u_time * 0.1) * 1.6 + 2.9);
    
    // Initialisiere die Farbe (color) als Schwarz
    vec3 color = vec3(0.0);
    
    // Berechne den Vektor (brownianMotionStepOne) anhand der Koordinaten (coordinates) und der aktuellen Zeit
    vec2 brownianMotionStepOne = vec2(0.);
    brownianMotionStepOne.x = CalculatefBm(coordinates + 0.00 * u_time);
    brownianMotionStepOne.y = CalculatefBm(coordinates + vec2(1.0));
    // Berechne den Vektor (r) anhand von (brownianMotionStepOne), (coordinates) und der aktuellen Zeit
    vec2 brownianMotionStepTwo = vec2(0.);
    brownianMotionStepTwo.x = CalculatefBm(coordinates + 1.0 * brownianMotionStepOne + vec2(1.7, 9.2) + 0.15 * u_time);
    brownianMotionStepTwo.y = CalculatefBm(coordinates + 1.0 * brownianMotionStepOne + vec2(8.3, 2.8) + 0.126 * u_time);
    // Berechne den Wert (brownianMotionStepThree) anhand von (coordinates), (brownianMotionStepOne) und (r)
    float brownianMotionStepThree = CalculatefBm(coordinates + brownianMotionStepTwo);
    // Vermische die Farbe (color) mit Weiß anhand von (brownianMotionStepThree)
    color = mix(  vec3(1.0, 1.0, 1.0),
                    color,
                    clamp((brownianMotionStepThree * brownianMotionStepThree) * 4.0, 0.0, 1.0));

    color = mix(color,
                vec3(1.0, 1.0, 1.0),
                clamp(length(brownianMotionStepOne),0.0,1.0));

    color = mix(color,
                vec3(0.6471, 0.9137, 0.9059),
                clamp(length(brownianMotionStepTwo.x),0.0,1.0));
    return 1. - vec3((brownianMotionStepThree*brownianMotionStepThree*brownianMotionStepThree+.6*brownianMotionStepThree*brownianMotionStepThree+.5*brownianMotionStepThree)*color);
}

// Diese Funktion bewegt Fliesen anhand des gegebenen Zooms (zoom) und Geschwindigkeit (speed)

vec2 MovingTiles(vec2 currentCoords, float zoom, float speed) {
    // Skaliere die aktuellen Koordinaten (currentCoords) anhand des Zooms
    currentCoords *= zoom;
    
    // Berechne die aktuelle Zeit anhand der Geschwindigkeit (speed)
    float time = u_time * speed;
    
    // Ändere die x Koordinaten der Fließe in einer periodischen Art und Weise
    if (fract(time) > 0.5) {
        if (fract(currentCoords.y * 0.5) > 0.5) {
            currentCoords.x += fract(time) * 2.0;
        } else {
            currentCoords.x -= fract(time) * 2.0;
        }
    } else {
    // Ändere die y Koordinaten der Fließe in einer periodischen Art und Weise
    if (fract(currentCoords.x * 0.5) > 0.5) {
            currentCoords.y += fract(time) * 2.0;
        } else {
            currentCoords.y -= fract(time) * 2.0;
        }
    }
    // Rückgabe des ganzzahligen Bruchteils der aktuellen Koordinaten
    return fract(currentCoords);
}

// Diese Funktion berechnet die Formen in einem 2D-Raum anhand der gegebenen Seitenanzahl und der Koordinaten (_st)

vec3 CalculateForms(vec2 currentCoords, int numOfSides) {
    // Transformiere die Koordinaten von (currentCoords) in den Bereich von (-1,1)
    currentCoords = currentCoords * 2. - 1.;
    
    // Berechne den Winkel (angle) zwischen dem Ursprung und den gegebenen Koordinaten (currentCoords)
    float angle = atan(currentCoords.x, currentCoords.y) + PI;
    
    // Berechne den Winkel (angleBetweenSides) zwischen benachbarten Seiten einer Form
    float angleBetweenSides = (2. * PI) / float(numOfSides);
    
    // Berechne den Abstand (distance) zwischen dem Ursprung und der gegebenen Koordinate (currentCoords) auf der aktuellen Form
    float distance = cos(floor(0.5 + angle / angleBetweenSides) * angleBetweenSides - angle) * length(currentCoords);
    
    // Rückgabe des Vektors (1.0 - glatt gesteppte Funktion des Abstandes (distance))
    return vec3(1.0 - smoothstep(1.0 - 0.2, 1.0 - 0.22 + 0.45 * 0.2, distance));
}

void main() {
    vec2 coordinates = gl_FragCoord.xy/u_resolution.xy;
    float randomValue = (coordinates.x/2.)-(0.5*sin((coordinates.x)*(3.)+0.5) + coordinates.y)/2.0;//(gl_FragCoord.x+gl_FragCoord.y)/(u_resolution.x+u_resolution.y);
    coordinates.x /= u_resolution.y/u_resolution.x;                         // Die x-Koordinate des Punktes "coordinates" wird im Verhältnis zum Seitenverhältnis der Auflösung (u_resolution.y / u_resolution.x) skaliert.
    coordinates = MovingTiles(coordinates, pattern_zoom, pattern_speed);
    vec3 color = vec3( (1.-CreateBackground()) - ((CalculateForms(coordinates, pattern_sides)-CreateBackground()) - CalculateFormContent(coordinates, randomValue)) * (0. + CalculateForms(coordinates, pattern_sides)));//+boxFilling(st, randomValue));// + boxFilling(st, 5.));

    gl_FragColor = vec4(color,1.0);
}

