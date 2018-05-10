var datearray = [];
var colorrange = [];

function chart(data) {

    colorrange = [d3.rgb(79, 107, 218), d3.rgb(165, 241, 88), d3.rgb(38, 232, 145),d3.rgb(27, 191, 202), d3.rgb(32, 227, 155),d3.rgb(100, 80, 195)];

    var strokecolor = colorrange[0];

    var format = d3.time.format("%m/%d/%y");

    var margin = {top: 10, right: 5, bottom: 20, left: 5};

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var width = (body_width * 0.7 - 2 * border)-margin.left-margin.right;
    var height = (body_height * 0.25 - 3 * border)-margin.top-margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height-10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.weeks);

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .trans
        .on("zoom", zoomed);

    function zoomed() {
        g.attr("transform",
            "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

        g.attr("transform",
            "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.sub_route_id; });

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) {return x(d.date); })
        .y0(function(d) {return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svg = d3.select("#time_line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

    var date_extent = d3.extent(data,function (d) {
        return d.start_date_time;
    })

    var routes_data = nest.entries(data);

    console.log(routes_data);

    routes_data.forEach(function (d) {
        d.values = ret(d.values);
        d.values = data_process(d.values);
    });

    function ret(arr){
        var res=[arr[0]];
        for(var j=1;j<arr.length;j++){
            var repeat= false;
            for(var i=0;i<res.length;i++){
                if(arr[j].start_date_time.getTime()==res[i].start_date_time.getTime()){
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
                data.push({date:now,value:0});

            now=new Date(now.getTime()+minmis);

        }
        return data;
    }

    var layers = stack(routes_data);

    x.domain(d3.extent(data, function(d) { return d.start_date_time; }));
    y.domain([0, d3.max(data, function(d) { return d.stay_time; })]);

    var g1 = svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });

    var g = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function(d, i) {
            svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                    return j != i ? 0.6 : 1;
                })})

        .on("mousemove", function(d, i) {
            var selected = (d.values);
            for (var k = 0; k < selected.length; k++) {
                datearray[k] = selected[k].date;
                datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
            }
        })
        .on("mouseout", function(d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
        })
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
            chart(section_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}