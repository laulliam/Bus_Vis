function Control_Chart() {

        var obj_station = {
            'Map Style': 'dark',
            'Size': 1,
            'Color': "#ff2513",
            'Opacity': 1
        };

        var obj_road = {
            'Width': 1,
            'Opacity': 1
        };
        var gui = new dat.gui.GUI();
        var layout_text = gui.add(obj_station, 'Map Style', ['dark','basic','bright','light','satellite']);

        layout_text.onChange(function (value) {
                    map.setStyle('mapbox://styles/mapbox/' +value+ '-v9');
        });

        var f1 = gui.addFolder('Station Style');
        var station_size = f1.add(obj_station, 'Size').min(1).max(5).step(0.1).listen();
        var station_color = f1.addColor(obj_station, 'Color').listen();
        var station_opacity = f1.add(obj_station, 'Opacity').min(0).max(1).step(0.05).listen();

        var f2 = gui.addFolder('Road Style');
        var road_width = f2.add(obj_road, 'Width').min(1).max(5).step(0.1).listen();
        var road_opacity = f2.add(obj_road, 'Opacity').min(1).max(5).step(0.1).listen();

        f1.open();
        f2.open();

        var customContainer = document.getElementById('control');
        customContainer.appendChild(gui.domElement);
}
    Control_Chart();

    var STATION_COLOR = "#ff2513";