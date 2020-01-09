# Własny serwer podkładów mapowych OSM

## Wymagania 
- Docker
- docker-compose
- ImageMagick

## Uruchomienie podstawowej wersji serwera

Pobieranie geometrii Polski:
```
wget http://download.geofabrik.de/europe/poland-latest.osm.pbf
```

Zmiana nazwy pliku:
```
mv poland-latest.osm.pbf /tmp/import.pbf
```

Pobieramy obraz dockera: (uwaga jeżeli chcesz pobrać najnowszą wersję to trzeba zmienić numer wersji przy nazwie obrazu oraz zwrócić uwagę (w logach) na jakiej bazie uruchamia się kontener w kroku 6, bo v1.3.9 uruchamia się na Postgresie 12 i jeżeli w nowszym obrazie będzie inna wersja postgresa to trzeba zmienić wersję postgresa w ścieżce w kroku 6 oraz w pliku docker-compose.yml, żeby działały mapowania volumów)
```
docker pull overv/openstreetmap-tile-server:v1.3.9
``` 

Tworzymy volume dla bazy danych będą ta przetrzymywane tam geo dane:
```
docker volume create openstreetmap-data
```

Tworzymy volume dla zrederowanych podkładów:
```
docker volume create openstreetmap-rendered-tiles
```

Uruchamiamy kontener który importuje plik .pbf do bazy
```
docker run -v /tmp/import.pbf:/data.osm.pbf -v openstreetmap-data:/var/lib/postgresql/12/main overv/openstreetmap-tile-server import
```

W dowolnym miejscu tworzymy plik `docker-compose.yml` (patrz repo)

Uruchamiamy serwer podkładów:
```
docker-compose up -d
```

Utworzyć plik `calculate_lat_long_to_x_y_tile.js` (patrz repo), podać na końcu pliku współrzędne dla każdego poziomu szczegółowości. Dla prostokąta o tych współrzędnych zostaną wygenerowane wartości X i Y, które posłużą do wygenerowania podkładów. Współrzędne można odczytać np. ze strony http://tools.geofabrik.de/calc zakładka CD. Uruchomić skrypt, na ekranie zostaną wyświetlone wartości, które należy przekopiować do skryptu renderującego podkłady w następnym kroku.

Tworzymy plik `force_render_tile.groovy` wklejając współrzędne z poprzedniego skryptu i wpisując w zmienną `tileUrl` swój serwer podkladów uruchomiony w dockerze.

Uruchamiamy skrypt pre-renderujący podkłady, w pliku groovy trzeba odkomentowywać po kolei każdy poziom i puszczać skrypt, na koniec jeszcze raz puścić każdy poziom, aby upewnić się, że wszystkie poziomy są kompletnie wygenerowane - za pierwszym razem skrypt wykonuje się długo dla dużego poziomu szczegółowości, za drugim razem wykonuje się w kilkanaście-kilkadziesiąt sekund. Celem skryptu jest pobranie wszystkich kafelków do volume dockerowego, aby w przyszłości serwer czytał dane tylko z dysku. Gdybyśmy tego nie zrobili to za każdym razem, gdy nie byłoby jakiegoś kafelka na dysku to szedłby request generujący kafelki i czas oczekiwania na pokazanie w przeglądarce bylby dłuższy.
```
docker run --rm -v "$PWD":/home/groovy/scripts -w /home/groovy/scripts groovy:latest groovy force_render_tile.groovy
```

Wchodzimy w kontener, aby edytować plik `/etc/apache2/sites-available/000-default.conf`:
```
docker exec -it tileserver bash
```

Edytujemy zawartość pliku `000-default.conf` (patrze repo) - zmiana wynika z tego, aby nie oznaczać już zrenderowanych kafelków jako dirty po czasie X godzin, zmienna `ModTileBulkMode`

Serwer podkładów jest gotowy z defaultowym podkładem i można go używać. Jeżeli jest potrzeba serwowania własnych podkładów, np. w kolorze szarym i ciemnym - należy wykonać dalsze instrukcje z rozdziału Tworzenie własnych podkładów.


## Tworzenie własnych podkładów
Głównym zadaniem jest przekonwertowanie plików .meta do .png, aby następnie można było pliki .png poddać skryptowi nadającemu szarość kafelkom. Jak będą wygenerowane kafelki w kolorze szarym to na ich podstawie zostanie zrobiony invert kolorów i otrzymamy podkład w ciemnych kolorach.

