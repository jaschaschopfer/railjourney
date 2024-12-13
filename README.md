241213 Entscheid für simple VIAs für LOIs ohne Aufenthaltsdauer.
1. Maximal 5 Vias nicht sehr störend, da LOIs ohne Aufenthalsdauer ja mehr zum Zusteigen von Personen nützen soll und nicht für Aufenthalte (wofür flexjourney primär ist).
Zusätzlich setzen sich die 5 Vias immer zurück, wenn ein LOI eingefügt wurde. Da die API ja ab dort eine neue Abfrage macht.
2. Vorteil der Via Nutzung ist die korrekte Berechnung der Umsteigezeiten: Werden VIAs nicht als LOIs weitergegeben für die Neuberechnung einer Gesamtverbindung gibt es nicht das Problem, dass plötzlich eine zu kurze Umsteigezeit berechnet wird. (BEISPIEL A)

BEISPIEL A:
Egghölzli via Bern nach Bolligen --> Die API berechnet die Zeit zum Umsteigen korrekt
Egghölzli LOI Bern nach Bolligen --> Die API berechnet Abfahrtszeit von Bern nach Bolligen evtl. zu knapp, weil bei der manuellen Neuberechnung ab Bern nicht mehr der Ankunftsort vom T6 am Trambahnhof berechnet wird. Die Umsteigezeit fällt also komplett weg.



Entscheid gegen VIA als Parameter einführen, weil:
1. Maximal 5 ViaS möglich. Diese Einschränkung wollen wir nicht
2. Via wäre nicht mehr ersichtlich in Darstellung, bräuchte separate Logik
--> Vias werden als LOI angezeigt (auch möglich mit Aufenthalt 0min). Dabei muss beachtet werden, dass

![Bildschirmfoto 2024-12-13 um 20 18 26](https://github.com/user-attachments/assets/f779e5b9-c12e-4052-9e49-ec1cb48d990a)



Walks vor und nach Reise hatten nie duration angegeben. Das musste ich separat rechnen mit departure und arrival.


