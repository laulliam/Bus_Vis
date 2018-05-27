

function chart(data) {

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

    nest_data.forEach(function (d) {
        d.values.sort(function (a,b) {
            return a.start_date_time - b.start_date_time;
        });
    });

    var line_height = (height - margin.bottom)/nest_data.length;

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
        // .scaleExtent(SCALE_EXTENT)
        .on("zoom", zoomed);

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

    svg.append("g")
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


    function zoomed() {
        svg.select(".x.axis").call(xAxis);
        routes_g.select("path").attr("d", function (d) {
            return line(d.values);
        });
    }

}

update_stream(1385);

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
            chart(section_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}