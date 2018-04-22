/**
 * Created by Liang Liu on 2018/1/27.
 */

function routes_radar(route_data) {

    var margin = {top: 20, right: 20, bottom: 0, left: 20};

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var width = (body_width * 0.15 -  border);
    var height = (body_height * 0.25 );

    var color = d3.scale.ordinal()
        .range(["#EDC951","#CC333F","#00A0B0","#ff5a29","#2f71b0","#ff9b15","#570eb0","#883378"]);

    var radarChartOptions = {
        w: width*0.85,
        h: height*0.85,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
    };
//Call function to draw the Radar chart
    RadarChart(".radarChart", route_data, radarChartOptions);
}