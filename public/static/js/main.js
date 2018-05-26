/* Created by Liang Liu on 2018/1/20.*/
var bounds = [
    [104.57336425, 31.32255387], // Southwest coordinates
    [104.91016387, 31.59725256]  // Northeast coordinates
];

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';

var map =new mapboxgl.Map({
    container: 'main',
    style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',
    zoom: 12,
    center: [104.78, 31.437]
    //maxBounds: bounds // Sets bounds as max
});

//var mainChart = {};

var data_section;
var data_point;

var click_pop;

Init_tools();

Draw_route_Init();

//heat_Map(station_info);

//Animation_route();

//DrawSection(section_info);
//Section_render(new Date(2016,0,1,7,0,0),new Date(2016,0,1,8,0,0));

var search_value = $("#input_search");
var search_ul = $('.dropdown-menu');

function Init_tools() {

    //DrawSection(section_info);
    //DrawStation(station_info);

    var mainChart_tool = d3.select("#main")
        .append("div")
        .attr("class", "btn-group btn-group-sm")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "10%",
            "top":"2%"
        })
        .selectAll("btn btn-default")
        .data(["calendar", "book", "refresh"])
        .enter()
        .append("button")
        .attr({
            "type": "button",
            "class": "btn btn-default"
        })
        .attr("title", function (d) {
            switch (d) {
                case "calendar":
                    return "日期";
                case "book":
                    return "图层";
                case "refresh":
                    return "刷新";
            }
        });

    mainChart_tool.append("span")
        .attr("class", function (d) {
            return "glyphicon glyphicon-"+ d;
        })
        .attr("aria-hidden",true);

    mainChart_tool.on("click", function (d) {
        switch (d) {
            case "calendar":
                break;
            case "book":
                var stat = d3.select("#layerSet_div").style("display");
                var layerSet_div = d3.select("#layerSet_div");
                (stat == "none")?layerSet_div.style("display","block"):layerSet_div.style("display","none");

                break;
            case "refresh":
                search_value.val('');
                map.flyTo({
                    center: [104.78, 31.437],
                    zoom:12});
                map.setLayoutProperty('route_layer', 'visibility', 'none');
                map.setLayoutProperty('route_station', 'visibility', 'none');
                map.setPaintProperty('section', 'line-opacity',1);
                map.setLayoutProperty('station', 'visibility', 'visible');
                break;
        }
    });

    var mainChart_layerSet = d3.select("#main")
        .append("div")
        .attr("id","layerSet_div")
        .attr("class", "btn-group-vertical btn-group-xs")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "14%",
            "top":"8%",
            "display":"none"
        })
        .selectAll("btn btn-default")
        .data(["routes", "stations", "heatmap"])
        .enter()
        .append("button")
        .attr({
            "type": "button",
            "class": "btn btn-default"
        })
        .attr("title", function (d) {
            switch (d) {
                case "routes":
                    return "路线";
                case "stations":
                    return "站点";
                case "heatmap":
                    return "热力图";
            }
        });

    mainChart_layerSet.append("span")
        .attr("class", function (d) {
            return "glyphicon glyphicon-eye-open";
        })
        .attr("aria-hidden",true);

    mainChart_layerSet.on("click", function (d) {
        switch (d) {
            case "routes":
                Change_stat(d3.select(this));
                break;
            case "stations":
                Change_stat(d3.select(this));
                break;
            case "heatmap":
                Change_stat(d3.select(this));
                break;
        }

        function Change_stat(current) {
            if(current.selectAll('span').attr("class")== "glyphicon glyphicon-eye-open")
                current.selectAll('span').attr("class","glyphicon glyphicon-eye-close");
            else
                current.selectAll('span').attr("class","glyphicon glyphicon-eye-open");
        }
    });


    var mainChart_search = d3.select("#main")
        .append("div")
        .attr("id","main_search")
        .attr("height",20)
        .attr("class","input-group input-group-sm")
        .style({
            "position": "absolute",
            "float":"right",
            "z-index": "999",
            "top": "2%",
            "right":"8%",
            "width":"15%"
        });

    mainChart_search.append("input")
        .attr("id","input_search")
        .attr("class","form-control input-sm")
        .attr("placeholder","请输入公交路线");

    mainChart_search.append("span")
        .attr("class","input-group-addon")
        .append("span")
        .attr("class", "glyphicon glyphicon-search");

    var suggest_div = d3.select("#main")
        .append("span")
        .attr("id","suggest_text")
        .attr("class","dropdown")
        .style({
            "position": "relative",
            "float":"right",
            "z-index": "999",
            "top": "6%",
            "right":"8%",
            "width":"15%"
        });

    var suggest_ul = suggest_div.append("ul")
        .attr("class","dropdown-menu")
        .attr("role","menu")
        .attr("aria-labelledby","dropdownMenu1")
        .style({
            "border":"0",
            "display":"block",
            "padding":"0 0",
            "min-width": $("#input_search").width()
        });
}

