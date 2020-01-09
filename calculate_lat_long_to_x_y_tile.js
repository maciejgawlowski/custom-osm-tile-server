function toxy(zoom,
    lulong, luvlat,
    // lllong, lllat,
    // rulong, rulat,
    rllong, rllat
) {
var xMinTile = long2tile(lulong, zoom);
var yMinTile = lat2tile(luvlat, zoom);

var xMaxTile = long2tile(rllong, zoom);
var yMaxTile = lat2tile(rllat, zoom);

console.info(
"def zoom = " + zoom + ", " +
"xMin = " + xMinTile + ", " +
"xMax = " + xMaxTile + ", " +
"yMin = " + yMinTile + ", " +
"yMax = " + yMaxTile
)
}

function tolonlat() {

var vzoom = document.forms.Form1.zoom.value;
var xlong = 3.12;
xlong = document.forms.Form1.xlong.value;
var ylat = document.forms.Form1.ylat.value;
document.forms.Form1.long.value = xlong = tile2long(xlong, vzoom);
document.forms.Form1.lat.value = ylat = tile2lat(ylat, vzoom);

}

function long2tile(lon, zoom1) {
tt = Number(lon);
return (Math.floor((tt + 180) / 360 * Math.pow(2, zoom1)));
}

function lat2tile(lat, zoom2) {
return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom2)));
}

function tile2long(x, z) {
return (x / Math.pow(2, z) * 360 - 180);
}

function tile2lat(y, z) {
var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

toxy(0, 13.97, 55.02, 24.25, 48.71)
toxy(1, 13.97, 55.02, 24.25, 48.71)
toxy(2, 13.97, 55.02, 24.25, 48.71)
toxy(3, 13.97, 55.02, 24.25, 48.71)
toxy(4, 13.97, 55.02, 24.25, 48.71)
toxy(5, 13.97, 55.02, 24.25, 48.71)
toxy(6, 13.97, 55.02, 24.25, 48.71)
toxy(7, 13.97, 55.02, 24.25, 48.71)
toxy(8, 13.97, 55.02, 24.25, 48.71)
toxy(9, 13.97, 55.02, 24.25, 48.71)
toxy(10, 13.97, 55.02, 24.25, 48.71)
toxy(11, 13.97, 55.02, 24.25, 48.71)
toxy(12, 13.97, 55.02, 24.25, 48.71)
toxy(13, 13.97, 55.02, 24.25, 48.71)
toxy(14, 13.97, 55.02, 24.25, 48.71)
toxy(15, 13.97, 55.02, 24.25, 48.71)
toxy(16, 13.97, 55.02, 24.25, 48.71)