function Layout() {
    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height()-20;

    var header = document.getElementById("header");
    var control= document.getElementById("control");
    var calender = document.getElementById("calender");
    var main = document.getElementById("main");
    var information = document.getElementById("information");
    var importance = document.getElementById("importance");
    var test1 =document.getElementById("test1");
    var time_line = document.getElementById("time_line");
    var radar =document.getElementById("radar");

    header.style.width=(body_width - 2 * border) + "px";
    header.style.height = 20 + "px";

    control.style.width=(body_width * 0.15 - border) + "px";
    control.style.height = (body_height * 0.25 -  border) + "px";

    calender.style.width=(body_width * 0.15 -  border) + "px";
    calender.style.height=(body_height * 0.45 -  border) + "px";

    main.style.width = (body_width * 0.7 -  2 * border) + "px";
    main.style.height = (body_height * 0.7 -  border) + "px";

    information.style.width = (body_width * 0.15 - border) + "px";
    information.style.height = (body_height * 0.35 -  2 * border) + "px";

    importance.style.width=(body_width * 0.15 - border) + "px";
    importance.style.height=(body_height * 0.35 -  2 * border) + "px";

    test1.style.width = (body_width * 0.15 - border) + "px";
    test1.style.height = (body_height * 0.3 - 3* border) + "px";

    time_line.style.width = (body_width * 0.7 - 2 * border)+ "px";
    time_line.style.height = (body_height * 0.3 - 3 * border) + "px";

    radar.style.width = (body_width * 0.15 -  border) + "px";
    radar.style.height = (body_height * 0.3 - 3 * border) + "px";

    $(window).resize(function () {
        window.location.reload();
    })
}
window.onload= Layout;

