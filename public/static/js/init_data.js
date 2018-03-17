/**
 * Created by Liang Liu on 2018/1/20.
 */

    var section_info;

    function Init_data() {

        $.ajax({
            url: "/station_info",    //请求的url地址
            dataType: "json",   //返回格式为json
            async: true, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
            success: function (station, textStatus) {
                DrawStation(station);
            },
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
        });

       /* $.ajax({
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
                section_info = section_data;
            },
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
        });*/
    }

    Init_data();

    $(window).resize(function () {
        window.location.reload();
    });

    function currentTime() {
        var date = (new Date()).toLocaleString();
        $("#header").find(".time").text(date);
    }

    window.setInterval(currentTime, 1000);
