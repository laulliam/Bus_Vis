function AreaChart(init_data_line) {
    var areaChart = {};
    var area_line = $("#area_line");
    areaChart.width = area_line.width() ;
    areaChart.height = area_line.height();
    createChart();

    function createChart() {
        areaChart.padding = {left: 0, right:0, top: 10, bottom: 20};
        areaChart.padding_width = areaChart.width - areaChart.padding.left - areaChart.padding.right;
        areaChart.padding_height = areaChart.height - areaChart.padding.bottom - areaChart.padding.top;
        areaChart.x_scale = d3.time.scale()
            .domain(d3.extent(init_data_line, function (d) {
                return new Date(d.key);
            }))
            .range([0, areaChart.padding_width]);
        areaChart.y_scale = d3.scale.linear()
            .domain(d3.extent(init_data_line, function (d) {
                return d.values;
            }))
            .range([areaChart.padding_height, 0]);

        areaChart.x_axis = d3.svg.axis()
            .scale(areaChart.x_scale)
            .orient("bottom");

        areaChart.zoom = d3.behavior.zoom()
            .x(areaChart.x_scale)
           // .scaleExtent(SCALE_EXTENT)
            .on("zoom", zoomed);

        areaChart.svg = d3.select("#area_line")
            .append("svg")
            .style("position", "absolute")
            .style("left", areaChart.tools_width + "px")
            .attr("width", areaChart.width)
            .attr("height", areaChart.height)
            .style("position", "absolute")
            .call(areaChart.zoom);

        areaChart.line = d3.svg.line()//d3中绘制曲线的函数
            .x(function(d, i){
                return areaChart.x_scale(new Date(d.key));
            })//曲线中x的值
            .y(function(d){
                return areaChart.y_scale(d.values);
            })//曲线中y的值
            .interpolate("basis")//把曲线设置光滑

        areaChart.area = d3.svg.area()
            .interpolate("basis")
            .x(function (d) {
                return areaChart.x_scale(new Date(d.key));
            })
            .y0(function () {
                return -areaChart.y_scale(areaChart.padding_height);
            })
            .y1(function (d) {
                return areaChart.y_scale(d.values);
            });

        areaChart.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + areaChart.padding.left + "," + (areaChart.height - areaChart.padding.bottom) + ")")
            .call(areaChart.x_axis);

        areaChart.area_g = areaChart.svg.append("g")
            .attr("transform", "translate(" + areaChart.padding.left + "," + areaChart.padding.top + ")");

        areaChart.area_g.append("clipPath")
            .attr("id", "clip_path")
            .append("rect")
            .attr({
                x: 0,
                y: 0,
                width: areaChart.padding_width,
                height: areaChart.padding_height
            });

        areaChart.area_g.append("path")
            .datum(init_data_line)
            .attr('fill', "none")
            .attr('opacity', AREA_OPACITY)
            .attr('stroke', AREA_STROKE)
            .attr("d", areaChart.line)
            .attr("clip-path", "url(#clip_path)");
    }

    function zoomed() {
        areaChart.svg.select(".x.axis").call(areaChart.x_axis);
        areaChart.area_g.select("path").attr("d", areaChart.area);
    }
}

var AREA_COLOR = '#C4C9CF';
var AREA_STROKE = "#FFFAFA";
var AREA_OPACITY = 0.9;