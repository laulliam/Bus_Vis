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
            url: "/station_info",    //请求的url地址
            dataType: "json",   //返回格式为json
            async: false, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
            success: function (station, textStatus) {
                station_info = station;
                console.log(station_info);
            },
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
        });
    }
    function get_section_data(){
        $.ajax({
            url: "/section_info",    //请求的url地址
            dataType: "json",   //返回格式为json
            async: false,//true, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
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
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
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

var threshold=d3.scale.threshold()//阈值比例尺
    .domain([10,20,30,40,50])
    .range(color_scale);

