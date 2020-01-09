//http://tools.geofabrik.de/map/#8/53.2877/16.6569&type=Geofabrik_Standard&grid=1
def zoom = 0, xMin = 0, xMax = 0, yMin = 0, yMax = 0
//def zoom = 1, xMin = 1, xMax = 1, yMin = 0, yMax = 0
//def zoom = 2, xMin = 2, xMax = 2, yMin = 1, yMax = 1
//def zoom = 3, xMin = 4, xMax = 4, yMin = 2, yMax = 2
//def zoom = 4, xMin = 8, xMax = 9, yMin = 5, yMax = 5
//def zoom = 5, xMin = 17, xMax = 18, yMin = 10, yMax = 11
//def zoom = 6, xMin = 34, xMax = 36, yMin = 20, yMax = 22
//def zoom = 7, xMin = 68, xMax = 72, yMin = 40, yMax = 44
//def zoom = 8, xMin = 137, xMax = 145, yMin = 80, yMax = 88
//def zoom = 9, xMin = 275, xMax = 290, yMin = 161, yMax = 176
//def zoom = 10, xMin = 551, xMax = 580, yMin = 323, yMax = 352
//def zoom = 11, xMin = 1103, xMax = 1161, yMin = 647, yMax = 705
//def zoom = 12, xMin = 2206, xMax = 2323, yMin = 1295, yMax = 1411
//def zoom = 13, xMin = 4413, xMax = 4647, yMin = 2590, yMax = 2823
//def zoom = 14, xMin = 8827, xMax = 9295, yMin = 5180, yMax = 5646
//def zoom = 15, xMin = 17655, xMax = 18591, yMin = 10361, yMax = 11293
//def zoom = 16, xMin = 35311, xMax = 37182, yMin = 20722, yMax = 22586


def tileUrl = "http://tile-server-url/tile"

def render = {
    (xMin..xMax).each { x ->
        (yMin..yMax).each { y ->
            def link = "${tileUrl}/${zoom}/${x}/${y}.png"
            println "get $link"
            try {
                new URL("${tileUrl}/${zoom}/${x}/${y}.png").text
            } catch (FileNotFoundException ex) {
                println("Broken on ${ex} sleep 40s")
                sleep(40000)
            }
        }
    }
    println("End render for zoom ${zoom}")
}

render.call()
