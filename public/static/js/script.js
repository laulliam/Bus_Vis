function time_line(dataset) {

    console.log(dataset);
    var parseDate = d3.time.format("%b %Y").parse,
        formatYear = d3.format("02d"),
        formatDate = function(d) { return formatYear(d.getFullYear()); };

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var margin = {top: 40, right: 20, bottom: 40, left: 60},
        lineheight = height
    var width = (body_width * 0.7 - 2 * border);
    var height = (body_height * 0.3 - 3 * border)-margin.top-margin.bottom;

    var yScaleStacked = d3.scale.linear().range([height, 0]),
        yScaleMultiples = d3.scale.linear().range([height, 0]),
        xScale = d3.time.scale().rangeRound([0, width]),
        colorScale = d3.scale.ordinal().range(colorbrewer.Blues[5].reverse());

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(d3.time.years)
        .tickFormat(formatDate);

    var stack = d3.layout.stack()
        .offset("wiggle")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.group; });

    var nest_test = d3.nest()
        .key(function(d) { return d.start_date_time; });

    var nest_ = d3.nest()
        .key(function(d) { return d.start_date_time; });

    var date_extent = d3.extent(dataset,function (d) {
        return d.start_date_time;
    });

    var layers = nest_test.entries(dataset);

    console.log(layers);

    var areaStacked = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return yScaleStacked(d.y0); })
        .y1(function(d) { return yScaleStacked(d.y0 + d.y); });

    var areaMultiples = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return lineheight; })
        .y1(function(d) { return yScaleMultiples(d.value); });

    var svg = d3.select("#time_line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("static/files/stocks.csv", function(error, data) {

        console.log(data);

        data.forEach(function(d) {
            d.group = d.symbol,
                d.date = parseDate(d.date);
            d.value = +d.price;
        });

        data.sort(function(a, b) {
            return a.date - b.date;
        });

        var nested = nest.entries(data);

        var layers = stack(nested);

        console.log(layers);

        lineheight = height / nested.length;

        xScale.domain(d3.extent(data, function(d) { return d.date; }));
        yScaleStacked.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
        yScaleMultiples.domain([0, d3.max(data, function(d) { return d.value; })]).range([lineheight, 0]);

        var group = svg.selectAll(".group")
            .data(layers)
            .enter().append("g")
            .attr("class", "group")
            .attr("id", function(d){ return d.key})
        //.attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineheight) +")"; });

        group.append("text")
            .attr("class", "group-label")
            .attr("x", -6)
            // .attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; })
            .text(function(d) { return d.key; });

        group.append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return areaMultiples(d.values); })
            .style("fill", function(d, i) { return colorScale(i); });

        svg.append("g")
            .attr("class", "x axis")
            // .attr("transform", "translate(0," + (height + 20) + ")")
            .call(xAxis);

        d3.selectAll("input").on("change", change);

        function change() {
            if (this.value === "multiples") transitionMultiples();
            else transitionStacked();
        }

        function transitionMultiples() {
            var t = svg.transition().duration(750),
                g = t.selectAll(".group").attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineheight) +")"; });
            g.selectAll(".layer").attr("d", function(d) { return areaMultiples(d.values); });
            g.select(".group-label").attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; });
        }

        function transitionStacked() {
            var t = svg.transition().duration(750),
                g = t.selectAll(".group").attr('transform', function(){ return "translate(0,0)"; });
            g.selectAll(".layer").attr("d", function(d) { return areaStacked(d.values); });
            g.select(".group-label").attr('transform', function(d, i){ return "translate(0," + yScaleStacked(d.values[0].y0) +")"; });
        }
    });
}
updata_stream(1385);

function updata_stream(section_id) {

    //new Date(2016,0,1,7,0,0),new Date(2016,0,2,7,0,0) day
    //new Date(2016,0,1,7,0,0),new Date(2016,1,1,7,0,0) month

    $.ajax({
        url: "/section_id_data",    //请求的url地址
        data:{
            section_id:section_id.toLocaleString(),
            date_extent:[new Date(2016,0,1,7,0,0),new Date(2016,0,2,7,0,0)]
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
            time_line(section_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}