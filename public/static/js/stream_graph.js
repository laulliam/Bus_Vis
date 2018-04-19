function streamgraph() {
    var _chart = {};

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var _width = (body_width * 0.7 - 2 * border);
    var _height = (body_height * 0.3 - 3 * border);

    var _margins = {top: 30, left: 30, right: 30, bottom: 80},
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
                return "translate(" + xStart() + "," + (yStart() + 50) + ")";
            })
            .call(xAxis);
    }

    function renderYAxis(axesG) {
        var yAxis = d3.svg.axis()
            .scale(_y.range([quadrantHeight(), 0]))
            .orient("left");
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

        var stack = d3.layout.stack()
            .offset('wiggle');
        var stackedData = stack(_data);

        renderAreas(stackedData);
    }

    function renderAreas(stackedData) {

        var area = d3.svg.area()
            .interpolate('cardinal')
            .x(function (d) {
                return _x(d.x);
            })
            .y0(function(d){return _y(d.y0);})
            .y1(function (d) {
                return _y(d.y + d.y0);
            });

        _bodyG.selectAll("path.area")
            .data(stackedData)
            .enter()
            .append("path")
            .style("fill", function (d, i) {
                return _colors(Math.random());
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
    return Math.random() * 10;
}

var numberOfSeries = 8,
    numberOfDataPoint = 51,
    data = [];

for (var i = 0; i < numberOfSeries; ++i)
    data.push(d3.range(numberOfDataPoint).map(function (i) {
        return {x: i, y: randomData()};
    }));

var chart = streamgraph()
    .x(d3.scale.linear().domain([0, numberOfDataPoint - 1]))
    .y(d3.scale.linear().domain([0, 65]))
    .colors(d3.scale.linear().range(["#aad", "#556"]));

data.forEach(function (series) {
    chart.addSeries(series);
});

chart.render();