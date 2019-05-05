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

Draw_calender_main();
function Draw_calender_main() {

    var calendar = $("#calendar_main"),
        width=calendar.width() ,
        height=calendar.height() ,

        gridSize1 = (width/34),
        gridSize2 = height/20,

        gridSize = gridSize1>gridSize2?gridSize2:gridSize1,
        days = [],
        data=[];

    var colorRange=d3.range(6).map(function(i) { return "q" + i + "-6"; });
    var threshold=d3.scale.threshold()//阈值比例尺
        .domain([10,20,30,40,50])
        .range(colorRange);

    for(var i = 1;i<=31;i++){
        days.push(i);
        for(var j=6;j<24;j++)
            data.push({day:i,hour:j,speed:Math.floor(Math.random()*60)});
    }

    if(d3.select("#calendar_svg")) d3.select("#calendar_svg").remove();

    var svg = d3.select("#calendar_main")
        .append("svg")
        .attr("id","calendar_svg")
        .attr("width",width)
        .attr("height",  height );

    var days_label = svg.append("g");
    var calender_g = svg.append("g")
        .attr("transform","translate("+gridSize*2+",0)");
    var legend_g = svg.append("g")
        .attr("transform","translate("+gridSize*2+","+height*.93+")");

    var days_Labels = days_label.selectAll(".days_Label")
        .data(days)
        .enter()
        .append("text")
        .attr("class","days_Label")
        .attr("id",function (d,i) {
            return "day_"+parseInt(d);
        })
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return (i+2.5)* gridSize; })
        .attr("y", 25)
        .style({
            "font-size":"8",
            "fill": "#ffffff",
            "text-anchor":"middle"
        });

    var calendar_rects = calender_g.selectAll(".hour")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d,i) { return (d.hour-5) * gridSize + (i%18)*3; } )
        .attr("x", function(d,i) {return (d.day  -1) * gridSize; })
        .attr("class",function (d) {
            return "hour "+threshold(d.speed);
        })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .on("mouseover",function (d) {

            d3.selectAll(".days_Label").attr("opacity",.2);
            d3.select("#day_"+d.day).attr("opacity",1);

            var this_y = d3.select(this).attr("y");
            var this_hour = d.hour;

            var time = calender_g.append("text")
                .attr("id","time_hour")
                .text(this_hour)
                .attr("x", -8)
                .attr("y",this_y)
                .style({
                    "font-size":"8",
                    "fill": "#ffffff",
                    "text-anchor":"middle"
                })
                .attr("transform","translate(0,31)");
            d3.selectAll(".hour").style("opacity",0.2);
            d3.select(this).style("opacity",.5);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".days_Label").attr("opacity",1);
            d3.select("#time_hour").remove();
            d3.selectAll(".hour").style("opacity",function (d) {
                var curr_date = new Date(2016,0,d.day,d.hour,0,0);
                if(curr_date.getDay()=== 6 || curr_date.getDay() === 0)
                    return .7;
                else
                    return 0.5;
            });
        })
        .on("click",function (d,i) {
            $.ajax({
                url: "/section_id_date",    //请求的url地址
                dataType: "json",   //返回格式为json
                data:{
                    section_id:960,
                    date:new Date(2016,0,d.day,0,0,0)
                },
                async: true, //请求是否异步，默认为异步，这也是ajax重要特性
                type: "GET",   //请求方式
                contentType: "application/json",
                beforeSend: function () {//请求前的处理
                },
                success: function (data, textStatus) {
                    data.forEach(function (d) {
                        d.start_date_time = new Date(d.start_date_time);
                    });
                    Draw_calendar_area(data);
                },
                complete: function () {//请求完成的处理
                },
                error: function () {//请求出错处理
                }
            });
        })
        .style({
            "opacity":function (d) {
                var curr_date = new Date(2016,0,d.day,d.hour,0,0);
                if(curr_date.getDay()=== 6 || curr_date.getDay() === 0)
                    return .7;
                else
                    return 0.5;
            }
        })
        .attr("transform","translate(0,"+2*gridSize+")");

    calendar_rects.append("title")
        .text(function (d) {
            return "2016/1/"+d.day+" "+d.hour+":00";
        })
        .style({
            "font-size":"9",
            "fill": "#ffffff",
            "text-anchor":"middle"
        });

    legend_g.selectAll(".calendar_legend")
        .data(color_scale)
        .enter()
        .append("rect")
        .attr("x",function (d,i) {
            return i*gridSize*31/6;
        })
        .attr("y",0)
        .attr("width",gridSize*31/6)
        .attr("height",5)
        .style("fill",function (d) {
            return d;
        });

    var legend_content = [0,10,20,30,40,50,60];

    legend_g.selectAll(".legend_text")
        .data(legend_content)
        .enter()
        .append("text")
        .text(function (d) {
            return d;
        })
        .attr("x",function (d,i) {
            return i*gridSize*31/6;
        })
        .attr("y",15)
        .style({
            "fill":"#FFFFFF",
            "font-size":"9",
            "text-anchor":"middle"
        });
}

var _calendar_area ={};
var calendar_area = $("#calendar_area");
_calendar_area.width = calendar_area.width();
_calendar_area.height = calendar_area.height();

_calendar_area.svg = d3.select("#calendar_area").append("svg")
    .attr("width",_calendar_area.width)
    .attr("height",_calendar_area.height);

_calendar_area.x_scale = d3.time.scale()
    .range([0,_calendar_area.width]);

_calendar_area.y_scale = d3.scale.linear()
    .range([_calendar_area.height,0]);

_calendar_area.x_axis = d3.svg.axis()
    .orient("bottom")
    .tickFormat(d3.time.format("%H:%M"));
//.ticks(20);

_calendar_area.y_axis = d3.svg.axis()
    .orient("left");

function Draw_calendar_area(data) {
    console.log(data);
    _calendar_area.svg.select("*").remove();
    var date_extent = d3.extent(data,function(d){
        return d.start_date_time;
    });

    _calendar_area.x_scale.domain(date_extent);
    _calendar_area.y_scale.domain([0,d3.max(data, function (d) {
        return d.speed;
    })]);

    _calendar_area.x_axis.scale(_calendar_area.x_scale);
    _calendar_area.y_axis.scale(_calendar_area.y_scale);

    _calendar_area.area = d3.svg.area()
        .interpolate("basis-open")
        .x(function (d) {
            return _calendar_area.x_scale(d.start_date_time);
        })
        .y0(function (d) {
            return _calendar_area.y_scale(0);
        })
        .y1(function (d) {
            return _calendar_area.y_scale(d.speed);
        });

    _calendar_area.g = _calendar_area.svg.append("g");

    _calendar_area.g.append("path")
        .datum(data)
        .attr("fill","#01fffd")
        .attr("d",_calendar_area.area)
        .style({
            "opacity":.5
        });
}

///////////////////////////////////////////////////////////////////
/*

 var area_chart = svg.append("g")
 .attr("transform","translate(0,"+height*.75+")");

 var x_scale = d3.time.scale()
 .domain(date_extent)
 .range([0, width]);

 var y_scale = d3.scale.linear()
 .domain([0,d3.max(data,function (d) {
 return d.speed;
 })])
 .range([height - 40, 0]);

 var x_axis = d3.svg.axis()
 .scale(x_scale)
 .orient("bottom")
 .tickFormat(d3.time.format("%H:%M"));

 var y_axis = d3.svg.axis()
 .scale(y_scale)
 .orient("left");

 area_chart.append("g")
 .attr("class", "x axis")
 .call(x_axis);


 // }
 }
 */