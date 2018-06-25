calendar();
function calendar(){
    $.ajax({
        url: "/section_route_data",    //请求的url地址
        dataType: "json",   //返回格式为json
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (station, textStatus) {
            Draw_calender_(station);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}
function Draw_calender_(datas) {

    var margin = { top: 0, right: 0, bottom:20, left: 0 },
        border =1,
        body_width =  $("#all_view").width(),
        body_height =  $("#all_view").height()-15,
        width=(body_width * 0.15 -  border),
        height=(body_height - 190) - body_height * 0.25 ,
        gridSize = height/40,
        legendElementWidth = gridSize*2,
        buckets = 9,
        colors = ["#40ff18","#9ff86e","#9ff86e","#cccd44","#cd6628","#ff6326","#ff4f0d"],
        times  = ["6am" ,"11pm"],
        days = [ "01","02","03","04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23","24","25","26","27","28","29","30","31"],
        dailyValueExtent = {};

    datas.forEach(function (d) {
        if(d.speed >= 60){
            d.speed = 0;
        }
        d.day = new Date(d.start_date_time).getDate();
        d.hour = new Date(d.start_date_time).getHours();
        d.start_date_time = new Date(d.start_date_time);
        d.start_date_time.setMinutes(0,0);
        d.start_date_time.setSeconds(0,0);
    });

    heatmapChart(datas,width,height);

    var nest = d3.nest().key(function (d) {
        return d.start_date_time;
    });

    var data_line = nest.entries(datas);

    data_line.forEach(function (d) {
        var sum =0;
        d.key = new Date(d.key);
        d.values.forEach(function (s) {
            sum += s.speed;
        });
        d.values = sum/d.values.length;
    });

    data_line.sort(function (a,b) {
        return a.key - b.key;
    });

    function heatmapChart(data,widths,heights) {

        var svg = d3.select("#calendar")
            .append("svg")
            .attr("width",widths)
            .attr("height",  heights );

        var times_label_g = svg.append("g");
        var days_label = svg.append("g");
        var calender_legend = svg.append("g");
        var calender_g = svg.append("g");

        times_label_g
            .append("text")
            .text("am6")
            .attr("x", 15)
            .attr("y",10)
            .style({
                "font-size":"10",
                "font-family": "Consolas, courier",
                "fill": "#aaa",
                "text-anchor":"middle"
            });

        times_label_g
            .append("text")
            .text("pm11")
            .attr("x", width - 15)
            .attr("y",10)
            .style({
                "font-size":"10",
                "font-family": "Consolas, courier",
                "fill": "#aaa",
                "text-anchor":"middle"
            });

        var days_Labels = days_label.selectAll(".days_Label")
            .data(days)
            .enter()
            .append("text")
            .attr("class","days_Label")
            .attr("id",function (d,i) {
                return "day_"+parseInt(d);
            })
            .text(function(d) { return d; })
            .attr("x", 10)
            .attr("y", function(d, i) { return (i+4)* gridSize; })
            .style({
                "font-size":"10",
                "font-family": "Consolas, courier",
                "fill": "#aaa",
                "text-anchor":"middle"
            });

        var colorScale = d3.scale.quantile()
            .domain([0,d3.max(data, function (d) { return d.speed; })])
            .range(colors);

        var cards = calender_g.selectAll(".hour")
            .data(data, function(d) {return d.day+':'+d.hour;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return (d.hour-3) * gridSize; } )
            .attr("y", function(d,i) {return (d.day  -1) * gridSize; })
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .on("mouseover",function (d) {
                d3.selectAll(".days_Label").attr("opacity",0.2);
                d3.select("#day_"+d.day).attr("opacity",1);

                var this_x = d3.select(this).attr("x");
                var this_hour = d.hour;

                var time = calender_g.append("text")
                    .attr("id","time_hour")
                    .text(this_hour)
                    .attr("x", this_x)
                    .attr("y",20)
                    .style({
                        "font-size":"10",
                        "font-family": "Consolas, courier",
                        "fill": "#aaa",
                        "text-anchor":"left"
                    });
                d3.selectAll(".hour").attr("opacity",0.2);
                d3.select(this).attr("opacity",1);
            })
            .on("mouseout",function (d) {
                d3.selectAll(".days_Label").attr("opacity",1);
                d3.select("#time_hour").remove();
                d3.selectAll(".hour").attr("opacity",1);
            })
            .style("fill","#646765")
            .attr("transform","translate(0,"+d3.select("#day_1").attr("y")+")")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                if(d.speed>=0&&d.speed<10){return colors[5]}
                else if(d.speed>=10&&d.speed<20){return colors[4]}
                else if(d.speed>=20&&d.speed<30){return colors[3]}
                else if(d.speed>=30&&d.speed<40){return colors[2]}
                else if(d.speed>=40&&d.speed<50){return colors[1]}
                else if(d.speed>=50&&d.speed<60){return colors[0];}
                else if(d.speed == 0){return "#646765";}
            });

        var legArray=[0,1,2,3,4,5,6];

        var legend = calender_legend.selectAll(".legend")
            .data(legArray)
            .enter()
            .append("rect")
            .attr("class","legend")
            .attr("x",function(d, i) { return legendElementWidth * i+0.2*width; })
            .attr("y",  height - margin.bottom)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width",  legendElementWidth )
            .attr("height",gridSize)
            .style("fill", function(d, i) { return colors[i]; })
            .on("mouseover",function (d) {
                console.log(10);
                d3.selectAll(".legend").attr("opacity",0.2);
                d3.select(this).attr("opacity",1);
            })
            .on("mouseout",function (d) {
                d3.selectAll(".legend").attr("opacity",1);
            });

        //legend.exit().remove();

    }


}