function Animation_route() {

    var route_path = [];
    var t = [];

    $.ajax({
        url: "/all_routes",    //请求的url地址
        data:{
            route_id:27001
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (routes, textStatus) {
            var section_arr = routes[0].path.split(',');
            section_arr.forEach(function (section_id) {
                $.ajax({
                    url: "/section_",    //请求的url地址
                    data:{
                        section_id: section_id
                    },
                    dataType: "json",   //返回格式为json
                    async: false, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (section, textStatus) {
                        section.forEach(function (d) {
                            d.path = eval(d.path);
                            d.path.forEach(function (s) {
                                var tem = s[0];
                                s[0] = s[1];
                                s[1] = tem;
                            });
                            route_path.push(d);
                        });
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });
            });
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    route_path.forEach(function (d,i) {

        map.on('load', function() {

            //console.log(d.from_name,d.target_name);
            var geojson ={
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            d.path[0]
                        ]
                    }
                }]
            };

            map.addLayer({
                'id': 'line-animation'+i,
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': geojson
                },
                'layout': {
                    'line-cap': 'round',
                    'line-join': 'round'
                },
                'paint': {
                    'line-color': '#ed6498',
                    'line-width': 5,
                    'line-opacity': .8
                }
            });
        });

        function animate_line(id,geojson,data) {

            var index = 0;
            var interval = setInterval(function(){

                if(index>=d.path.length-1){

                    clearInterval(interval);
                    return 1;
                }
                geojson.features[0].geometry.coordinates.push(data.path[index]);
                map.getSource('line-animation'+i).setData(geojson);
                index++;
            },1000);

        }
    });

    /*    for(var t=0;t<route_path.length;t++){

     map.on('load', function() {
     var geojson ={
     "type": "FeatureCollection",
     "features": [{
     "type": "Feature",
     "geometry": {
     "type": "LineString",
     "coordinates": [
     route_path[i].path[0]
     ]
     }
     }]
     };

     map.addLayer({
     'id': 'line-animation'+i,
     'type': 'line',
     'source': {
     'type': 'geojson',
     'data': geojson
     },
     'layout': {
     'line-cap': 'round',
     'line-join': 'round'
     },
     'paint': {
     'line-color': '#ed6498',
     'line-width': 5,
     'line-opacity': .8
     }
     });
     var index = 0;
     var interval = setInterval(function(){
     if(index>=d.path.length-1)clearInterval(interval);
     geojson.features[0].geometry.coordinates.push(route_path[i].path[index]);
     map.getSource('line-animation'+i).setData(geojson);
     index++;
     },1000);

     while(interval)
     {
     console.log(1);
     }
     });
     }*/

}

//Init_heat_Map(section_info);

