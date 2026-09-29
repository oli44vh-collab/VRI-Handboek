# Bron van de dataset

## Wat er in deze map zit

| Bestand | Waarvoor |
|---|---|
| `Handboek_VRI_13-07-2026-origineel.docx` | Het brondocument. **Intrekken bij go-live** — twee bronnen van waarheid is erger dan één slechte. |
| `handboek-vri-alles-2026.07.csv` | Alle 2.349 locaties in bewerkbare vorm. Dezelfde CSV die de app exporteert via Beheer → Databeheer → "Alles". |
| `coordinaten-koppeling-2026-07.csv` | Verantwoording van de koppeling: per regel het objectnummer, het coördinaat en drie kwaliteitsvlaggen. |

Deze map is niet nodig om de app te laten draaien. Hij is er zodat iemand
over vijf jaar kan reconstrueren waar de gegevens vandaan komen.

---


`assets/data.js` is samengesteld uit twee bestanden:

1. **`Handboek_VRI_13-07-2026.docx`** — 2.349 locaties over 15 contracten,
   met (waar bekend) fabrikant, VRA-nummer en voltage.
2. **`Standaard_Import_Onderhoudsobjecten - VRI (Corinne).xlsx`** — 2.376
   onderhoudsobjecten met objectnummer en GPS-coördinaat.

## Hoe ze gekoppeld zijn

De twee bestanden delen geen sleutel. Het kruispuntnummer is niet uniek —
K001 bestaat in Delft, Gouda én Voorne aan Zee. De koppeling is daarom
gemaakt op **kruispuntnummer + straatnaam**, waarbij bij dubbele nummers
de straatnaam de doorslag geeft.

Resultaat: 2.343 van de 2.349 handboekregels gematcht, waarvan 1.913 met
een bruikbaar coördinaat.

## `coordinaten-koppeling-2026-07.csv`

Per handboekregel: het gekoppelde objectnummer, het coördinaat, en drie
vlaggen die je vertellen hoe hard het is.

| `geo_kwaliteit` | Aantal | Betekenis |
|---|---|---|
| `ok` | 1.909 | Coördinaat gevonden, ligt in Nederland |
| `ontbreekt` | 435 | Geen coördinaat in de bron |
| `controleren` | 4 | Meerdere kandidaten, niet met zekerheid op te lossen |
| `FOUT-buiten-NL` | 1 | H32009009 Spoorsingel: `4353332` moet `4.353332` zijn |

`geo_nauwkeurigheid` staat overal op **`onbekend`**. Het is niet vastgesteld
of deze coördinaten de kast aanwijzen of het midden van het kruispunt. Voor
een monteur om 03:00 is dat verschil geen detail. Vaststellen kost vijf minuten:
ga naast een kast staan en kijk of het klopt.

## Ontbrekende coördinaten aanvullen

| Waar | Hoeveel | Waarschijnlijk de snelste weg |
|---|---|---|
| HTM-haltes | 291 | DOVA Halteviewer / Centraal Halte Bestand |
| KO Hartog | 135 | Staan wél in het bestand, mét objectnummer — vraag KO Hartog om de coördinaten |
| Zuidplas | 6 | Komen niet voor in het bestand — vraag de gemeente |
| Losse | 4 | Handmatig |

Of laat de monteurs het doen: zij staan het hele jaar naast die kasten.
