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