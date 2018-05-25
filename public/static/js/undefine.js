chart(1);
function chart(data) {
    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var width=(body_width * 0.15 -  border);
    var height=(body_height * 0.25 - border);
    var start = 0,
        end = 2.25,
        numSpirals = 3,
        margin = {top:5,bottom:5,left:5,right:5};

    var theta = function(r) {
        return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scale.category10();

    var r = d3.min([width, height])/2 -20;

    var radius = d3.scale.linear()
        .domain([start, end])
        .range([20, r]);

    var svg = d3.select("#undefine").append("svg")
        .attr("width", width )
        .attr("height", height )
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.svg.line.radial()
        .interpolate("cardinal")
        .angle(theta)
        .radius(radius);

    var path = svg.append("path")
        .datum(points)
        .attr("id", "spiral")
        .attr("d", spiral)
        .style("fill", "none")
        .style("stroke", "#FFFFFF");

    var spiralLength = path.node().getTotalLength(),
        N = 365,
        barWidth = (spiralLength / N) - 1;
    var someData = [];
    for (var i = 0; i < N; i++) {
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        someData.push({
            date: currentDate,
            value: Math.random()*500,
            group: currentDate.getMonth()
        });
    }

    var timeScale = d3.time.scale()
        .domain(d3.extent(someData, function(d){
            return d.date;
        }))
        .range([0, spiralLength]);

    // yScale for the bar height
    var yScale = d3.scale.linear()
        .domain([0, d3.max(someData, function(d){
            return d.value;
        })])
        .range([0, (r / numSpirals) -20]);

    svg.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function(d,i){

            var linePer = timeScale(d.date),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer; // % distance are on the spiral
            d.x = posOnLine.x; // x postion on the spiral
            d.y = posOnLine.y; // y position on the spiral

            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

            return d.x;
        })
        .attr("y", function(d){
            return d.y;
        })
        .attr("width", function(d){
            return barWidth;
        })
        .attr("height", function(d){
            return yScale(d.value);
        })
        .style("fill", "#b2b2b2")
        .style("stroke", "none")
        .attr("transform", function(d){
            return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
        });

    // add date labels
    var tF = d3.time.format("%b %Y"),
        firstInMonth = {};

    svg.selectAll("text")
        .data(someData)
        .enter()
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        // only add for the first of each month
        .filter(function(d){
            var sd = tF(d.date);
            if (!firstInMonth[sd]){
                firstInMonth[sd] = 1;
                return true;
            }
            return false;
        })
        .text(function(d){
            return tF(d.date);
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function(d){
            return ((d.linePer / spiralLength) * 100) + "%";
        });

    svg.selectAll("rect")
        .on('mouseover', function(d) {
            d3.select("#undefine").selectAll("rect")
                .style("opacity", 0.3);
            d3.select(this)
                .style("opacity",1);

        })
        .on('mousemove', function(d) {
        })
        .on('mouseout', function(d) {
            d3.select("#undefine").selectAll("rect")
                .style("opacity", 1);
        });
}