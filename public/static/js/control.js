
function Control_Chart() {

    var obj_station = {
        '大小': 5,
        '颜色': "#eae33f",
        '透明度': 0.5
    };

    var obj_road = {
        '宽度': 2,
        '透明度': 0.5
    };
    var gui = new dat.gui.GUI();

    var f1 = gui.addFolder('站点样式');
    var station_size = f1.add(obj_station, '大小').min(1).max(10).step(0.1).listen();
    var station_color = f1.addColor(obj_station, '颜色').listen();
    var station_opacity = f1.add(obj_station, '透明度').min(0).max(1).step(0.1).listen();

    var f2 = gui.addFolder('道路样式');
    var road_width = f2.add(obj_road, '宽度').min(1).max(5).step(0.1).listen();
    var road_opacity = f2.add(obj_road, '透明度').min(0).max(1).step(0.1).listen();

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