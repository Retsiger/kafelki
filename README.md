# Kafelki

Prosty projekt prezentujący stronę z kafelkami linków. Dane kafelków
zapisywane są na serwerze, więc zmiany wprowadzone w panelu administracyjnym
są widoczne dla wszystkich odwiedzających. Wszystkie edycje wykonane z poziomu
strony trafiają do pliku `tiles.json` na serwerze i pozostają zachowane między
kolejnymi uruchomieniami. Bez logowania można jedynie
przeglądać i otwierać linki. Aby móc dodawać i edytować kafelki należy się
zalogować używając domyślnego hasła `admin123`.

## Uruchomienie lokalne

1. Zainstaluj zależności poleceniem `npm install`.
2. Uruchom serwer: `npm start`, następnie otwórz przeglądarkę na `http://localhost:3000`.
3. Po zalogowaniu można dodawać nowe kafelki, edytować istniejące, usuwać je
   oraz zmieniać ich kolejność między rzędami. Można również tworzyć puste rzędy.
   Dostępna jest też opcja tworzenia kafelka-kategorii z listą podlinków,
   która rozwija się po najechaniu na kafelek. Sama kategoria nie prowadzi do
   innej strony, a elementy listy są oddzielone cienką czarną linią dla lepszej
   czytelności. Każdemu kafelkowi (również kategorii) można ustawić dowolny
   kolor tła, wybierając go w formularzu dodawania lub podając podczas edycji.
   Kolor rozwijanej listy w kategorii pozostaje zawsze biały.

Na dole strony widoczna jest stała stopka "Kafelki v2 by MARWDO".

## Publikowanie na hosting bez Node.js

Po zakończeniu edycji lokalnej cały katalog projektu wraz z plikiem `tiles.json`
można skopiować na dowolny darmowy hosting obsługujący statyczne pliki. Po
wysłaniu na serwer edycja nie będzie możliwa (panel logowania się nie pojawi),
ale kafelki wczytają się z `tiles.json` i będą widoczne dla odwiedzających.
