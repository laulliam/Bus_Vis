//Calendar(960);
function Calendar(section_id){
    $.ajax({
        url: "/section_route_data",    //请求的url地址
        dataType: "json",   //返回格式为json
        data:{
            section_id:section_id
        },
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section, textStatus) {
            console.log(section);
            Draw_calender_(section);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

Draw_calender_();
function Draw_calender_() {

    var calendar = $("#calendar"),
        width=calendar.width() ,
        height=calendar.height() ,
        gridSize1 = (width/34),
        gridSize2 = height/20,
        gridSize = gridSize1>gridSize2?gridSize2:gridSize1,
        legendElementWidth = width/10,
        colors = ["#9CD523","#F1E229","##FFBF3A","#FB8C00","#FF5252"],
        days = [],
        times =[],
        data=[];

    for(var i = 1;i<=31;i++){
        for(var j=6;j<24;j++){
            data.push({day:i,hour:j,speed:Math.floor(Math.random()*60)});
        }
    }

    var colorScale = d3.scale.linear()
        .domain(d3.extent(data, function (d) { return d.speed; }))
        .range(colors);

    if(d3.select("#calendar_svg")) d3.select("#calendar_svg").remove();

    var svg = d3.select("#calendar")
        .append("svg")
        .attr("id","calendar_svg")
        .attr("width",width)
        .attr("height",  height );

    var times_label_g = svg.append("g");
    var days_label = svg.append("g");
    var calender_g = svg.append("g")
        .attr("transform","translate("+gridSize*2+",0)");

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
        .attr("y", function(d, i) { return (i+1)* gridSize; })
        .attr("transform","translate("+0+","+3*gridSize+")")
        .style({
            "font-size":"9",
            "fill": "#aaa",
            "text-anchor":"middle"
        });

    /*    var cards = calender_g.selectAll(".hour")
            .data(data_line, function(d) {return d.day+':'+d.hour;})
            .enter()
            .append("rect")
            .attr("x", function(d) { return (d.hour-4) * gridSize; } )
            .attr("y", function(d,i) {return (d.day  -1) * gridSize; })
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .on("mouseover",function (d) {

                d3.selectAll(".days_Label").attr("opacity",.2);
                d3.select("#day_"+d.day).attr("opacity",1);

                var this_x = d3.select(this).attr("x");
                var this_hour = d.hour;

                var time = calender_g.append("text")
                    .attr("id","time_hour")
                    .text(this_hour+":00")
                    .attr("x", this_x)
                    .attr("y",20)
                    .style({
                        "font-size":"8",
                        "fill": "#aaa",
                        "text-anchor":"middle"
                    });
                d3.selectAll(".hour").style("opacity",0.2);
                d3.select(this).style("opacity",.6);
            })
            .on("mouseout",function (d) {
                d3.selectAll(".days_Label").attr("opacity",1);
                d3.select("#time_hour").remove();
                d3.selectAll(".hour").style("opacity",.6);
            })
            .on("click",function (d,i) {
                var curr_date = new Date(2016,1,d.day,d.hour,0,0);
            })
            .style({
                "opacity":.6
            })
            .attr("transform","translate(0,"+3*gridSize+")")
            .transition()
            .duration(1000)
            .style("fill", function (d) {

                if(d.speed==null)
                    return "#b6b6b6";
                else
                    return colorScale(d.speed);
            });*/

    var cards = calender_g.selectAll(".hour")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d) { return (d.hour-5) * gridSize; } )
        .attr("x", function(d,i) {return (d.day  -1) * gridSize; })
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .on("mouseover",function (d) {

            d3.selectAll(".days_Label").attr("opacity",.2);
            d3.select("#day_"+d.day).attr("opacity",1);

            var this_x = d3.select(this).attr("x");
            var this_hour = d.hour;

            var time = calender_g.append("text")
                .attr("id","time_hour")
                .text(this_hour)
                .attr("x", this_x)
                .attr("y",20)
                .style({
                    "font-size":"8",
                    "fill": "#aaa",
                    "text-anchor":"middle"
                });
            d3.selectAll(".hour").style("opacity",0.2);
            d3.select(this).style("opacity",.6);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".days_Label").attr("opacity",1);
            d3.select("#time_hour").remove();
            d3.selectAll(".hour").style("opacity",.6);
        })
        .style({
            "opacity":.6,
            "fill": function (d) {

                if(d.speed==null)
                    return "#b6b6b6";
                else
                    return colorScale(d.speed);
            }
        })
        .attr("transform","translate(0,"+3*gridSize+")");
}