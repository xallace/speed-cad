# ⚡ SpeedCAD: Blueprint Blitz (3D CAD Speedrunner)

Ein rasanter Hybrid aus **parametrischer 3D-CAD-Modellierung** und **präzisem Speedrunning**.

Stelle dich dem Fertigungstakt im orbitalen Hochleistungswerk: Unfertige Werkstücke laufen über das Fließband – deine Aufgabe ist es, die Maße und Toleranzen holografischer Blueprints in Millisekunden abzugleichen und per Hydraulikpresse fehlerfrei zu schmieden!

🌐 **Live spielen (GitHub Pages):** [https://xallace.github.io/speed-cad/](https://xallace.github.io/speed-cad/)

---

## 🎮 Gameplay & Spielmechanik

* **Das Ziel (Blueprint Target):**
  * Jede Stufe stellt dir eine holografische Blaupause (*Wireframe Ghost*) mit Soll-Bemaßungen (z. B. Durchmesser, Zähnezahl, Bohrung, Wandstärke).
* **Die Toleranz (ISO IT-Grades):**
  * **Rot (Ausschuss):** Abweichung $> 5\text{ mm}$ – Vorzeitiger Commit bringt **+3.00s Strafzeit**!
  * **Gelb (Nah dran):** Abweichung $1\text{ mm} - 5\text{ mm}$.
  * **Cyan / Grün (In Toleranz):** Abweichung $\le 1.0\text{ mm}$ – Bauteil ist abnahmefähig!
  * **Pulsierendes Grün (Perfekt / IT6):** Abweichung $\pm 0.0\text{ mm}$ – Maximaler Speedrun-Score!
* **Die Hydraulikpresse (Commit):**
  * Drücke `LEERTASTE`, um das Werkstück im perfekten Moment zu stanzen. Bei Erfolg explodieren Funken, der Split wird geloggt und die nächste Stufe startet nahtlos.

---

## 🏆 Die 5 Speedrun-Splits (Any%)

1. **Hydraulik-Kolben / Stufenwelle:** Abstimmung von Hublänge, Kolbendurchmesser und Wellenbund.
2. **Evolventen-Stirnrad:** Zähnezahl, Modul und Zahnbreite passend zum Getriebesatz.
3. **Hochdruck-Flansch:** Flanschdurchmesser, Lochkreis und Schraubenanzahl konfigurieren.
4. **Aero-Leichtbaukonsole:** Aussparungsradius zur Gewichtsoptimierung austarieren.
5. **Avionik-Gehäuse (Finale):** Millimetergenaue Gehäusepassung mit Wandstärke.

---

## ⌨️ Speedrunner-Steuerung (Hotkeys)

* `1` bis `4` : Parameter direkt anwählen
* `A` / `D` oder `←` / `→` : Wert schnell verändern
* `Shift` + Pfeiltaste : 5-fache Schrittweite für rasante Sprünge
* `LEERTASTE` : **Bauteil schmieden & abnehmen (Forge & Commit)**
* `R` : Schneller Reset (Instant Run Restart)
* `Maus` : Drehen (Linke Taste), Zoomen (Mausrad)

---

## 🛠️ Technische Umsetzung

* **3D-Rendering:** Three.js mit OrbitControls, dynamischem PBR-Shader und holografischem Blueprint-Wireframe.
* **Sound-Design:** Reine Web Audio API Synthese (hydraulischer Stempel, Servomotoren-Feedback, Split-Fanfare).
* **High-Precision Timing:** `performance.now()` mit Millisekunden-Präzision und LiveSplit-Deltas (`+` / `-`).
* **Personal Best:** Speicherung der Rekordzeiten im Browser (`localStorage`).
