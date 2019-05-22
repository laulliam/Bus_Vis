/**
 * Created by Liang Liu on 2019/4/1.
 */
time_line(757);

function time_line(section_id){
    $.ajax({
        url: "/time_line_data",    //请求的url地址
        dataType: "json",   //返回格式为json
        data:{section_id:section_id},
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
            time_line_chart(data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

function time_line_chart(data) {

    //console.log(data);

    var route_nest = d3.nest().key(function (d) {
        return d.sub_route_id;
    });

    var dataset = route_nest.entries(data);

    dataset.forEach(function (d) {
        d.values.sort(function (a,b) {
            return a.start_date_time.getTime() - b.start_date_time.getTime();
        });
    });
    //console.log(dataset);

    var time_line_wh = $("#time_line");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = time_line_wh.width() - margin.left - margin.right,
        height = time_line_wh.height() - margin.top - margin.bottom;

    var date_extent = d3.extent(data,function (d) {
        return d.start_date_time;
    });

    var x_scale = d3.time.scale()
        .domain(date_extent)
        .range([0,width]);

    var y_scale = d3.scale.linear()
        .domain([0,d3.max(data,function (d) {
            return d.stay_time;
        })])
        .range([height-40,0]);

    var zoom = d3.behavior.zoom()
        .x(x_scale)
        //.scale(50)
        //.scaleExtent(SCALE_EXTENT)
        .on("zoom", zoomed);

    var time_line ={
        IsZoom:true,
        IsChecked:false
    };

    d3.select("#time_line_svg").remove();
    d3.select("#time_line_label").remove();
    d3.select(".remove").remove();
    d3.select("#time_line").select(".label").remove();

    var svg = d3.select("#time_line").append("svg")
        .attr("id","time_line_svg")
        .attr("width", width )
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top*2 + ")")
        .call(zoom);

    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .tickFormat(d3.time.format("%m/%d %H:%M"))
        .orient("bottom");

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("left");

    time_line.axis_g = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left+10) + "," + (height-20) + ")")
        .call(x_axis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(30,20)")
        .call(y_axis);

    var line = d3.svg.line()//d3中绘制曲线的函数
        .x(function(d, i){
            return x_scale(d.start_date_time);
        })//曲线中x的值
        .y(function(d){
            return y_scale(d.stay_time);
        })//曲线中y的值
        .interpolate("basis");//把曲线设置光滑

    var routes_g = svg.append("g")
        .attr("transform", "translate(" + (margin.left+10) + ",20)");

    var routes = routes_g.selectAll(".route_line")
        .data(dataset)
        .enter()
        .append("g")
        .attr("class",function(d){ return "routes_line route_"+d.key});

    routes.append("path")
        .attr('fill', "none")
        .attr('opacity', 0.6)
        .attr('stroke', function (d,i) {
            return COLOR[i];
        })
        .attr("stroke-width",2)
        .attr("d", function (d) {
            return line(d.values)
        })
        .attr("clip-path", "url(#clip_path)");

    var line_g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");

    line_g.append("clipPath")
        .attr("id", "clip_path")
        .append("rect")
        .attr({
            // x: 0,
            // y: 0,
            width: width,
            height: height
        });


    var legend_div = d3.select("#time_line").append("div")
        .attr("id","time_line_label")
        .style({
            "position": "absolute",
            "z-index": "999",
            "right": "20px",
            "top":"10px"
        })
        .selectAll("label label-default legend_label")
        .data(dataset)
        .enter()
        .append("span")
        .attr("class","label label-default legend_label")
        .on("mouseover",function (d) {
            d3.selectAll(".routes_line").style("opacity",0.3);
            d3.select(".route_"+d.key).style("opacity",1);
        })
        .on("mouseout",function (d) {
            d3.selectAll(".routes_line").style("opacity",1)
        })
        .on("click",function (d) {
            spiral_line(d.key, [new Date(2016,0,1,0,0,0),
                new Date(2016,0,2,0,0,0)]);

            message_cloud(d.key)
        })
        .style({
            "background-color":function (d,i) {
                return COLOR[i];
            },
            "cursor": "pointer",
            "margin":"7px",
            "curos-events":"none"
        })
        .html(function (d) {
            return d.key;
        });

    /*    var tooltip = d3.select("#time_line")
            .append("div")
            .attr("class", "label")
            .style("position", "absolute")
            .style("z-index", "20")
            .style("visibility", "hidden")
            .style("top", "30px")
            .style("left", "55px");

        var vertical = d3.select("#time_line")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", height-margin.top-margin.bottom)
            .style("top", "30px")
            .style("bottom", "20px")
            .style("left", "0px")
            .style("pointer-events","none")
            .style("background", "#fff");

        d3.select("#time_line")
            .on("mousemove", function(){
                let mousex = d3.mouse(this);
                mousex = mousex[0] + 1;
                vertical.style("left", mousex + "px" )})
            .on("mouseover", function(){
                let mousex = d3.mouse(this);
                mousex = mousex[0] + 1;
                vertical.style("left", mousex + "px")});*/

    InitTools();

    function play() {

        time_line.new_data_extent=date_extent;
        time_line.interval = setInterval(function () {

            time_line.new_data_extent=[new Date(time_line.new_data_extent[0].setHours(time_line.new_data_extent[0].getHours()+1)),
                new Date(time_line.new_data_extent[0].setHours(time_line.new_data_extent[0].getHours()+23))];
            if(time_line.new_data_extent[1].getMonth()>0) {
                time_line.new_data_extent=date_extent;
            }
            x_scale.domain(time_line.new_data_extent);
            //console.log(new_data_extent);
            x_axis.scale(x_scale);
            svg.select(".x.axis").call(x_axis);
            routes_g.selectAll("path").attr("d", function (d) {
                return line(d.values.sort(function (a,b) {
                    return a.start_date_time.getTime() - b.start_date_time.getTime();
                }));
            });
        },1000);
    }

    function stop() {
        clearInterval(time_line.interval);
        //x_scale.domain(time_line.new_data_extent);

        // if( time_line.brush){
        //     time_line.brush.x(x_scale);
        //     time_line.g_brush.call(time_line.brush);
        // }
        //x_axis.scale(x_scale);
        //svg.select(".x.axis").call(x_axis);
        // routes_g.selectAll("path").attr("d", function (d) {
        //     return line(d.values);
        // });
    }

    function InitTools() {
        var time_line_tool = d3.select("#time_line")
            .append("div")
            .attr("class", "btn-group btn-group-xs")
            .style({
                "position": "absolute",
                "z-index": "999",
                "left": "40px",
                "top":"5%"
            })
            .selectAll("btn btn-default")
            .data(["play","refresh"])
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
                        return "重置";
                }
            });

        time_line_tool.append("span")
            .attr("class", function (d) {
                return "glyphicon glyphicon-"+ d;
            })
            .attr("aria-hidden",true);

        time_line_tool.on("click",function (d) {
            if(d === "play"){
                var play_span = d3.select("#play span");
                var stat = play_span.attr("class");
                play_span.attr("class","glyphicon glyphicon-"+((stat === "glyphicon glyphicon-play")?"pause":"play"));
                (stat === "glyphicon glyphicon-play")?play():stop();
                time_line.IsZoom = !time_line.IsZoom;
            }
            else if(d === "refresh"){
                x_scale.domain(date_extent);
                x_axis.scale(x_scale);
                svg.select(".x.axis").call(x_axis);
                routes_g.selectAll("path").attr("d", function (d) {
                    return line(d.values.sort(function (a,b) {
                        return a.start_date_time.getTime() - b.start_date_time.getTime();
                    }));
                });
                //time_line.IsZoom=!time_line.IsZoom;
                //time_line.IsChecked=!time_line.IsChecked;
                //time_line.IsChecked?CreateBrush():RemoveBrush();
                //CreateBrush();
            }
        })

    }

    function CreateBrush() {

        time_line.brush = d3.svg.brush()
            .x(x_scale)
            //.extent(time_line.new_data_extent)
            .on("brushend", brushed);

        function brushed() {
            console.log(time_line.brush.extent());
        }

        time_line.g_brush = svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + margin.left + "," + 0 + ")")
            .call(time_line.brush)
        //.call(time_line.brush.move, x_scale.range());

        time_line.g_brush.selectAll("rect").attr("height", height-margin.bottom);
    }

    function RemoveBrush() {
        // time_line.brush = d3.svg.brush();
        // time_line.g_brush = svg.append("g")
        //     .attr("class", "brush")
        //     .attr("transform", "translate(" + margin.left + "," + 0 + ")");
    }


    function zoomed() {
        if(time_line.IsZoom) {
            svg.select(".x.axis").call(x_axis);
            routes.selectAll("path").attr("d", function (d) {
                return line(d.values);
            });
        }
    }

}

