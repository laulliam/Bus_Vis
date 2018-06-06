
spiral_line(38001,date_extent = [new Date(2016,0,1,0,0,0),new Date(2016,0,2,0,0,0)]);

function spiral_line(route_id,date_extent){

    $.ajax({
        url: "/spiral_data",    //请求的url地址
        data:{
            sub_route_id:route_id.toString(),
            date_extent:date_extent
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
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

        var border = 1;
        var all_view = $("#all_view");
        var body_width = all_view.width();
        var body_height = all_view.height()-15;

        var width=(body_width * 0.15 -  border);
        var height=(body_height * 0.25 - border);
        var start = 0,
            end = 2.25,
            numSpirals = 3,
            margin = {top:5,bottom:5,left:5,right:5};

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
            sum = Math.pow(sum,6);
            data_10min.push({date:new Date(i),value:(index)?(sum/index):0});
        }

        // used to assign nodes color by group
        var color = d3.scale.category10();

        var r = d3.min([width, height])/2 -20;

        var radius = d3.scale.linear()
            .domain([start, end])
            .range([20, r]);

        var svg = d3.select("#spiral_line").append("svg")
            .attr("width", width )
            .attr("height", height )
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var points = d3.range(start, end + 0.001, (end - start) / 1000);

        var spiral = d3.svg.line.radial()
            .interpolate("cardinal")
            .angle(theta)
            .radius(radius);

        var path = svg.append("path")
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

        svg.selectAll("rect")
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
            });

        // add date labels
        var tF = d3.time.format("%H:%M"),
            firstInMonth = {};

        svg.selectAll("text")
            .data(data_10min)
            .enter()
            .append("text")
            .attr("dy", 10)
            .style("text-anchor", "start")
            .style("font", "9px arial")
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
            .style("fill", "grey")
            .attr("startOffset", function(d){
                return ((d.linePer / spiralLength) * 100) + "%";
            });

        svg.selectAll("rect")
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
