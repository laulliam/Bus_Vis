function Control_Chart() {

    var obj_station = {
        'Size': 5,
        'Color': "#eae33f",
        'Opacity': 0.5
    };

    var obj_road = {
        'Width': 2,
        'Opacity': 0.5
    };
    var gui = new dat.gui.GUI();

    var f1 = gui.addFolder('Station Style');
    var station_size = f1.add(obj_station, 'Size').min(1).max(10).step(0.1).listen();
    var station_color = f1.addColor(obj_station, 'Color').listen();
    var station_opacity = f1.add(obj_station, 'Opacity').min(0).max(1).step(0.1).listen();

    var f2 = gui.addFolder('Road Style');
    var road_width = f2.add(obj_road, 'Width').min(1).max(5).step(0.1).listen();
    var road_opacity = f2.add(obj_road, 'Opacity').min(0).max(1).step(0.1).listen();

    station_size.onFinishChange(function (value) {
        map.setPaintProperty('station', 'circle-radius',value);
    });

    station_color.onFinishChange(function (value) {
        map.setPaintProperty('station', 'circle-color',value);
    });

    station_opacity.onFinishChange(function (value) {
        map.setPaintProperty('station', 'circle-opacity',value);
    });

    road_width.onFinishChange(function (value) {
        map.setPaintProperty('section', 'line-width',value);
    });

    road_opacity.onFinishChange(function (value) {
        map.setPaintProperty('section', 'line-opacity',value);
    });

    f1.open();
    f2.open();

    var customContainer = document.getElementById('control');
    customContainer.appendChild(gui.domElement);
}
Control_Chart();