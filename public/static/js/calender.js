
function Draw_calender(datas) {

    var margin = { top: 0, right: 0, bottom:0, left: 0 },
        border =1,
        body_width =  $("#all_view").width(),
        body_height =  $("#all_view").height()-20,
        width=(body_width * 0.15 -  border),
        height=(body_height * 0.6  -  border),
        gridSize = height/28,
        legendElementWidth = gridSize,
        buckets = 9,
        colors = ["#40ff18","#9ff86e","#9ff86e","#cccd44","#cd6628","#ff6326","#ff4f0d"], // alternatively colorbrewer.YlGnBu[9]
        days = ["Mo","Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = [ "...", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        dailyValueExtent = {};

    var shuju1=[]
    var shuju2=[]
    var daycanshu=[
        new Date(datas[0].start_date_time).getDate(),
        new Date(datas[0].start_date_time).getDate()+1,
        new Date(datas[0].start_date_time).getDate()+2,
        new Date(datas[0].start_date_time).getDate()+3,
        new Date(datas[0].start_date_time).getDate()+4,
        new Date(datas[0].start_date_time).getDate()+5,
        new Date(datas[0].start_date_time).getDate()+6,
    ]

    datas.forEach(function (d) {
        if(d.speed >= 60){
            d.speed = null;
        }
        d.day = new Date(d.start_date_time).getDate();
        d.hour = new Date(d.start_date_time).getHours();
    });


    for(var j = 0;j<7;j++) {
        shuju1[j] = new Array()
        var k = 0;
        for (var i = 0; i < datas.length; i++) {
            // console.log(new Date(datas[i].start_date_time).getDate())
            if (daycanshu[j] === new Date(datas[i].start_date_time).getDate()) {

                datas[i].end_date_time=j+1;

            }
        }
    }



    heatmapChart(datas,width,height);

    function heatmapChart(data,widths,heights) {

        var svg = d3.select("#calender")
            .append("svg")
            .attr("width",widths + margin.left + margin.right)
            .attr("height",  heights + margin.top + margin.bottom);

        var calender_g = svg.append("g").attr("transform", "translate("+25+",+20)");

        var dayLabels = calender_g.selectAll(".dayLabel")
            .data(days)
            .enter()
            .append("text")
            .text(function (d) { return d; })
            .attr("x", function (d, i) { return i * gridSize + 15; })
            .attr("y",60)
            .style({
                "font-size":"9pt",
                "font-family": "Consolas, courier",
                "fill": "#aaa",
                "text-anchor":"end"
            });

        var timeLabels = calender_g.selectAll(".timeLabel")
            .data(times)
            .enter()
            .append("text")
            .text(function(d) { return d; })
            .attr("x", -10)
            .attr("y", function(d, i) { return i * gridSize + 73; })
            .style({
                "font-size":"9pt",
                "font-family": "Consolas, courier",
                "fill": "#aaa",
                "text-anchor":"middle"
            });

        var colorScale = d3.scale.quantile()
            .domain([0,d3.max(data, function (d) { return d.speed; })])
            .range(colors);

        var cards = calender_g.selectAll(".hour")
            .data(data, function(d) {return d.day+':'+d.hour;})
            .enter()
            .append("rect")
            .attr("x", function(d,i) {return (d.end_date_time  -2) * gridSize; })
            .attr("y",  function(d) { return (d.hour-3) * gridSize; })
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill","#646765")
            .attr("transform","translate("+25+",+20)")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                if(d.speed>=0&&d.speed<10){return colors[5]}
                else if(d.speed>=10&&d.speed<20){return colors[4]}
                else if(d.speed>=20&&d.speed<30){return colors[3]}
                else if(d.speed>=30&&d.speed<40){return colors[2]}
                else if(d.speed>=40&&d.speed<50){return colors[1]}
                else if(d.speed>=50&&d.speed<60){return colors[0];}
                else if(d.speed == null){return "#646765";}
            });

        var legArray=[0,1,2,3,4,5,6];

        var legend = calender_g.selectAll(".legend")
            .data(legArray)
            .enter()
            .append("g")
            .attr("class", "legend");

        legend.append("rect")
            .attr("x",function(d, i) { return legendElementWidth * i; })
            .attr("y",  height * 0.9)
            .attr("width",  legendElementWidth )
            .attr("height",gridSize/2)
            .style("fill", function(d, i) { return colors[i]; });
        legend.append("title").text(function(d) { return d+"≤X≤"+(d+10); });





        legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return   Math.round(d); })
            .attr("x", function(d, i) {
                if(i==0){return legendElementWidth * (i)-5;}
                else if(i==6){return legendElementWidth * (i)+10;}
                else{ return -10000} })
            .attr("y", height-30);


        legend.exit().remove();

    }

}

