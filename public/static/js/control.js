function Control_Chart() {

        var obj = {
            '布局': '分布信息',
            '节点尺寸': 1,
            '节点颜色': "#ff0000",
            '节点透明度': 1,
        };
        var now_layout = null;
        var gui = new dat.gui.GUI();
        var layout_text = gui.add(obj, '布局', ['分布信息', '热力图','分布','外来人口分布']);
        layout_text.onChange(function (value) {
            clearMainChart();
            switch (value) {
                case '分布信息':
                    break;
                case '分布':
                    break;
                case '热力图':
                    break;
                case '外来人口分布':
                    break;
                default:
                    break;
            }
        });
        var f1 = gui.addFolder('test');
        var node_size = f1.add(obj, '节点尺寸').min(1).max(5).step(0.1).listen();
        var node_color = f1.addColor(obj, '节点颜色').listen();
        var node_opacity = f1.add(obj, '节点透明度').min(0).max(1).step(0.05).listen();

        node_size.onFinishChange(function (value) {
            now_layout.setNodeSize(value);
        });
        node_color.onFinishChange(function (value) {
            now_layout.setNodeColor(value);
        });
        node_opacity.onFinishChange(function (value) {

            now_layout.setNodeOpacity(value);
        });
        f1.open();
        var customContainer = document.getElementById('control');
        customContainer.appendChild(gui.domElement);
        var clearMainChart = function () {
            $("#main").empty();
        };
}
    Control_Chart();