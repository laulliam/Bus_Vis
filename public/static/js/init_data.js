/**
 * Created by Liang Liu on 2018/1/20.
 */

    function Init_data() {

        $.ajax({
            url: "/station_info",    //请求的url地址
            data:{
            },
            dataType: "json",   //返回格式为json
            async: true, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
            success: function (station_data, textStatus) {

                $.ajax({
                    url: "/section_info",    //请求的url地址
                    data:{
                    },
                    dataType: "json",   //返回格式为json
                    async: true, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (section_data, textStatus) {
                        DrawStation(station_data);
                        DrawSection(section_data);
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });

            },
            complete: function () {//请求完成的处理
            },
            error: function () {//请求出错处理
            }
        });
    }

    $(window).resize(function () {
        window.location.reload();
    });

    Init_data();
