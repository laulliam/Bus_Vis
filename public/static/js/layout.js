function Layout() {

    var all_view = $(".all_view");
    var width = all_view.width();
    var height = all_view.height();

    var header = document.getElementById('header');
    header.style.width = width * 0.99  + 'px';
    header.style.height = height * 0.08 + 'px';

    var control = document.getElementById('control');
    control.style.width = width * 0.2 + 'px';
    control.style.height = height * 0.2 + 'px';

    var control_main = document.getElementById('control_main');
    control_main.style.width = width * 0.2 + 'px';
    control_main.style.height = height * 0.2 + 'px';

    var map = document.getElementById('map');
    map.style.width = width * 0.58 + 'px';
    map.style.height = height * 0.65 + 'px';

    var information = document.getElementById('information');
    information.style.width = width * 0.2 + 'px';
    information.style.height = height * 0.2 + 'px';

    var calendar = document.getElementById('calendar');
    calendar.style.width = width * 0.2 + 'px';
    calendar.style.height = height * 0.44 + 'px';

    var calendar_main = document.getElementById('calendar_main');
    calendar_main.style.width = width * 0.2 + 'px';
    calendar_main.style.height = height * 0.44*0.7 + 'px';

    var calendar_area = document.getElementById('calendar_area');
    calendar_area.style.width = width * 0.2 + 'px';
    calendar_area.style.height = height * 0.44*0.2 + 'px';

    var radar = document.getElementById('radar');
    radar.style.width = width * 0.2 + 'px';
    radar.style.height = height * 0.44 + 'px';

    var radar_main = document.getElementById('radar_main');
    radar_main.style.width = width * 0.2 + 'px';
    radar_main.style.height = height * 0.44 - 30 + 'px';

    var spiral_line = document.getElementById('spiral_line');
    spiral_line.style.width = width * 0.2 + 'px';
    spiral_line.style.height = height * 0.23 + 'px';

    var time_line = document.getElementById('time_line');
    time_line.style.width = width * 0.58 + 'px';
    time_line.style.height = height * 0.23 + 'px';

    var words_cloud = document.getElementById('words_cloud');
    words_cloud.style.width = width * 0.2 + 'px';
    words_cloud.style.height = height * 0.23 + 'px';

    var clouds_main = document.getElementById('clouds_main');
    clouds_main.style.width = width * 0.2 + 'px';
    clouds_main.style.height = height * 0.23 - 30 + 'px';


    d3.selectAll(".widgets_right").append("svg")
        .attr("width",width * 0.2 -10)
        .attr("height",18)
        .append("image")
        .attr("width",width * 0.2 -10)
        .attr("height",18)
        .attr("xlink:href","static/img/widget.png");

    d3.selectAll(".widgets_left").append("svg")
        .attr("width",width * 0.2 -10)
        .attr("height",18)
        .append("image")
        .attr("width",width * 0.2 -10)
        .attr("height",18)
        .attr("xlink:href","static/img/widget.png");


    d3.select("#header").append("div")
        .attr("class","header_left")
        .append("svg")
        .attr("width",width * 0.4 -10)
        .attr("height",38)
        .append("image")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width * 0.4 -10)
        .attr("height",38)
        .attr("xlink:href","static/img/1.png");

    d3.select("#header").append("div")
        .attr("class","header_right")
        .append("svg")
        .attr("width",width * 0.4 -10)
        .attr("height",38)
        .append("image")
        .attr("x",0)
        .attr("y",0)
        .attr("width",width * 0.4 -10)
        .attr("height",38)
        .attr("xlink:href","static/img/2.png");

    d3.select(".header_title").style("font-size",width/60+"px");

}
Layout();

var color_scale = ["#23D561","#9CD523","#F1E229","#FFBF3A","#FB8C00","#FF5252"];

$(window).resize(function () {
    window.location.reload();
});

