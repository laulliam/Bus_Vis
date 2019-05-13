
spiral_line(38001,date_extent = [new Date(2016,0,1,0,0,0),new Date(2016,0,2,0,0,0)]);

function spiral_line(route_id,date_extent){

    d3.select("#spiral_line_id").html(route_id);

    $.ajax({
        url: "/spiral_data",    //请求的url地址
        data:{
            sub_route_id:route_id.toString(),
            date_extent:date_extent
        },
        dataType: "json",   //返回格式为json
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (route_data, textStatus) {
            route_data.forEach(function (d) {
                d.start_date_time = new Date(d.start_date_time);
                if(d.start_date_time.getSeconds()>30) {
                    d.start_date_time.setMinutes(d.start_date_time.getMinutes()+1,0);
                }
                d.start_date_time.setSeconds(0,0);
            });
            Draw_spiral_line(route_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    function Draw_spiral_line(dataset) {

        var spiral_line = $("#spiral_line");

        var width=spiral_line.width();
        var height=spiral_line.height()-20;
        var start = 0,
            end = 2.25,
            numSpirals = 3;

        var theta = function(r) {
            return numSpirals * Math.PI * r;
        };

        var nest = d3.nest().key(function (d) {
            return d.start_date_time;
        });

        var test = nest.entries(dataset);

        test.forEach(function (d) {
            var sum = 0;
            d.key = new Date(d.key);
            d.values.forEach(function (s) {
                if(s.speed>60)
                    s.speed = 0;
                sum += s.speed;
            });
            d.values = sum/d.values.length;
        });

        var date_extent = d3.extent(test,function (d) {
            return d.key;
        });

        date_extent[0].setMinutes(0,0);
        date_extent[1].setMinutes(0,0);
        date_extent[1].setHours(date_extent[1].getHours()+1,0);

        var data_10min = [];
        for(var i=date_extent[0].getTime();i<=date_extent[1].getTime();i += 1000*60*10){
            var sum = 0;
            var index = 0;
            test.forEach(function (d) {
                if(d.key.getTime() >= i && d.key.getTime() < i + 1000*60*10) {
                    sum += d.values;
                    index++;
                }
            });
            sum = Math.pow(sum,4);
            data_10min.push({date:new Date(i),value:(index)?(sum/index):0});
        }

        // used to assign nodes color by group
        var color = d3.scale.category10();

        var r = d3.min([width, height])/2;

        var radius = d3.scale.linear()
            .domain([start, end])
            .range([20, r]);

        if(d3.select("#spiral_svg"))
            d3.select("#spiral_svg").remove();

        var svg = d3.select("#spiral_line").append("svg")
            .attr("id","spiral_svg")
            .attr("width", width )
            .attr("height", height )
            .attr("transform", "translate(0," +20+ ")");

        var g =svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height/1.8  + ")");


        var legend = d3.select("#spiral_line")
            .append("div")
            .style({
                "position":"absolute",
                "top":"26px",
                "left":"5px"
            })
            .append("span")
            .attr("id","spiral_line_id")
            .attr("class","label label-default legend_label")
            .style("background-color","#07a6ff")
            .html("38001");

        var points = d3.range(start, end + 0.001, (end - start) / 1000);

        var spiral = d3.svg.line.radial()
            .interpolate("cardinal")
            .angle(theta)
            .radius(radius);

        var path = g.append("path")
            .datum(points)
            .attr("id", "spiral")
            .attr("d", spiral)
            .style("fill", "none")
            .style("stroke", "#ff9363");

        var spiralLength = path.node().getTotalLength(),
            N = data_10min.length,
            barWidth = (spiralLength / N) - 1;

        var timeScale = d3.time.scale()
            .domain(d3.extent(data_10min, function(d){
                return d.date;
            }))
            .range([0, spiralLength]);

        // yScale for the bar height
        var yScale = d3.scale.linear()
            .domain([0, d3.max(data_10min, function(d){
                return d.value;
            })])
            .range([0, (r / numSpirals) -10]);

        g.selectAll("rect")
            .data(data_10min)
            .enter()
            .append("rect")
            .attr("x", function(d,i){

                var linePer = timeScale(d.date),
                    posOnLine = path.node().getPointAtLength(linePer),
                    angleOnLine = path.node().getPointAtLength(linePer - barWidth);

                d.linePer = linePer; // % distance are on the spiral
                d.x = posOnLine.x; // x postion on the spiral
                d.y = posOnLine.y; // y position on the spiral

                d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position
                return d.x;
            })
            .attr("y", function(d){
                return d.y;
            })
            .attr("width", function(d){
                return barWidth;
            })
            .attr("height", function(d){
                return yScale(d.value);
            })
            .style({
                "fill":"#ff471b",
                "stroke":"none"
            })
            .attr("transform", function(d){
                return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
            })
            // .append("title")
            // .text(function (d) {
            //     return d.value;
            // });

        // add date labels
        var tF = d3.time.format("%H:%M"),
            firstInMonth = {};

        g.selectAll("text")
            .data(data_10min)
            .enter()
            .append("text")
            .attr("dy", 10)
            .style("text-anchor", "start")
            .style("font", "8px arial")
            .append("textPath")
            // only add for the first of each month
            .filter(function(d){
                var Format = d3.time.format("%H");
                var sd = Format(d.date);
                if (!firstInMonth[sd]){
                    firstInMonth[sd] = 1;
                    return true;
                }
                return false;
            })
            .text(function(d){
                return tF(d.date);
            })
            // place text along spiral
            .attr("xlink:href", "#spiral")
            .style("fill", "#FFFFFF")
            .attr("startOffset", function(d){
                return ((d.linePer / spiralLength) * 100) + "%";
            });

        g.selectAll("rect")
            .on('mouseover', function(d) {
                d3.select("#spiral_line").selectAll("rect")
                    .style("opacity", 0.3);
                d3.select(this)
                    .style("opacity",1);
            })
            .on('mousemove', function(d) {
            })
            .on('mouseout', function(d) {
                d3.select("#spiral_line").selectAll("rect")
                    .style("opacity", 1);
            });
    }
}
