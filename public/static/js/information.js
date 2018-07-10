/*
 * Created by Liang Liu on 2018/5/16.
 */
function Information(station_id,station_name) {

    $("#current_station")[0].innerHTML=station_name;

    $.ajax({
     url: "/sub_routes_numbers",    //请求的url地址
     data:{
     station_id:station_id
     },
     dataType: "json",   //返回格式为json
     async: true, //请求是否异步，默认为异步，这也是ajax重要特性
     type: "GET",   //请求方式
     contentType: "application/json",
     beforeSend: function () {//请求前的处理
     },
     success: function (routes_numbers, textStatus) {
     var routes_id = routes_numbers[0].sub_routes_id.split(",");
         $("#routes_number")[0].innerHTML = routes_id.length;
         //Slide_word(routes_id);
         routes_label(routes_id);
     },
     complete: function () {//请求完成的处理
     },
     error: function () {//请求出错处理
     }
     });

    function routes_label(data){

        if(d3.select("#routes_div"))
        d3.select("#routes_div").remove();
        var rotes_div = d3.select("#information").append("div")
            .attr("id","routes_div")
            .attr("class","message_scroll")
            .style({
                "position":"relative",
                "float":"left",
                "z-index": "999",
                "left": "0%",
                "top":"15%",
                "width":"100%",
                "overflow-x":"scroll",
                "overflow-y":"hidden"
            })
            .selectAll("label label-default route_label")
            .data(data)
            .enter()
            .append("span")
            .attr("class","label label-default route_label")
            .on("mouseover",function (d) {

            })
            .on("mouseout",function (d) {

            })
            .style({
                "background-color":function (d,i) {
                    if(i%4 == 0)
                    $("#route_label").after("<br>");
                    return COLOR[i];
                },
                "margin":"7px"
            })
            .html(function (d) {
                return d;
            });

    }

    function Slide_word(data) {

        var border = 1;
        var all_view = $("#all_view");
        var body_width = all_view.width();
        var body_height = all_view.height()-15;

        var cloud = $("#information");

        var width = (body_width * 0.15 - border);
        var height = (body_height * 0.4 );

        if(d3.select("#slide_div"))
            d3.select("#slide_div").remove('*');

        var slide_div =  d3.select("#information").append("div")
            .attr("id","slide_div")
            .attr("width",width)
            .attr("height",height/4);

        var ul = slide_div.append("ul");

        ul.selectAll(".message_scroll")
            .data(data)
            .enter()
            .append("li")
            .append("a")
            .attr()
            .text(function (d) {
                return d;
            });

        var element = $('#slide_div a');
        var offset = 0;
        var stepping = 0.01;
        var list = $('#slide_div');
        var $list = $(list);

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
                var angle = element[i].elemAngle + offset,
                    x = 120 + Math.sin(angle) * 30,
                    y = 45 + Math.cos(angle) * 40,
                    size = Math.round(7 - Math.sin(angle) * 10);
                var elementCenter = $(element[i]).width() / 2;
                var leftValue = (($list.width()/2) * x / 100 - elementCenter) + "px";
                $(element[i]).css("fontSize", size + "px");
                $(element[i]).css("opacity",size/10);
                $(element[i]).css("zIndex" ,size);
                $(element[i]).css("left" ,leftValue);
                $(element[i]).css("top", y + "%");
            }
            offset += stepping;
        }

    }
}

function section_message(section_id){
    d3.select("#current_section").html(section_info[section_id-1].from_name+">>>>>"+section_info[section_id-1].target_name);
}
