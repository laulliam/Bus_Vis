function time_line() {

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

    var click_stat = false;

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

    d3.csv("static/files/stocks.csv", function(error, data) {

        var svg = d3.select("#time_line").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .on("click",change)
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        console.log(data);

        data.forEach(function(d) {
            d.group = d.symbol,
                d.date = parseDate(d.date);
            d.value = +d.price;
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
            .attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; })
            .text(function(d) { return d.key; });

        group.append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return areaMultiples(d.values); })
            .style("fill", function(d, i) { return colorScale(i); });

        svg.append("g")
            .attr("class", "x axis")
            // .attr("transform", "translate(0," + (height + 20) + ")")
            .call(xAxis);


        function change() {
            if(click_stat){
                transitionMultiples();
                click_stat = false;
            }
            else {
                transitionStacked();
                click_stat = true;
            }
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

function time_line_(dataset) {

    console.log(dataset);

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var margin = {top: 300, right: 10, bottom: 40, left: 5};

    var width = (body_width * 0.7 - 2 * border);
    var height = (body_height * 0.7 - 3 * border)-margin.top-margin.bottom;

    var lineheight = height;

    var yScaleStacked = d3.scale.linear().range([height, 0]),
        yScaleMultiples = d3.scale.linear().range([height, 0]),
        xScale = d3.time.scale().range([0, width]),
        colorScale = d3.scale.ordinal().range(colorbrewer.Blues[5].reverse());

    var click_stat = false;

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(d3.time.hours);
    //.tickFormat(formatDate);

    var stack = d3.layout.stack()
        .offset("wiggle")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.sub_route_id; });

    var date_extent = d3.extent(dataset,function (d) {
        return d.start_date_time;
    });

    var areaStacked = d3.svg.area()
        .interpolate("basis")
        .x(function(d) {return xScale(d.date); })
        .y0(function(d) {
            return yScaleStacked(d.y0); })
        .y1(function(d) {
            return yScaleStacked(d.y0 + d.y); });


    var areaMultiples = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return xScale(d.date); })
        .y0(function(d) { return lineheight; })
        .y1(function(d) { return yScaleMultiples(d.value); });

    var svg = d3.select("#main").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left+ "," + margin.top+ ")")
        .on("click", change);

    var nested = nest.entries(dataset);

    nested.forEach(function (d) {
        d.values = ret(d.values);
        d.values = data_process(d.values);
    });

    function ret(arr){
        var res=[arr[0]];
        for(var j=1;j<arr.length;j++){
            var repeat= false;
            for(var i=0;i<res.length;i++){
                if(arr[j].start_date_time.getTime()==res[i].start_date_time.getTime()){
                    console.log(1);
                    repeat=true;
                    break;
                }
            }
            if(!repeat){
                res.push(arr[j]);
            }
        }
        return res;
    };

    function data_process(route_data) {

        var data= [];
        var date1 = date_extent[0];
        var date2 = date_extent[1];
        var minmis= 60*1000;
        var now=date1;
        while(now<=date2){
            var flag = false;
            route_data.forEach(function (d) {

                flag == false;

                if(now.getHours() == d.start_date_time.getHours()&&now.getMinutes() == d.start_date_time.getMinutes())
                {
                    data.push({date:d.start_date_time,value:d.stay_time});
                    flag = true;

                }
            });

            if(flag !=true)
                data.push({date:now,value:Math.round(Math.random()*100)});

            now=new Date(now.getTime()+minmis);

        }
        return data;
    }

    var layers = stack(nested);

    console.log(layers);

    lineheight = height / nested.length;

    xScale.domain(date_extent);
    yScaleStacked.domain([0, d3.max(dataset, function(d) { return  Math.round(Math.random()*100)+d.stay_time; })]);
    yScaleMultiples.domain([0, d3.max(dataset, function(d) { return d.stay_time; })]).range([lineheight, 0]);

    var group = svg.selectAll(".group")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "group")
        .attr("id", function(d){ return d.key})
        .attr('transform', function(d, i){ return "translate(0," + (height - (i+1) * lineheight) +")"; });

    /*    group.append("text")
            .attr("class", "group-label")
            .attr("x", -6)
            // .attr('transform', function(d, i){ return "translate(0," + (lineheight - 6) +")"; })
            .text(function(d) { return d.key; });*/

    group.append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return areaMultiples(d.values); })
        .style("fill", function(d, i) { return colorScale(i); });

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    function change() {

        if(click_stat){
            transitionMultiples();
            click_stat = false;
        }
        else {
            transitionStacked();
            click_stat = true;
        }
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

        g.selectAll(".layer").attr("d", function(d) {
            return areaStacked(d.values);
        });
        g.select(".group-label").attr('transform', function(d, i){ return "translate(0," + yScaleStacked(d.values[0].y0) +")"; });
    }

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
            });
            time_line();
            time_line_(section_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}