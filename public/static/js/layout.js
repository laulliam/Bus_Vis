function Layout() {
    var border = 1;
    var all_view = $("#all_view");
    var body_width = all_view.width();
    var body_height = all_view.height();

    var control= document.getElementById("control");
    var main = document.getElementById("main");
    var information = document.getElementById("information");
    var time_line = document.getElementById("time_line");
    var area_line = document.getElementById("area_line");



    control.style.width=(body_width * 0.15 - border) + "px";
    control.style.height = (body_height * 0.7 - border) + "px";

    main.style.width = (body_width * 0.7 - 2 * border) + "px";
    main.style.height = (body_height * 0.7 - border) + "px";

    information.style.width = (body_width * 0.15 - border) + "px";
    information.style.height = (body_height * 0.7 - border) + "px";

    time_line.style.width = body_width + "px";
    time_line.style.height = (body_height * 0.2 - border) + "px";

    area_line.style.width = body_width + "px";
    area_line.style.height = (body_height * 0.1) + "px";

    $(window).resize(function () {
        window.location.reload();
    })
}
window.onload= Layout;

