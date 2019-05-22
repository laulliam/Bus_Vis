
function Control_Chart() {

    d3.select("#control_main").html('');

    var control = $("#control_main");

    var obj_station = {
        '站点大小': 5,
        '站点颜色': "#eae33f",
        '站点透明度': 0.5
    };

    var obj_road = {
        '路线宽度': 2,
        '路线透明度': 0.7
    };
    var gui = new dat.gui.GUI();

    gui.width = control.width();

    var f1 = gui.addFolder('样式设置');
    var station_size = f1.add(obj_station, '站点大小').min(1).max(10).step(0.1).listen();
    var station_color = f1.addColor(obj_station, '站点颜色').listen();
    var station_opacity = f1.add(obj_station, '站点透明度').min(0).max(1).step(0.1).listen();
    var road_width = f1.add(obj_road, '路线宽度').min(1).max(5).step(0.1).listen();
    var road_opacity = f1.add(obj_road, '路线透明度').min(0).max(1).step(0.1).listen();

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

    var customContainer = document.getElementById('control_main');
    customContainer.appendChild(gui.domElement);
}
Control_Chart();