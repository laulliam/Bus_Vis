/**
 * Created by Liang Liu on 2018/1/27.
 */
update_radar(20040063);

function update_radar(station_id) {

    $.ajax({
        url: "/sub_routes_numbers",    //请求的url地址
        data:{
            station_id:station_id
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (routes_numbers, textStatus) {

            var station_name = routes_numbers[0].station_name;

            var routes_id = routes_numbers[0].sub_routes_id.split(",");

            var temp = [];

            routes_id.forEach(function (route_id) {

                var hours_data =[];
                var hours_temp = [24];

                for(var i =0;i<24;i++) hours_temp[i] =0;

                var route_data = route_query(station_id,route_id,new Date(2016,0,1,7,0,0),new Date(2016,0,2,7,0,0));

                route_data.forEach(function (d) {

                    if(d.start_date_time.getMinutes()>=30)
                    {
                        d.start_date_time.setHours(d.start_date_time.getHours()+1);
                        d.start_date_time.setMinutes(0,0);
                    }
                    else
                        d.start_date_time.setMinutes(0,0);

                    hours_temp[d.start_date_time.getHours()]+=d.stay_time;

                });

                for(var i =0;i<24;i++)
                {
                    if(i<10)
                        hours_data.push({axis:"0"+i,value:hours_temp[i],route_id:route_id});
                    else
                        hours_data.push({axis:""+i,value:hours_temp[i],route_id:route_id});
                }

                temp.push(hours_data);
            });

            routes_radar(temp,routes_id,station_name);

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    function route_query(station_id,route_id,start_time,end_time) {

        var route_data;

        $.ajax({
            url: "/sub_route_data",    //请求的url地址
            data:{
                sub_route_id:route_id,
                station_id:station_id,
                start_time:start_time,
                end_time:end_time
            },
            dataType: "json",   //返回格式为json
            async: false, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
            success: function (sub_route_data, textStatus) {

                sub_route_data.forEach(function (d) {
                    d.start_date_time=new Date(d.start_date_time);
                    d.end_date_time = new Date(d.end_date_time);
                });

                route_data = sub_route_data;
            },
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
        });

        return route_data;
    }

}

function routes_radar(route_data,routes_id,station_name) {

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-15;

    // var width = radar.width();
    // var height = radar.height();

    var margin ={top: 10, right: 10, bottom: 10, left: 10};

    var width = (body_width * 0.15 -  border) ;
    var height = (body_height * 0.3 - 3 * border );

    var radarChartOptions = {
        w: width,
        h: height,
        levels: 5,
        roundStrokes: true,
        color: COLOR,
        routes_id:routes_id
    };
    if(d3.select("#station_name_div"))
        d3.select("#station_name_div").remove();

    var tooltip=d3.select("#radar").append("div")
        .attr("id","station_name_div")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "1%",
            "top":"2%"
        });
    tooltip.append("p")
        .attr("id","tooltip_area")
        .style({
            "font-size":5,
            "color":"#FFF",
            "text-anchor":"middle"
        })
        .text(station_name);

//Call function to draw the Radar chart
    RadarChart("#radar", route_data, radarChartOptions);
}

function RadarChart(id, data, options) {

    var cfg = {
        w: 600,				//Width of the circle
        h: 600,				//Height of the circle
        margin: {top: 10, right: 10, bottom: 10, left: 10}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.15, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.2, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scale.category10()	//Color function
    };

    //Put all of the options into a variable called cfg
    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }//for i
    }//if

    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));

    var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
        total = allAxis.length,					//The number of different axes
        radius = Math.min((cfg.w - 2.5*(cfg.margin.right + cfg.margin.left))/2, (cfg.h - 2.5*(cfg.margin.top + cfg.margin.bottom))/2), 	//Radius of the outermost circle
        angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, maxValue]);
    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();

    //Initiate the radar chart SVG
    var svg = d3.select(id).append("svg")
        .attr("width",  cfg.w)
        .attr("height", cfg.h)
        .attr("class", "radar"+id);
    //Append a g element
    var g = svg.append("g").attr("transform", "translate(" + (cfg.w/2 ) + "," + (cfg.h/2 ) + ")");

    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    var filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','1').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    //Draw the background circles
    axisGrid.selectAll(".levels")
        .data(d3.range(1,(cfg.levels+1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function(d, i){return radius/cfg.levels*d;})
        .style({
            "fill":"none"  ,
            "stroke":"#ffffff",
            "stroke-opacity":0.5,
            "fill-opacity":cfg.opacityCircles,
            "filter":"url(#glow)"
        });


    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////

    //Create the straight lines radiating outward from the center
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");
    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i){ return rScale(maxValue) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return rScale(maxValue) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line")
        .style({
            "stroke":"#ffffff",
            "stroke-width":"1px",
            "stroke-opacity":0.5
        })
    //.style("filter" , "url(#glow)");

    //Append the labels at each axis
    axis.append("text")
        .attr("class", "axis_legend")
        .style("font-size", "8px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.15em")
        .attr("x", function(d, i){ return rScale(maxValue * 0.88*cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y", function(d, i){ return rScale(maxValue * 0.88*cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .text(function(d){return d})
        .call(wrap, cfg.wrapWidth);

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    var radarLine = d3.svg.line.radial()
        .interpolate("basis-closed")
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d,i) {	return i*angleSlice; });

    if(cfg.roundStrokes) {
        radarLine.interpolate("basis-closed");
    }

    //Create a wrapper for the blobs
    var blobWrapper = g.selectAll(".radar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", function (d,i) {
            return "radar_"+ d[0].route_id;
        });

    //Append the backgrounds
    blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("fill", function(d,i) { return cfg.color[i]; })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d,i){
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);

            var tooltip=d3.select("#radar").append("div")
                .attr("id","tooltip_div")
                .style({
                    "position": "absolute",
                    "float":"left",
                    "z-index": "999",
                    "left": "10%",
                    "bottom":"10%"
                });
            tooltip.append("p")
                .attr("id","tooltip_area")
                .style({
                    "font-size":5,
                    "color":"#FFF",
                    "text-anchor":"middle"
                })
                .text(d[0].route_id);
        })
        .on('mouseout', function(){
            d3.select("#tooltip_div").remove();
            //Bring back all blobs
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });

    //Create the outlines
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d,i) { return COLOR[i]; })
        .style("fill", "none")
        .style("filter" , "url(#glow)");

    var legendElementWidth = 15;
    var gridSize = 10;
    var legend_g = svg.append("g");

    var test =[1,2,3,4,5,6,7,8,9,10];


    var legend = legend_g.selectAll(".radar_legend")
        .data(options.routes_id)
        .enter()
        .append("rect")
        .attr("class","radar_legend")
        .attr("x",function(d, i) {
                return cfg.w/options.routes_id.length + i*20 ;
        })
        .attr("y", function(d,i){
            return cfg.h - cfg.margin .bottom;
        } )
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width",  legendElementWidth )
        .attr("height",gridSize)
        .style("fill", function(d, i) { return options.color[i]; })
        .on("mouseover",function (d,i) {
            var this_x = d3.select(this).attr("x");
            var tooltip=legend_g.append("text")
                .attr("id","tooltip")
                .attr("x", function (d) {
                    //return cfg.w/options.routes_id.length + i*20 ;
                    console.log(this_x);
                    return this_x;
                })
                .attr("y", cfg.h - 1.5*cfg.margin .bottom)
                .attr("font-size",0)
                .attr("text-anchor", "middle")
               // .attr("dy", "0.15em")
                .attr("fill","#FFF")
                .text(d);

            options.routes_id.forEach(function (route) {
                if(route != d)
                    d3.select(".radar_"+route).attr("opacity",0.2);
            });
            d3.selectAll(".radar_legend").attr("opacity",0.2);
            d3.select(this).attr("opacity",1);
        })
        .on("mouseout",function (d) {
            d3.select("#tooltip").remove();
            options.routes_id.forEach(function (route) {
                d3.select(".radar_"+route).attr("opacity",1);
            });
            d3.selectAll(".radar_legend").attr("opacity",1);
        });

    //d3.selectAll(".radar_legend").attr("opacity",0.2);

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap

}//RadarChart