Na koniec serwer podkładów zostanie zastąpiony przez serwer nginx, który będzie serwował pliki .png dla trzech podkładów: default, gray i dark.



Musi być zainstalowany ImageMagick convert, można sprawdzić, czy jest poleceniem `convert --version`

Wejść do kontenera:
```
docker exec -it tileserver bash
```

Przejść do katalogu:
```
cd /home/renderer/src/mod_tile/extra
```

Wykonać polecenie:
```
make
```

Utworzyć katalog na pliki .png przekonwertowane z plików .meta, np.:
```
mkdir /var/lib/mod_tile/ajt-png
```

Konwersja plików z .meta do .png:
```
./meta2tile /var/lib/mod_tile/ajt /var/lib/mod_tile/ajt-png
```

Skopiowanie katalogu z png do nowego katalogu (w katalogu ajt-png będą pliki .png dla defaultowego podkładu, w katalogu gray będą pliki .png dla podkładu w szarości): 
```
cp -R /var/lib/mod_tile/ajt-png /var/lib/mod_tile/gray
```

W `/var/lib/mod_tile` utworzyć plik konwertujący do szarości `gray.sh` (patrz repo)

Wyjść z kontenera `ctrl+D`

Na hoście przejść do lokalizacji `/var/lib/docker/volumes/openstreetmap-rendered-tiles/_data`, jeżeli volume jest podmapowany to powinny być tutaj pliki

Odpalić skrypt `gray.sh`, będzie to trwało długo, można puszczać etapami każdy poziom (zalecane) wstawiając w miejsce pierwszej * numer poziomu zoom w skrypcie

Powtórzyć kroki z wykorzystaniem skryptu `dark.sh` (jedyna różnica - należy skopiować kafelki w kolorze szarym i to na nich będziemy robić inwersję kolorów):

W tym momencie w lokalizacji `/var/lib/docker/volumes/openstreetmap-rendered-tiles/_data` powinny być foldery z kafelkami w kolorze default (ajt-png), gray i dark. 

Przenieść trzy foldery z podkładami do docelowego miejsca, gdzie będą przechowywane, np. `/home/tile`. W tym folderze powinny znaleźć się trzy foldery z podkladami, np. gray, dark i default. Do każdego z tych folderów wkleić plik `test-tile-server.html` (patrz repo) dzięki, któremu będzie można testować podkłady. W każdym pliku zmodyfikować maksymalny dozwolony zoom i adres serwera, np. `http://my-tile-server/dark/{z}/{x}/{y}.png`

Utworzyć folder, np. `/home/nginx` z plikiem konfiguracyjnym `nginx.conf`

Uruchomić serwer nginx, np. z konfiguracji docker-compose:
```
version: '3'
 
services:
  nginx:
    container_name: nginx
    restart: always
    image: nginx:1.17.6
    ports:
      - 80:80
    volumes:
      - /home/tile:/usr/share/nginx/data/tiles/ #podmapowana ścieżka do plików z podkładami
      - /home/nginx/nginx.conf:/etc/nginx/nginx.conf #podmapowana ścieżka do konfiguracji nginxa
 ```

W tym momencie można przeglądać podkłady w przeglądarce:
```
http://my-tile-server/default/
http://my-tile-server/dark/
http://my-tile-server/gray/
```

Można usunąć stary serwer podkładów uruchomiony w dockerze tileserver oraz wszystkie pliki, które były wykorzystane do wygenerowanie kafelków .png.

### Uwagi:
Lokalizacja wygenerowanych kafelków `/var/lib/mod_tile/`

Lokalizacja pliku konfiguracyjnego do generowania kafelków `/usr/local/etc/renderd.conf`

### Ciekawe linki

Mapa pozwalająca zrozumieć pozycje kafelków: http://tools.geofabrik.de/map/#8/53.2877/16.6569&type=Geofabrik_Standard&grid=1

Postawienie serwera: https://www.grzegorzkowalski.pl/serwer-kafelkowy-osm-szybko-i-bezbolesnie-dzieki-dockerowi/

Szersza instrukcja dla twardych: https://switch2osm.org/manually-building-a-tile-server-16-04-2-lts/

Teoria wyliczania kafelków: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

Zapobieganie ciągłego renderowania się podkładu kiedy zostaje oznaczony jako dirty https://forum.openstreetmap.org/viewtopic.php?id=52795 https://wiki.openstreetmap.org/wiki/Mod_tile#tile_expiry
