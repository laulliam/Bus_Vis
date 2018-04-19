function stackedAreaChart() {
    var _chart = {};

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var _width = (body_width * 0.7 - 2 * border);
    var _height = (body_height * 0.3 - 3 * border);

    var _margins = {top: 30, left: 30, right: 30, bottom: 30},
        _x, _y,
        _data = [],
        _colors = d3.scale.category10(),
        _svg,
        _bodyG,
        _line;

    _chart.render = function () {
        if (!_svg) {
            _svg = d3.select("#time_line").append("svg")
                .attr("height", _height)
                .attr("width", _width);

            renderAxes(_svg);

            defineBodyClip(_svg);
        }

        renderBody(_svg);
    };

    function renderAxes(svg) {
        var axesG = svg.append("g")
            .attr("class", "axes");

        renderXAxis(axesG);

        renderYAxis(axesG);
    }

    function renderXAxis(axesG) {
        var xAxis = d3.svg.axis()
            .scale(_x.range([0, quadrantWidth()]))
            .orient("bottom");

        axesG.append("g")
            .attr("class", "x axis")
            .attr("transform", function () {
                return "translate(" + xStart() + "," + yStart() + ")";
            })
            .call(xAxis);

        d3.selectAll("g.x g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -quadrantHeight());
    }

    function renderYAxis(axesG) {
        var yAxis = d3.svg.axis()
            .scale(_y.range([quadrantHeight(), 0]))
            .orient("left");

        axesG.append("g")
            .attr("class", "y axis")
            .attr("transform", function () {
                return "translate(" + xStart() + "," + yEnd() + ")";
            })
            .call(yAxis);

        d3.selectAll("g.y g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", quadrantWidth())
            .attr("y2", 0);
    }

    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
            .append("clipPath")
            .attr("id", "body-clip")
            .append("rect")
            .attr("x", 0 - padding)
            .attr("y", 0)
            .attr("width", quadrantWidth() + 2 * padding)
            .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                .attr("class", "body")
                .attr("transform", "translate("
                    + xStart() + ","
                    + yEnd() + ")")
                .attr("clip-path", "url(#body-clip)");

        var stack = d3.layout.stack() //<-A
            .offset('silhouette');//[expand, wiggle, zero, silhouette]
        stack(_data); //<-B

        renderLines(_data);

        renderAreas(_data);
    }

    function renderLines(stackedData) {
        _line = d3.svg.line()
            .x(function (d) {
                return _x(d.x); //<-C
            })
            .y(function (d) {
                return _y(d.y + d.y0); //<-D
            });

        _bodyG.selectAll("path.line")
            .data(stackedData)
            .enter()
            .append("path")
            .style("stroke", function (d, i) {
                return _colors(i);
            })
            .attr("class", "line");

        _bodyG.selectAll("path.line")
            .data(stackedData)
            .transition()
            .attr("d", function (d) {
                return _line(d);
            });
    }

    function renderAreas(stackedData) {
        var area = d3.svg.area()
            .x(function (d) {
                return _x(d.x); //<-E
            })
            .y0(function(d){return _y(d.y0);}) //<-F
            .y1(function (d) {
                return _y(d.y + d.y0); //<-G
            });

        _bodyG.selectAll("path.area")
            .data(stackedData)
            .enter()
            .append("path")
            .style("fill", function (d, i) {
                return _colors(i);
            })
            .attr("class", "area");

        _bodyG.selectAll("path.area")
            .data(_data)
            .transition()
            .attr("d", function (d) {
                return area(d);
            });
    }

    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.x = function (x) {
        if (!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    _chart.y = function (y) {
        if (!arguments.length) return _y;
        _y = y;
        return _chart;
    };

    _chart.addSeries = function (series) {
        _data.push(series);
        return _chart;
    };

    return _chart;
}

function randomData() {
    return Math.random() * 9;
}

function update() {
    for (var i = 0; i < data.length; ++i) {
        var series = data[i];
        series.length = 0;
        for (var j = 0; j < numberOfDataPoint; ++j)
            series.push({x: j, y: randomData()});
    }

    chart.render();
}

var numberOfSeries = 3,
    numberOfDataPoint = 51,
    data = [];

for (var i = 0; i < numberOfSeries; ++i)
    data.push(d3.range(numberOfDataPoint).map(function (i) {
        return {x: i, y: randomData()};
    }));

var chart = stackedAreaChart()
    .x(d3.scale.linear().domain([0, numberOfDataPoint - 1]))
    .y(d3.scale.linear().domain([0, 26]));

data.forEach(function (series) {
    chart.addSeries(series);
});

chart.render();