function Init_heat_Map(section_heat) {
    var heat_point;
    var features_heat = [];
    section_heat.forEach(function (d) {
        features_heat.push({
            "type": "Feature",
            "properties": {
                "section_id": d.key,
                "color": "#ff5766",
                "mag":d.values
            },
            "geometry": {
                "type": "Point",
                "coordinates": d.coor
            }
        });
    });

    heat_point = {
        "type": "FeatureCollection",
        "features": features_heat
    };

    map.on('load', function() {
        // Add a geojson point source.
        // Heatmap layers also work with a vector tile source.
        map.addSource('earthquakes', {
            "type": "geojson",
            "data": heat_point
        });
        map.addLayer({
            "id": "earthquakes-heat",
            "type": "heatmap",
            "source": "earthquakes",
            "maxzoom": 14,
            "paint": {
                // Increase the heatmap weight based on frequency and property magnitude
                "heatmap-weight": [
                    "interpolate", ["linear"],
                    ["get", "mag"],
                    0, 0,
                    6, 1
                ],
                // Increase the heatmap color weight weight by zoom level
                // heatmap-intensity is a multiplier on top of heatmap-weight
                "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10, 60,
                    14, 3
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Begin color ramp at 0-stop with a 0-transparancy color
                // to create a blur-like effect.
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    60, "rgba(33,102,172,0)",
                    50, "rgb(50,32,200)",
                    40, "rgb(0,255,50)",
                    30, "rgb(150,250,0)",
                    20, "rgb(255,255,5)",
                    10, "rgb(255,32,5)"
                ],
                // Adjust the heatmap radius by zoom level
                "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0, 8,
                    14, 20
                ],
                // Transition from heatmap to circle layer by zoom level
                "heatmap-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    7, 1,
                    14, 0
                ]
            }
        }, 'waterway-label');
        map.addLayer({
            "id": "earthquakes-point",
            "type": "circle",
            "source": "earthquakes",
            "minzoom": 7,
            "paint": {
                // Size circle radius by earthquake magnitude and zoom level
                "circle-radius": [
                    "interpolate", ["linear"],
                    ["zoom"], 7,
                    ["interpolate", ["linear"],
                        ["get", "mag"],
                        1, 1,
                        6, 4
                    ],
                    16, [
                        "interpolate", ["linear"],
                        ["get", "mag"],
                        1, 5,
                        6, 60
                    ]
                ],
                // Color circle by earthquake magnitude
                "circle-color": [
                    "interpolate", ["linear"],
                    ["get", "mag"],
                    60, "rgba(33,102,172,0)",
                    50, "rgb(103,169,207)",
                    40, "rgb(209,229,240)",
                    30, "rgb(253,219,199)",
                    20, "rgb(239,138,98)",
                    10, "rgb(178,24,43)"
                ],
                // "circle-stroke-color": "white",
                // "circle-stroke-width": 1,
                // Transition from heatmap to circle layer by zoom level
                "circle-opacity": [
                    "interpolate", ["linear"],
                    ["zoom"], 7, 0,
                    8, 1
                ]
            }
        });
    });
}
Update_heat_map();
function Update_heat_map(){

    $.ajax({
        url: "/section_heat",    //请求的url地址
        data: {
        },
        dataType: "json",   //返回格式为json
        async: false,//true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_run_data, textStatus) {
            console.log(section_run_data);
            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_heat = nest.entries(section_run_data);
            section_heat.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });
                d.values = sum/d.values.length;
                d.coor = Ret_section_coor(d.key);
            });
            function Ret_section_coor(section_id){
                var coor = [];
                $.ajax({
                    url: "/section_center",    //请求的url地址
                    data: {
                        section_id:section_id
                    },
                    dataType: "json",   //返回格式为json
                    async: false,//true, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (section_coor, textStatus) {
                        if(section_coor.length>0){
                            section_coor[0].path = eval(section_coor[0].path);
                            section_coor[0].path.forEach(function (s) {
                                var tem = s[0];
                                s[0] = s[1];
                                s[1] = tem;
                            });
                            coor = section_coor[0].path[parseInt(section_coor[0].path.length/2)];
                        }
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });
                return coor;
            }
            //console.log(section_heat);
            Init_heat_Map(section_heat)
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

