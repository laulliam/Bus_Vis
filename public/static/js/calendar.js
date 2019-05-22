
var legend = d3.select("#calendar")
    .append("div")
    .style({
        "position":"absolute",
        "top":"25px",
        "left":"5px"
    })
    .append("span")
    .attr("id","calendar_id")
    .attr("class","label label-default legend_label")
    .style("background-color","#07a6ff");

Calendar(757);

function Calendar(section_id){

    d3.select("#calendar_id").html(section_info[section_id-1].from_name+">>>>>>>"+section_info[section_id-1].target_name);

    section_id_date(section_id,new Date("Fri Jan 1 2016 00:00:00 GMT+0800"));

    $.ajax({
        url: "/section_hour_data",    //请求的url地址
        dataType: "json",   //返回格式为json
        data:{
            section_id:section_id
        },
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (data, textStatus) {

            //console.log(data);
            if(data.length>0)
                Draw_calender_main(data[0].hour_data,section_id);
            else
                $.ajax({
                    url: "/section_route_data",    //请求的url地址
                    dataType: "json",   //返回格式为json
                    data:{
                        section_id:section_id
                    },
                    async: true, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (data, textStatus) {
                        //console.log(data);
                        Draw_calender_main(data,section_id);
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

function section_id_date(section_id,date){
    $.ajax({
        url: "/section_id_date",    //请求的url地址
        dataType: "json",   //返回格式为json
        data:{
            section_id:section_id,
            date:date
        },
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (data, textStatus) {
            //console.log(data);
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
}

function Draw_calender_main(data,section_id) {

    var calendar = $("#calendar_main"),
        width=calendar.width() ,
        height=calendar.height() ,
        gridSize = width/33,
        days = [];

    var colorRange=d3.range(5).map(function(i) { return "q" + i + "-6"; });
    var threshold=d3.scale.threshold()//阈值比例尺
        .domain([10,20,30,40])
        .range(colorRange);

    for(var i = 1;i<=31;i++){
        days.push(i);
    }

    if(d3.select("#calendar_svg")) d3.select("#calendar_svg").remove();

    var svg = d3.select("#calendar_main")
        .append("svg")
        .attr("id","calendar_svg")
        .attr("width",width)
        .attr("height",  height );

    var days_label = svg.append("g");
    var calender_g = svg.append("g")
        .attr("transform","translate("+gridSize+",0)");
    var legend_g = svg.append("g")
        .attr("transform","translate("+gridSize+","+(height-15)+")");

    var days_Labels = days_label.selectAll(".days_Label")
        .data(days)
        .enter()
        .append("text")
        .attr("class","days_Label")
        .attr("id",function (d,i) {
            return "day_"+parseInt(d);
        })
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return (i+1.5)* gridSize; })
        .attr("y", 30)
        .on("click",function (d,i) {
            d3.select("#section_date").text("2016/1/"+d);
            section_id_date(section_id,new Date(2016,0,d,0,0,0));
            //console.log(new Date(2016,0,d.day,0,0,0));
        })
        .style({
            "font-size":"8",
            "fill": "#ffffff",
            "text-anchor":"middle"
        });

    var calendar_rects = calender_g.selectAll(".hour")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d,i) { return (d.hour-5) * gridSize + (i%18)*2; } )
        .attr("x", function(d,i) {return (d.day  -1) * gridSize; })
        .attr("class",function (d) {
            if(d.speed === null)
                return "hour";
            else
                return "hour "+threshold(d.speed);
        })
        .attr('fill',function (d) {
            if(!d.speed)
                return "#302b63";
        })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .on("mouseover",function (d) {

            d3.selectAll(".hour").style("opacity",function (d) {
                var curr_date = new Date(2016,0,d.day,0,0,0);
                if(curr_date.getDay()=== 6 || curr_date.getDay() === 0)
                    return .7;
                else
                    return 0.5;
            });

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
            //d3.selectAll(".hour").style("opacity",0.2);
            d3.select(this).style("opacity",.7);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".days_Label").attr("opacity",1);
            d3.select("#time_hour").remove();
            d3.selectAll(".hour").style("opacity", .7);
        })
        .on("click",function (d,i) {
        })
        .style({
            "opacity": .7
        })
        .attr("transform","translate(0,"+2*gridSize+")");

    calendar_rects.append("title")
        .text(function (d) {
            return "date:2016/1/"+d.day+" "+d.hour+":00  speed:"+d.speed;
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
            return i*gridSize*31/5;
        })
        .attr("y",0)
        .attr("width",gridSize*31/5)
        .attr("height",5)
        .style("fill",function (d) {
            return d;
        });

    var legend_content = [40,30,20,10];

    legend_g.selectAll(".legend_text")
        .data(legend_content)
        .enter()
        .append("text")
        .text(function (d) {
            return d+"km/h";
        })
        .attr("x",function (d,i) {
            return (i+1)*gridSize*31/5;
        })
        .attr("y",15)
        .style({
            "fill":"#FFFFFF",
            "font-size":"8",
            "text-anchor":"middle"
        });
}

var _calendar_area ={};
var calendar_area = $("#calendar_area");
_calendar_area.width = calendar_area.width();
_calendar_area.height = calendar_area.height();
_calendar_area.margin = _calendar_area.width/33;

_calendar_area.svg = d3.select("#calendar_area").append("svg")
    .attr("width",_calendar_area.width-_calendar_area.margin*2)
    .attr("height",_calendar_area.height)
    .attr("transform", "translate("+_calendar_area.margin+",0)");

_calendar_area.x_scale = d3.time.scale()
    .range([0,_calendar_area.width-_calendar_area.margin*2]);

_calendar_area.y_scale = d3.scale.linear()
    .range([_calendar_area.height-20,0]);

_calendar_area.x_axis = d3.svg.axis()
    .orient("bottom")
    .tickFormat(d3.time.format("%H:%M"));
//.ticks(20);

var area_time = d3.select("#calendar_area")
    .append("div")
    .style({
        "position":"absolute",
        "pointer-events":"none",
        //"text-align":"center",
        "z-index":99,
        "top":0,
        "right":_calendar_area.margin+'px'
    })
    .attr("width",_calendar_area.width)
    .attr("height",_calendar_area.height);

area_time.append("a")
    .attr("id","section_date")
    .text("2016/1/1")
    .attr("align","center")
    .style({
        "display":"block",
        "font-size":'8px',
        "opacity":0.1,
        "color":"#ffffff",
        "text-align":"center",
        //"line-height":_calendar_area.height-10+"px"
    });


_calendar_area.y_axis = d3.svg.axis()
    .orient("right");

function Draw_calendar_area(data) {
    //console.log(data);

    _calendar_area.svg.html("");
    var date_extent = d3.extent(data,function(d){
        return d.start_date_time;
    });

    _calendar_area.x_scale.domain(date_extent);
    _calendar_area.y_scale.domain([0,d3.max(data, function (d) {
        return d.speed;
    })]);

    _calendar_area.x_axis.scale(_calendar_area.x_scale);
    _calendar_area.y_axis.scale(_calendar_area.y_scale);

    var zoom = d3.behavior.zoom()
        .x(_calendar_area.x_scale)
        .scaleExtent([1,10])
        .on("zoom", zoomed);

    _calendar_area.svg.call(zoom);

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

    _calendar_area.g = _calendar_area.svg.append("g")
        .attr("transform", "translate("+_calendar_area.margin+",0)");

    _calendar_area.x_axis_g = _calendar_area.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+_calendar_area.margin+"," + (_calendar_area.height - 20) + ")")
        .call(_calendar_area.x_axis);

    _calendar_area.y_axis_g = _calendar_area.svg.append("g")
        .attr("class", "y axis")
        .call(_calendar_area.y_axis);

    _calendar_area.g.append("path")
        .datum(data)
        .attr("fill","#01fffd")
        .attr("d",_calendar_area.area)
        .style({
            "opacity":.5
        });

    function zoomed() {
        _calendar_area.svg.select(".x.axis").call(_calendar_area.x_axis);
        _calendar_area.g.select("path").attr("d", function () {
            return _calendar_area.area(data);
        });
    }
}