function stack_graph(data) {

    let time_line = $("#time_line");

    let margin = {top: 40, right: 20, bottom: 40, left: 60},
        width = time_line.width() - margin.left - margin.right,
        height = time_line.height() - margin.top - margin.bottom,
        lineheight = height;

    let yScaleStacked = d3.scale.linear().range([height, 0]),
        yScaleMultiples = d3.scale.linear().range([height, 0]),
        x_scale = d3.time.scale()
            .range([0, width]);

    let stack = d3.layout.stack()
        .offset("wiggle")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.stay_time; });

    let areaStacked = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x_scale(d.date); })
        .y0(function(d) { return yScaleStacked(d.y0); })
        .y1(function(d) { return yScaleStacked(d.y0 + d.y); });

    let areaMultiples = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x_scale(d.date); })
        .y0(function(d) { return yScaleMultiples(0); })
        .y1(function(d) { return yScaleMultiples(d.stay_time); });

    x_scale.domain(d3.extent(data, function(d) { return d.date; }));

    let zoom = d3.behavior.zoom()
        .x(x_scale)
        //.scaleExtent([1, 16])
        .on("zoom", zoomed);

    let svg = d3.select("#time_line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(zoom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let tooltip = d3.select("time_line")
        .append("div")
        .attr("class", "label")
        .style("position", "absolute")
        .style("z-index", "20")
        //.style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");

    let vertical = d3.select("#time_line")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", height)
        .style("top", "10px")
        .style("bottom", "0px")
        .style("left", "0px")
        .style("pointer-events","none")
        .style("background", "#fff");

    d3.select("#time_line")
        .on("mousemove", function(){
            let mousex = d3.mouse(this);
            mousex = mousex[0] + 1;
            vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){
            let mousex = d3.mouse(this);
            mousex = mousex[0] + 1;
            vertical.style("left", mousex + "px")});

    let nest = d3.nest()
        .key(function(d) { return d.route_id; });

    let nested = nest.entries(data);
    let layers = stack(nested);

    lineheight = height / nested.length;

    yScaleStacked.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    yScaleMultiples.domain([0, d3.max(data, function(d) { return d.stay_time; })]).range([lineheight, 0]);

    let x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom")
        .tickFormat(d3.time.format("%H:%M"))
    //.ticks(20);

    let area = svg.selectAll(".area")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "area")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineheight) +")"; });

    area.append("text")
        .attr("class", "area-label")
        .attr("x", -6)
        .attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; })
        .text(function(d) { return d.key; });

    area.append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return areaMultiples(d.values); })
        .style("fill", function (d,i) {
            return COLOR[i];
        })
        .attr("opacity",0.7)
        .on("mouseover",function (d,i) {
            d3.select(this)
                .transition()
                .duration(200)
                .ease("bounce")
                .attr("opacity",1);

            let mousex = d3.mouse(this)[0];

            let invert_x = x_scale.invert(mousex);
            let min = invert_x.getMinutes();
            min = (min%10>=5)?(parseInt(min/10 + 1)*10):(parseInt(min/10)*10);
            invert_x.setSeconds(0);
            invert_x.setMinutes(min);

            d.values.forEach((s)=>{
                if(invert_x.getTime() === s.date.getTime()){
                    tooltip.html( "<p>" +d.key +":   "+ s.value + "</p>" ).style("visibility", "visible");
                    return false;
                }
            });

        })
        .on("mouseout",function (d,i) {
            d3.select(this)
                .transition()
                .duration(200)
                .ease("bounce")
                .attr("opacity",.7);

            tooltip.html( "<p>" +d.key + "</p>" ).style("visibility", "hidden");
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height+10) + ")")
        .call(x_axis);

    d3.selectAll(".multi_stacked").on("click", change);

    let area_type = "multiples";

    function change() {
        if (this.value === "multiples") {
            transitionMultiples();
            area_type = 'multiples';
        }
        else {
            transitionStacked();
            area_type = 'stacked';
        }
    }

    function transitionMultiples() {
        let t = svg.transition().duration(750),
            g = t.selectAll(".area").attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineheight) +")"; });
        g.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });
        g.selectAll(".area-label").style("display","block");
        g.select(".area-label").attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; });
    }

    function transitionStacked() {
        let t = svg.transition().duration(750),
            g = t.selectAll(".area").attr('transform', function(){ return "translate(0,0)"; });
        g.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });
        g.selectAll(".area-label").style("display","none");
    }

    function zoomed() {
        svg.select(".x.axis").call(x_axis);
        if(area_type === 'multiples')
            svg.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });
        else
            svg.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });

    }
}