search_value.keyup(function(){

    var val = search_value.val(); // #获取搜索框输入的值

    input_search(val,d3.select(".dropdown-menu"));

    search_value.keydown(function(){
        d3.select('.dropdown-menu').selectAll("li").remove();
    });
    search_value.click(function(){
        search_value.val('');
        d3.select('.dropdown-menu').selectAll("li").transition().duration(300).remove();
    });
    search_ul.mouseleave(function(){
        d3.select('.dropdown-menu').selectAll("li").transition().duration(300).remove();
    });
});

function input_search(val,obj) {

    $.ajax({
        url: "/route_search",    //请求的url地址
        data:{
            sub_route_id: val
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (route, textStatus) {

            var i =0;
            route.forEach(function (d) {
                i++;
                if(i<8){
                    obj.append("li")
                        .attr("class","suggest_li")
                        .attr("role","presentation")
                        .attr("id","li_"+d.sub_route_id+"");

                    d3.select("#li_"+d.sub_route_id+"")
                        .append("a")
                        .attr("class","route_id_li")
                        .attr("role","menuitem")
                        .attr("tabindex","-1")
                        .attr("href","javascript:void(0)")
                        .text(d.sub_route_id)
                        .on("click",function () {
                            d3.select('.dropdown-menu').selectAll("li").remove();
                            $("#input_search").val(d.sub_route_id);
                            Draw_route(d.sub_route_id);
                            message_cloud(d.sub_route_id);
                        });
                }
            });

        },
        complete: function () {//请求完成的处理

        },
        error: function () {//请求出错处理
        }
    });
}

function Draw_route(route_id) {

    var new_route_path = [];

    $.ajax({
        url: "/all_routes",    //请求的url地址
        data:{
            route_id:route_id
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (routes, textStatus) {

            var section_arr = routes[0].path.split(',');

            section_arr.forEach(function (section_id) {

                $.ajax({
                    url: "/section_",    //请求的url地址
                    data:{
                        section_id: section_id
                    },
                    dataType: "json",   //返回格式为json
                    async: false, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (section, textStatus) {

                        section.forEach(function (d) {
                            d.path = eval(d.path);
                            d.path.forEach(function (s) {
                                var tem = s[0];
                                s[0] = s[1];
                                s[1] = tem;
                            });
                            new_route_path.push(d.path);
                        });

                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });
            });

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    $.ajax({
        url: "/route_station",    //请求的url地址
        data:{
            route_id:route_id
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (route_station, textStatus) {

            var station_point = [];

            route_station.forEach(function (d) {
                station_point.push({
                    "type": "Feature",
                    "properties": {
                        "station_id": d.station_id,
                        "description": d.station_name,
                        "color": "#188fff",
                        "opacity":0.8
                        // "icon": "music"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [d.longitude, d.latitude]
                    }
                });
            });

            var data_point = {
                "type": "FeatureCollection",
                "features": station_point
            };

            map.getSource('route_station_source').setData(data_point);

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    var features_line = [];

    new_route_path.forEach(function (d) {
        features_line.push({
            'type': 'Feature',
            'properties':{
                'color':"#fff8f9",
                'opacity':0.75
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': d
            }
        });
    });

    var section_source = {
        "type": "FeatureCollection",
        "features": features_line
    };

    map.getSource('route_source').setData(section_source);

    map.flyTo({
        center: new_route_path[parseInt(new_route_path.length/2)][0],
        zoom:11
    });

    map.setLayoutProperty('route_layer', 'visibility', 'visible');

    //map.setLayoutProperty('section', 'opacity', '0.3');

    map.setPaintProperty('section', 'line-opacity',0.1);

    map.setLayoutProperty('station', 'visibility', 'none');


}

function Draw_route_Init() {

    $.ajax({
        url: "/all_routes",    //请求的url地址
        data:{
            route_id:27001
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (routes, textStatus) {
            var section_arr = routes[0].path.split(',');
            var route_path = [];
            section_arr.forEach(function (section_id) {
                $.ajax({
                    url: "/section_",    //请求的url地址
                    data:{
                        section_id: section_id
                    },
                    dataType: "json",   //返回格式为json
                    async: false, //请求是否异步，默认为异步，这也是ajax重要特性
                    type: "GET",   //请求方式
                    contentType: "application/json",
                    beforeSend: function () {//请求前的处理
                    },
                    success: function (section, textStatus) {
                        section.forEach(function (d) {
                            d.path = eval(d.path);
                            d.path.forEach(function (s) {
                                var tem = s[0];
                                s[0] = s[1];
                                s[1] = tem;
                            });
                            route_path.push(d.path);
                        });
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });
            });
            var features_line = [];
            route_path.forEach(function (d) {
                features_line.push({
                    'type': 'Feature',
                    'properties':{
                        'color':"#c8c6c4",
                        'opacity':0
                    },
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': d
                    }
                });
            });
            var section_source = {
                "type": "FeatureCollection",
                "features": features_line
            };
            map.on("load", function () {
                map.addSource("route_source", {
                    'type': 'geojson',
                    'data': section_source
                });
                map.addLayer({
                    'id': 'route_layer',
                    'type': 'line',
                    'source': 'route_source',
                    'paint': {
                        'line-width': 3,
                        'line-color': ['get', 'color'],
                        'line-opacity':['get', 'opacity']
                    }
                });
            });

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    $.ajax({
        url: "/route_station",    //请求的url地址
        data:{
            route_id:27001
        },
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (route_station, textStatus) {
            var station_point = [];

            route_station.forEach(function (d) {
                station_point.push({
                    "type": "Feature",
                    "properties": {
                        "station_id": d.station_id,
                        "description": d.station_name,
                        "color": "#8fa9ff",
                        "opacity":0
                        // "icon": "music"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [d.longitude, d.latitude]
                    }
                });
            });

            var data_point = {
                "type": "FeatureCollection",
                "features": station_point
            };

            map.on('load', function () {

                //station point
                map.addSource("route_station_source", {
                    "type": "geojson",
                    'data': data_point
                });

                map.addLayer({
                    "id": "route_station",
                    "source": "route_station_source",
                    "type": "circle",
                    'layout': {
                        'visibility': 'visible'
                    },
                    "paint": {
                        "circle-radius": 4,
                        "circle-color": ['get', 'color'],//station_color
                        "circle-opacity":['get','opacity']
                    }
                });
            });

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}

function DrawStation(station_info) {

    var features_point = [];
    station_info.forEach(function (d) {
        features_point.push({
            "type": "Feature",
            "properties": {
                "station_id": d.station_id,
                "description": d.station_name,
                "color": "#8fa9ff"
                // "icon": "music"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [d.longitude, d.latitude]
            }
        });
    });

    data_point = {
        "type": "FeatureCollection",
        "features": features_point
    };

    map.on('load', function () {

        //station point
        map.addSource("station_source", {
            "type": "geojson",
            'data': data_point
        });

        map.addLayer({
            "id": "station",
            "source": "station_source",
            "type": "circle",
            'layout': {
                'visibility': 'visible'
            },
            "paint": {
                "circle-radius": 4,
                "circle-color": ['get', 'color']//station_color
            }
        });
    });

    map.on('click', 'station', function (e) {

        if(click_pop)
            click_pop.remove();

        click_pop = new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(map);

        //update_radar(e.features[0].properties.station_id);
        Information(e.features[0].properties.station_id);
        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'station', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'station', function () {
            map.getCanvas().style.cursor = '';
        });

        /*        map.addLayer({
         "id": "earthquakes-heat",
         "type": "heatmap",
         "source": {
         "type": "geojson",
         "data": {
         "type": "FeatureCollection",
         "features": features_point
         }
         },
         "maxzoom": 18,
         "paint": {
         // Increase the heatmap weight based on frequency and property magnitude
         "heatmap-weight": [
         "interpolate",
         ["linear"],
         ["get", "mag"],
         0, 0,
         6, 1
         ],
         // Increase the heatmap color weight weight by zoom level
         // heatmap-intensity is a multiplier on top of heatmap-weight
         "heatmap-intensity": [
         "interpolate",
         ["linear"],
         ["zoom"],
         0, 1,
         9, 3
         ],
         // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
         // Begin color ramp at 0-stop with a 0-transparancy color
         // to create a blur-like effect.
         "heatmap-color": [
         "interpolate",
         ["linear"],
         ["heatmap-density"],
         0, "rgba(33,102,172,0)",
         0.2, "rgb(103,169,207)",
         0.4, "rgb(209,229,240)",
         0.6, "rgb(253,219,199)",
         0.8, "rgb(239,138,98)",
         1, "rgb(178,24,43)"
         ],
         // Adjust the heatmap radius by zoom level
         "heatmap-radius": [
         "interpolate",
         ["linear"],
         ["zoom"],
         0, 2,
         9, 20
         ],
         // Transition from heatmap to circle layer by zoom level
         "heatmap-opacity": [
         "interpolate",
         ["linear"],
         ["zoom"],
         7, 1,
         9, 0
         ],
         }
         }, 'waterway-label');

         map.addLayer({
         "id": "earthquakes-point",
         "type": "circle",
         "source": {
         "type": "geojson",
         "data": {
         "type": "FeatureCollection",
         "features": features_point
         }
         },
         "minzoom": 7,
         "paint": {
         // Size circle radius by earthquake magnitude and zoom level
         "circle-radius": [
         "interpolate",
         ["linear"],
         ["zoom"],
         7, [
         "interpolate",
         ["linear"],
         ["get", "mag"],
         1, 1,
         6, 4
         ],
         16, [
         "interpolate",
         ["linear"],
         ["get", "mag"],
         1, 5,
         6, 50
         ]
         ],
         // Color circle by earthquake magnitude
         "circle-color": [
         "interpolate",
         ["linear"],
         ["get", "mag"],
         1, "rgba(33,102,172,0)",
         2, "rgb(103,169,207)",
         3, "rgb(209,229,240)",
         4, "rgb(253,219,199)",
         5, "rgb(239,138,98)",
         6, "rgb(178,24,43)"
         ],
         "circle-stroke-color": "white",
         "circle-stroke-width": 1,
         // Transition from heatmap to circle layer by zoom level
         "circle-opacity": [
         "interpolate",
         ["linear"],
         ["zoom"],
         7, 0,
         8, 1
         ]
         }
         }, 'waterway-label');*/
    });

}

function DrawSection(section_info) {

    var features_line = [];

    section_info.forEach(function (d) {

        features_line.push({
            'type': 'Feature',
            'properties':{
                'color': (Math.round(Math.random()*50)>2.5)?"#fff95d":"#80ff29",
                'section_id': d.section_id,
                "mag":d.speed
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': d.path
            }
        });

    });

    data_section = {
        "type": "FeatureCollection",
        "features": features_line
    };

    map.on("load", function () {

        map.addSource("section_source", {
            'type': 'geojson',
            'data': data_section
        });

        map.addLayer({
            'id': 'section',
            'type': 'line',
            'source': 'section_source',
            'paint': {
                'line-width': 2,
                'line-color': ['get', 'color']
            }
        });

    });

    map.on('click', 'section', function (e) {

        update_stream(e.features[0].properties.section_id);

    });

    map.on('mouseenter', 'section', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'section', function () {
        map.getCanvas().style.cursor = '';
    });
}

function Section_render(start_time,end_time) {

    data_section.features.forEach(function (d) {

        var section_speed = Section_speed(d.properties.section_id,start_time,end_time);

        if(section_speed) {
            if (section_speed < 20)
                d.properties.color = "#ff2513";
            else if (section_speed >= 20 && section_speed <= 35)
                d.properties.color = "#f2f73f";
            else
                d.properties.color = "#51ff20";
        }
    });

    map.on("load", function () {
        map.getSource('section_source').setData(data_section);
    });

}

function Section_speed(section_id,date_start,date_end) {

    var speed=0;

    $.ajax({
        url: "/section_run_data",    //请求的url地址
        data: {
            "section_id":section_id,
            "date_start": date_start,
            "date_end": date_end
        },
        dataType: "json",   //返回格式为json
        async: false,//true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_run_data, textStatus) {
            speed = parseFloat(section_run_data[0].speed);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
    return speed;
}
