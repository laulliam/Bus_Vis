/**
 * Created by Liang Liu on 2019/4/1.
 */
time_line(20040063);

function time_line(station_id){
    $.ajax({
        url: "/station_run_id",    //请求的url地址
        dataType: "json",   //返回格式为json
        data:{station_id:station_id},
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (data, textStatus) {
            data.forEach(function (d) {
                if(d.stay_time>100)
                    d.stay_time = 0;
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

    var time_line = $("#time_line");

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = time_line.width() - margin.left - margin.right,
        height = time_line.height() - margin.top - margin.bottom;

    var date_extent = d3.extent(data,function (d) {
        return d.start_date_time;
    });

    var x_scale = d3.time.scale()
        .domain(date_extent)
        .range([0,width-20]);

    var y_scale = d3.scale.sqrt()
        .domain([0,d3.max(data,function (d) {
            return d.stay_time;
        })])
        .range([height-20,0]);

    var zoom = d3.behavior.zoom()
        .x(x_scale)
        .scale(50)
        //.scaleExtent(SCALE_EXTENT)
        .on("zoom", zoomed);

    var svg = d3.select("#time_line").append("svg")
        .attr("width", width )
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top*2 + ")")
        .call(zoom);

    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom");

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("right");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (height-20) + ")")
        .call(x_axis);

    svg.append("g")
        .attr("class", "y axis")
        //.attr("transform", "translate(" + margin.left + ",0)")
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
        .attr("transform", "translate(" + margin.left + ",0)");

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
        });

    var legend_div = d3.select("#time_line").append("div")
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

    var tooltip = d3.select("#time_line")
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
            vertical.style("left", mousex + "px")});

    function zoomed() {
        svg.select(".x.axis").call(x_axis);
        routes.select("path").attr("d", function (d) {
            return line(d.values);
        });
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
        xScale = d3.time.scale()
            .range([0, width]);

    let stack = d3.layout.stack()
        .offset("wiggle")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.stay_time; });

    let areaStacked = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return yScaleStacked(d.y0); })
        .y1(function(d) { return yScaleStacked(d.y0 + d.y); });

    let areaMultiples = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return yScaleMultiples(0); })
        .y1(function(d) { return yScaleMultiples(d.stay_time); });

    xScale.domain(d3.extent(data, function(d) { return d.date; }));

    let zoom = d3.behavior.zoom()
        .x(xScale)
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

    let xAxis = d3.svg.axis()
        .scale(xScale)
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

            let invert_x = xScale.invert(mousex);
            let min = invert_x.getMinutes();
            min = (min%10>=5)?(parseInt(min/10 + 1)*10):(parseInt(min/10)*10);
            invert_x.setSeconds(0);
            invert_x.setMinutes(min);

            console.log(invert_x);

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
        .call(xAxis);

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
        svg.select(".x.axis").call(xAxis);
        if(area_type === 'multiples')
            svg.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });
        else
            svg.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });

    }
}


