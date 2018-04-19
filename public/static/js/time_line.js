var datearray = [];
var colorrange = [];

function chart(dataset) {

    colorrange = [d3.rgb(79, 107, 218), d3.rgb(165, 241, 88), d3.rgb(38, 232, 145),d3.rgb(27, 191, 202), d3.rgb(32, 227, 155),d3.rgb(100, 80, 195)];

    var strokecolor = colorrange[0];

    var format = d3.time.format("%m/%d/%y");

    var margin = {top: 10, right: 5, bottom: 20, left: 5};

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var width = (body_width * 0.7 - 2 * border)-margin.left-margin.right;
    var height = (body_height * 0.3 - 3 * border)-margin.top-margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height-10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y);

    var yAxisr = d3.svg.axis()
        .scale(y);


    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svg = d3.select("#time_line")
        .append("svg")
        .attr("id","time_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //.call();


    var extent_date = d3.extent(dataset,function (d) {
        return d.start_date_time;
    });

    var nest = d3.nest().key(function(d) { return d.route_id});

    var routes = nest.entries(dataset);

    routes.forEach(function (d) {
        d.values = data_process(d.values);
    });

    function data_process(route_data) {

        var data= [];
        var date1 = extent_date[0];
        var date2 = extent_date[1];
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

    var layers = stack(routes);

    console.log(layers);

    x.domain(d3.extent(dataset, function(d) { return d.start_date_time; }));
    y.domain([0, d3.max(dataset, function(d) { return d.stay_time+d.stay_time/2; })]);

    svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function(d) {
            return area(d.values); })
        .style("fill", function(d, i) { return z(i); });


    svg.append("g")
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