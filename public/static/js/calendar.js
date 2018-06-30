Calendar(960);
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
            Draw_calender_(section);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}
function Draw_calender_(data_line) {

    var margin = { top: 0, right: 0, bottom:20, left: 0 },
        border =1,
        body_width =  $("#all_view").width(),
        body_height =  $("#all_view").height()-15,
        width=(body_width * 0.15 -  border),
        height=(body_height - 190) - body_height * 0.25 ,
        gridSize = height/40,
        legendElementWidth = width/10,
        buckets = 9,
        colors = ["#38A800","#8BD100","#FFFF00","#FF8000","#ff1c24"],
        times  = ["6am" ,"11pm"],
        days = [ "01","02","03","04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23","24","25","26","27","28","29","30","31"],
        dailyValueExtent = {};


    if(d3.select("#calendar_svg"))
        d3.select("#calendar_svg").remove();

    var svg = d3.select("#calendar")
        .append("svg")
        .attr("id","calendar_svg")
        .attr("width",width)
        .attr("height",  height );

    var times_label_g = svg.append("g");
    var days_label = svg.append("g");
    var calender_legend = svg.append("g");
    var calender_g = svg.append("g");

    times_label_g
        .append("text")
        .text("6:00")
        .attr("x", 15)
        .attr("y",10)
        .style({
            "font-size":"8",
            "fill": "#aaa",
            "text-anchor":"middle"
        });

    times_label_g
        .append("text")
        .text("23:00")
        .attr("x", width - 15)
        .attr("y",10)
        .style({
            "font-size":"8",
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
        .attr("y", function(d, i) { return (i+1)* gridSize; })
        .attr("transform","translate("+0+","+3*gridSize+")")
        .style({
            "font-size":"9",
            "fill": "#aaa",
            "text-anchor":"middle"
        });

    var colorScale = d3.scale.quantile()
        .domain([0,d3.max(data_line, function (d) { return d.speed; })])
        .range(colors);

    var cards = calender_g.selectAll(".hour")
        .data(data_line, function(d) {return d.day+':'+d.hour;})
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
                .text(this_hour+":00")
                .attr("x", this_x)
                .attr("y",20)
                .style({
                    "font-size":"8",
                    "fill": "#aaa",
                    "text-anchor":"middle"
                });
            d3.selectAll(".hour").attr("opacity",0.2);
            d3.select(this).attr("opacity",1);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".days_Label").attr("opacity",1);
            d3.select("#time_hour").remove();
            d3.selectAll(".hour").attr("opacity",1);
        })
        .on("click",function (d,i) {
            var curr_date = new Date(2016,1,d.day,d.hour,0,0);
        })
        .style("fill","#646765")
        .attr("transform","translate(0,"+3*gridSize+")")
        .transition()
        .duration(1000)
        .style("fill", function (d) {

            if(d.speed==null)return "#b6b6b6";
            if(d.speed<=15){return colors[4]}
            else if(d.speed>15&&d.speed<=18){return colors[3]}
            else if(d.speed>18&&d.speed<=30){return colors[2]}
            else if(d.speed>30&&d.speed<=38){return colors[1]}
            else if(d.speed>38){return colors[0];}
        });

    var legArray=['0-2','2-4','4-6','6-8','8-10'];

    var legend = calender_legend.selectAll(".calendar_legend")
        .data(legArray)
        .enter()
        .append("rect")
        .attr("class","calendar_legend")
        .attr("x",function(d, i) { return (legendElementWidth)* (i+2); })
        .attr("y",  height - margin.bottom*2)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width",  legendElementWidth )
        .attr("height",gridSize*0.8)
        .style("fill", function(d, i) { return colors[i]; })
        .on("mouseover",function (d) {
            d3.selectAll(".calendar_legend").attr("opacity",0.2);
            d3.select(this).attr("opacity",1);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".calendar_legend").attr("opacity",1);
        });

    //legend.exit().remove();
}