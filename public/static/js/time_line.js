

function Time_Line(data,section_id) {

    d3.select("#time_line").html("");
    var time_line ={
        IsZoom:true,
        IsChecked:false
    };
    var margin = {top: 10, right: 5, bottom: 20, left: 5};
    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-15;

    var width = (body_width * 0.7 - 2 * border);
    var height = (body_height * 0.25 - 3 * border);

    var data_extent = d3.extent(data,function (d) {
        return d.start_date_time;
    });

    var nest = d3.nest()
        .key(function(d) { return d.sub_route_id; });

    var nest_data = nest.entries(data);

    var legend_id=[];

    nest_data.forEach(function (d) {
        d.values.sort(function (a,b) {
            return a.start_date_time - b.start_date_time;
        });
        legend_id.push(d.key);
    });

    var line_height = (height - margin.bottom)/(nest_data.length+1);

    var xScale = d3.time.scale().range([0, width]);

    var yScale = d3.scale.linear().range([line_height, 0]);

    xScale.domain(data_extent);

    yScale.domain([0,d3.max(data,function (d) {
        return d.stay_time;
    })]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var zoom = d3.behavior.zoom()
        .x(xScale)
        //.scaleExtent(SCALE_EXTENT)
        .on("zoom", zoomed);

    var tooltip = d3.select("#time_line")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");

    var svg = d3.select("#time_line").append("svg")
        .attr("id","time_svg")
        .attr("width",width)
        .attr("height",height)
        .style("position", "absolute")
        .call(zoom);

    var line = d3.svg.line()//d3中绘制曲线的函数
        .x(function(d, i){
            return xScale(d.start_date_time);
        })//曲线中x的值
        .y(function(d){
            return yScale(d.stay_time);
        })//曲线中y的值
        .interpolate("basis")//把曲线设置光滑

    var axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
        .call(xAxis);

    var routes_g = svg.selectAll(".route_line")
        .data(nest_data)
        .enter()
        .append("g")
        .attr("class","routes_line")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(d, i){ return "translate(0," + (height - (i+1.5) * line_height) +")"; });

    routes_g.append("path")
        .attr('fill', "none")
        .attr('opacity', 0.8)
        .attr('stroke', function (d,i) {
            return COLOR[i];
        })
        .attr("d", function (d) {
            return line(d.values)
        })
        .attr("clip-path", "url(#clip_path)");

    var line_g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    line_g.append("clipPath")
        .attr("id", "clip_path")
        .append("rect")
        .attr({
            x: 0,
            y: 0,
            width: width,
            height: height
        });

    InitTools();
    CreateLegend();

    function InitTools() {
        var time_line_tool = d3.select("#time_line")
            .append("div")
            .attr("class", "btn-group btn-group-xs")
            .style({
                "position": "absolute",
                "float":"left",
                "z-index": "999",
                "left": "7px",
                "top":"15%"
            })
            .selectAll("btn btn-default")
            .data(["play","unchecked"])
            .enter()
            .append("button")
            .attr({
                "id":function (d) {
                    return d;
                },
                "type": "button",
                "class": "btn btn-default"
            })
            .attr("title", function (d) {
                switch (d) {
                    case "play":
                        return "播放暂停";
                    case "unchecked":
                        return "框选";
                }
            });

        time_line_tool.append("span")
            .attr("class", function (d) {
                return "glyphicon glyphicon-"+ d;
            })
            .attr("aria-hidden",true);

        time_line_tool.on("click",function (d) {
            if(d == "play"){
                var play_span = d3.select("#play span");
                var stat = play_span.attr("class");
                play_span.attr("class","glyphicon glyphicon-"+((stat == "glyphicon glyphicon-play")?"pause":"play"));
                (stat == "glyphicon glyphicon-play")?play():stop();
                time_line.IsZoom = !time_line.IsZoom;
            }
            else if(d == "unchecked"){
                time_line.IsZoom=!time_line.IsZoom;
                time_line.IsChecked=!time_line.IsChecked;
                time_line.IsChecked?CreateBrush():RemoveBrush();
            }
        })
    }

    function play() {

        var new_data_extent=data_extent;
        time_line.interval = setInterval(function () {

            new_data_extent=[new Date(new_data_extent[0].setHours(new_data_extent[0].getHours()+1)),new Date(new_data_extent[0].setHours(new_data_extent[0].getHours()+24))];
            if(new_data_extent[1].getMonth()>0) {
                new_data_extent=data_extent;
            }
            xScale.domain(new_data_extent);
            //console.log(new_data_extent);
            if( time_line.brush){
                time_line.brush.x(xScale);
                time_line.g_brush.call(time_line.brush);
            }
            xAxis.scale(xScale);
            svg.select(".x.axis").call(xAxis);
            routes_g.select("path").attr("d", function (d) {
                return line(d.values);
            });
        },400);
    }

    function stop() {
        clearInterval(time_line.interval);
        xScale.domain(data_extent);
        xAxis.scale(xScale);
        svg.select(".x.axis").call(xAxis);
        routes_g.select("path").attr("d", function (d) {
            return line(d.values);
        });
    }


    function zoomed() {
        if(time_line.IsZoom) {
            svg.select(".x.axis").call(xAxis);
            routes_g.select("path").attr("d", function (d) {
                return line(d.values);
            });
        }
    }

    function CreateBrush() {
        time_line.brush = d3.svg.brush()
            .x(xScale)
            //.extent(data_extent)
            .on("brushend", brushed);

        function brushed() {

            console.log(time_line.brush.extent());

        }

        time_line.g_brush = svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + margin.left + "," + 0 + ")")
            .call(time_line.brush);

        time_line.g_brush.selectAll("rect").attr("height", height-margin.bottom);
    }
    
    function RemoveBrush() {
        time_line.brush=null;
        time_line.g_brush.remove();
        time_line.g_brush=null;
    }

    function CreateLegend() {
        var legend_div = d3.select("#time_line").append("div")
            .style({
                "position": "absolute",
                "float":"left",
                "z-index": "999",
                "left": "0%",
                "top":"2%"
            })
            .selectAll("label label-default legend_label")
            .data(legend_id)
            .enter()
            .append("span")
            .attr("class","label label-default legend_label")
            .on("mouseover",function (d) {

            })
            .on("mouseout",function (d) {

            })
            .style({
                "background-color":function (d,i) {
                    return COLOR[i];
                },
                "margin":"7px"
            })
            .html(function (d) {
                return d;
            });
    }



}

update_stream(474);

function update_stream(section_id) {

    //new Date(2016,0,1,7,0,0),new Date(2016,0,2,7,0,0) day
    //new Date(2016,0,1,7,0,0),new Date(2016,1,1,7,0,0) month

    $.ajax({
        url: "/section_id_data",    //请求的url地址
        data:{
            section_id:section_id.toLocaleString(),
            date_extent:[new Date(2016,0,1,7,0,0),new Date(2016,1,1,7,0,0)]
        },
        dataType: "json",   //返回格式为json
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_data, textStatus) {

            section_data.forEach(function (d) {
                d.start_date_time = new Date(d.start_date_time);
                d.start_date_time.setSeconds(0,0);
                d.stay_time = +d.stay_time;
            });

            d3.select("#time_svg").remove("*");
            Time_Line(section_data,section_id);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}