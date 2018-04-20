


charts("static/files/data.csv", "blue");
var datearray = [];
var colorrange = [];

function charts(csvpath, color) {

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


    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.value; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svg = d3.select("#time_line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //.call();

    d3.csv(csvpath, function(data) {
        data.forEach(function(d) {
            d.date = format.parse(d.date);
            d.value = +d.value;
        });

        var layers = stack(nest.entries(data));

        console.log(nest.entries(data));

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter()
            .append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d.values); })
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
    });
}