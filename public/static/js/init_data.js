/**
 * Created by Liang Liu on 2018/1/20.
 */
$.ajax({
    url: "/section_run_data",    //请求的url地址
    data:{
    },
    dataType: "json",   //返回格式为json
    async: true, //请求是否异步，默认为异步，这也是ajax重要特性
    type: "GET",   //请求方式
    beforeSend: function () {//请求前的处理
    },
    success: function (section_run_data, textStatus) {
        //console.log(section_run_data);
    },
    complete: function () {//请求完成的处理
    },
    error: function () {//请求出错处理
    }
});