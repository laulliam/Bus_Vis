/**
 * Created by Liang Liu on 2018/1/27.
 */
var margin = {top: 15, right: 10, bottom: 0, left: 10};

var border = 1;
var all_view = $("#all_view");
var body_width = all_view.width();
var body_height = all_view.height()-20;

var width = (body_width * 0.15 -  border);
var height = (body_height * 0.3 - 3 * border);

//////////////////////////////////////////////////////////////
////////////////////////// Data //////////////////////////////
//////////////////////////////////////////////////////////////

var data = [
    [//iPhone
        {axis:"00",value:0.42},
        {axis:"01",value:0.28},
        {axis:"02",value:0.29},
        {axis:"03",value:0.17},
        {axis:"04",value:0.22},
        {axis:"05",value:0.02},
        {axis:"06",value:0.21},
        {axis:"07",value:0.50},
        {axis:"09",value:0.22},
        {axis:"10",value:0.08},
        {axis:"11",value:0.29},
        {axis:"12",value:0.17},
        {axis:"13",value:0.22},
        {axis:"14",value:0.02},
        {axis:"15",value:0.21},
        {axis:"16",value:0.50},
        {axis:"17",value:0.22},
        {axis:"18",value:0.48},
        {axis:"19",value:0.29},
        {axis:"20",value:0.17},
        {axis:"21",value:0.22},
        {axis:"22",value:0.12},
        {axis:"23",value:0.21}
    ],[//Samsung
        {axis:"00",value:0.22},
        {axis:"01",value:0.28},
        {axis:"02",value:0.29},
        {axis:"03",value:0.17},
        {axis:"04",value:0.22},
        {axis:"05",value:0.02},
        {axis:"06",value:0.21},
        {axis:"07",value:0.10},
        {axis:"09",value:0.22},
        {axis:"10",value:0.28},
        {axis:"11",value:0.49},
        {axis:"12",value:0.27},
        {axis:"13",value:0.22},
        {axis:"14",value:0.02},
        {axis:"15",value:0.21},
        {axis:"16",value:0.50},
        {axis:"17",value:0.22},
        {axis:"18",value:0.28},
        {axis:"19",value:0.29},
        {axis:"20",value:0.17},
        {axis:"21",value:0.42},
        {axis:"22",value:0.32},
        {axis:"23",value:0.21}
    ],[//Nokia Smartphone
        {axis:"00",value:0.22},
        {axis:"01",value:0.28},
        {axis:"02",value:0.09},
        {axis:"03",value:0.17},
        {axis:"04",value:0.22},
        {axis:"05",value:0.02},
        {axis:"06",value:0.21},
        {axis:"07",value:0.10},
        {axis:"09",value:0.22},
        {axis:"10",value:0.28},
        {axis:"11",value:0.49},
        {axis:"12",value:0.17},
        {axis:"13",value:0.22},
        {axis:"14",value:0.02},
        {axis:"15",value:0.51},
        {axis:"16",value:0.10},
        {axis:"17",value:0.12},
        {axis:"18",value:0.28},
        {axis:"19",value:0.29},
        {axis:"20",value:0.17},
        {axis:"21",value:0.42},
        {axis:"22",value:0.02},
        {axis:"23",value:0.21}
    ]
];
//////////////////////////////////////////////////////////////
//////////////////// Draw the Chart //////////////////////////
//////////////////////////////////////////////////////////////

var color = d3.scale.ordinal()
    .range(["#EDC951","#CC333F","#00A0B0"]);

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
RadarChart(".radarChart", data, radarChartOptions);