function Layout() {
    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var header = document.getElementById("header");
    var control= document.getElementById("control");
    var calender = document.getElementById("calender");
    var area_line = document.getElementById("area_line");
    var main = document.getElementById("main");
    var information = document.getElementById("information");
    var message_cloud=document.getElementById("message_cloud");
    var time_line = document.getElementById("time_line");
    var radar =document.getElementById("radar");

    header.style.width=(body_width - 2 * border) + "px";
    header.style.height = 20 + "px";

    control.style.width=(body_width * 0.15 - border) + "px";
    control.style.height = 200 + "px";

    calender.style.width=(body_width * 0.15 -  border) + "px";
    calender.style.height=((body_height - 200)*0.8  -  border) + "px";

    area_line.style.width=(body_width * 0.15 -  border) + "px";
    area_line.style.height=((body_height - 200)*0.2) + "px";

    main.style.width = (body_width * 0.7+2*border) + "px";
    main.style.height = (body_height * 0.75 -  border) + "px";

    information.style.width = (body_width * 0.15 - border) + "px";
    information.style.height = (body_height * 0.3 - border) + "px";

    message_cloud.style.width = (body_width * 0.15 - border) + "px";
    message_cloud.style.height = (body_height * 0.45 ) + "px";

    time_line.style.width = (body_width * 0.7)+ "px";
    time_line.style.height = (body_height * 0.25) + "px";

    radar.style.width = (body_width * 0.15- border ) + "px";
    radar.style.height = (body_height * 0.25 ) + "px";

    $(window).resize(function () {
        window.location.reload();
    })
}
window.onload= function (ev) {
    Layout();
}

