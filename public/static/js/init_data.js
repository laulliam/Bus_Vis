/**
 * Created by Liang Liu on 2018/1/20.
 */
var section_info;
var station_info;
function Init_data() {

    get_station_data();
    get_section_data();

    function get_station_data(){
        $.ajax({
            url: "/station_info",
            dataType: "json",
            async: false,
            type: "GET",
            contentType: "application/json",
            beforeSend: function () {            },
            success: function (station, textStatus) {
                station_info = station;
            },
            complete: function () {            },
            error: function () {            }
        });
    }
    function get_section_data(){
        $.ajax({
            url: "/section_info",
            dataType: "json",
            async: false,
            type: "GET",
            contentType: "application/json",
            beforeSend: function () {            },
            success: function (section_data, textStatus) {

                section_data.forEach(function (d) {
                    d.path = eval(d.path);
                    d.path.forEach(function (s) {
                        var tem = s[0];
                        s[0] = s[1];
                        s[1] = tem;
                    });
                });
                section_data.sort(function (a,b) {
                    return a.section_id - b.section_id;
                });
                section_info = section_data;
            },
            complete: function () {            },
            error: function () {            }
        });
    }
}
Init_data();

$(window).resize(function () {
    window.location.reload();
});

function currentTime() {
    var format_date = d3.time.format("%Y-%m-%d %H:%M:%S");
    var date = format_date(new Date());
    $("#header").find(".time").text(date);
}
window.setInterval(currentTime, 1000);

var COLOR = ["#EDC951","#CC333F","#00A0B0","#ff5a29","#2f71b0","#55ff30","#570eb0","#883378"];

var color_scale = ["#FF5252","#FB8C00","#FFBF3A","#F1E229","#9CD523","#23D561"];

var threshold=d3.scale.threshold()    .domain([10,20,30,40,50])
    .range(color_scale);

