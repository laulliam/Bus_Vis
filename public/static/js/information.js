/**
 * Created by Liang Liu on 2018/5/16.
 */
function Information(station_id) {
    console.log(station_id);
    $.ajax({
        url: "/sub_routes_numbers",    //请求的url地址
        data:{
            station_id:station_id
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (routes_numbers, textStatus) {
            var routes_id = routes_numbers[0].sub_routes_id.split(",");
            console.log(routes_id);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    $.ajax({
        url: "/Next_station",    //请求的url地址
        data:{
            station_id:station_id
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (station, textStatus) {
            console.log(station);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

Slide_word(1);
function Slide_word(data) {

    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-15;

    var cloud = $("#information");

    // var width = (body_width * 0.15 - border);
    // var height = (body_height * 0.45 );
    var width = cloud.width();
    var height = cloud.height();

    var test = ["38001","27001","4646","38001","27001","4646","38001","27001","4646"];

    var test_div =  d3.select("#information").append("div")
        .attr("id","test_div");

    var ul = test_div.append("ul");

    ul.selectAll(".message_scroll")
        .data(test)
        .enter()
        .append("li")
        .append("a")
        .text(function (d) {
            return d;
        });

    var element = $('#test_div a');
    var offset = 0;
    var stepping = 0.01;
    var list = $('#test_div');
    var $list = $(list)
    $list.mousemove(function(e){
        var topOfList = $list.eq(0).offset().top;
        var listHeight = $list.height();
        var flag = (e.clientY - topOfList) /  listHeight * 0.2 - 0.1;
        if(flag>0)
            stepping = -0.01;
        else
            stepping = 0.01;
    });

    for (var i = element.length - 1; i >= 0; i--){
        element[i].elemAngle = i * Math.PI * 2 / element.length;
    }

    setInterval(render, 40);

    function render(){
        for (var i = element.length - 1; i >= 0; i--){
            var angle = element[i].elemAngle + offset;
            x = 120 + Math.sin(angle) * 30;
            y = 45 + Math.cos(angle) * 40;
            size = Math.round(7 - Math.sin(angle) * 10);
            var elementCenter = $(element[i]).width() / 2;
            var leftValue = (($list.width()/2) * x / 100 - elementCenter) + "px"
            $(element[i]).css("fontSize", size + "px");
            $(element[i]).css("opacity",size/10);
            $(element[i]).css("zIndex" ,size);
            $(element[i]).css("left" ,leftValue);
            $(element[i]).css("top", y + "%");
        }
        offset += stepping;
    }

}