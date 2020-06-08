# v1.0 (utkast)

## Sessioner
- [x] Kan logga in med de MFA som StoredSafe stödjer idag (Yubico OTP, TOTP).
- [x] Kan logga ut manuellt.
- [ ] Inloggningen kan hållas vid liv.
- [x] Inloggningen expirerar automatiskt efter en tid av inaktivitet (default 15 min).
- [x] Inloggningen expirerar automatiskt efter en tid oavsett inaktivitet (default 180 min).

## Sök
- [x] Kan söka i StoredSafe genom popup.
  - [x] Kan kopiera innehåll i fält
  - [x] Kan visa innehåll i fält med normal text.
  - [ ] Kan visa innehåll i fält med stor text.
  - [x] Siffror, specialtecken, gemener och versaler visas i olika färger så att det är lätt att urskilja olika tecken.
  - [x] Kan visa (dekryptera) innehåll i fält.
  - [x] Kan fylla i fält på aktiv webbläsar-tabb.
    - [x] Kan skicka formulär efter att ha fyllt i fält.
- [x] Kan söka i bakgrunden när användaren navigerar till en hemsida (resultat cachade lokalt i webbläsaren (ej krypterade fält)).
  - [x] Kan automatiskt fylla i fält när användaren navigerar till en hemsida.
  - [x] Kan visa sökningar relaterade till aktiv webbläsar-tabb i popup-rutan när ingen manuell sökning har gjorts.

## Spara
- [ ] Lägg till nytt objekt i StoredSafe.
- [ ] Erbjud att spara information efter inloggning.
- [ ] Möjligt att "svartlista" specifika sajter från att erbjuda att spara inloggning.

## Gränssnitt
- [x] Separat sida för inställningar.
- [x] Popup-ruta
  - [x] Inloggning
  - [x] Sökning
  - [ ] **Lägg till objekt i StoredSafe** (påbörjad)
  - [ ] Lösenordsgenerator (del av lägg till objekt eller även som separat?)


# v2.0 (förslag)

## Sessioner
-  Byt ut utloggning efter inaktivitet mot PIN-kod som låser tillägget för att slippa göra en full inloggning efter kort inaktivitet.
  - Evenutellt kryptera pågående sessioner (sparad token) och cachade sökningar med hash av PIN-kod. (lagra hash lokalt i webbläsaren tills användaren har varit inaktiv en viss tid)
