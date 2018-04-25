/**
 * Created by Liang Liu on 2018/1/20.
 */
/*var southWest = L.latLng(31.32255387, 104.57336425),
    northEast = L.latLng(31.59725256, 104.91016387),
    my_bounds = L.latLngBounds(southWest, northEast);

var osmUrl = 'http://localhost:8888/tiles/{z}/{x}/{y}.png',
    osm_Attr = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        //maxBounds:my_bounds,
        minZoom: 12,
        maxZoom: 18,
        attribution: osm_Attr
    });

var map = L.map('main')
    .setView([31.46,104.7416], 12)
    .addLayer(osm);

map.setMaxBounds(my_bounds);

console.log(map.getBounds());
console.log(map.getCenter());*/

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

d3.select("#main").style({"z-index":80});

var data_section;

Init_tools();

//DrawSection(section_info);

//Section_render(new Date(2016,0,1,7,0,0),new Date(2016,0,1,8,0,0));

function Init_tools() {

    DrawStation(station_info);

    var mainChart_tool = d3.select("#main")
        .append("div")
        .attr("class", "btn-group btn-group-sm")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "10%"
        })
        .selectAll("btn btn-default")
        .data(["play", "user", "refresh"])
        .enter()
        .append("button")
        .attr({
            "type": "button",
            "class": "btn btn-default"
        })
        .attr("title", function (d) {
            switch (d) {
                case "play":
                    return "zz";
                case "user":
                    return "xx";
                case "refresh":
                    return "cc";
            }
        });

    mainChart_tool.append("span")
        .attr("class", function (d) {
            return "glyphicon glyphicon-"+ d;
        })
        .attr("aria-hidden",true);

    mainChart_tool.on("click", function (d) {
        switch (d) {
            case "zz":
                break;
            case "resize-full":
                break;
            case "refresh":
                break;
        }
    });

    var mainChart_search = d3.select("#main")
        .append("div")
        .attr("id","main_search")
        .attr("height",20)
        .attr("class","input-group input-group-sm")
        .style({
            "position": "relative",
            "float":"right",
            "z-index": "999",
            "top": "1.5%",
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
            "top": "5.5%",
            "right":"-9%",
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
            "left":"-13%",
            "min-width": $("#input_search").width()
        });
}

$(document).ready(function(){

    $("#input_search").keyup(function(){

        var val = $("#input_search").val(); // #获取搜索框输入的值

        input_search(val,d3.select(".dropdown-menu"));

        $('#input_search').keydown(function(){
            d3.select('.dropdown-menu').selectAll("li").remove();
        });
        $('#input_search').blur(function(){
            //d3.select('.dropdown-menu').selectAll("li").remove();
        })
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

            route.forEach(function (d) {


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
                        $("#input_search").val(d.sub_route_id);

                        map = new mapboxgl.Map({
                            container: 'main',
                            style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',
                            zoom: 12,
                            center: [104.78, 31.437]
                            //maxBounds: bounds // Sets bounds as max
                        });

                        Draw_route(d.sub_route_id);
                    });

            });

        },
        complete: function () {//请求完成的处理

        },
        error: function () {//请求出错处理
        }
    });
}

function Draw_route(route_id) {

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
                        });

                        section.forEach(function (d) {
                            route_path.push(d.path);
                        });
                    },
                    complete: function () {//请求完成的处理
                    },
                    error: function () {//请求出错处理
                    }
                });
            });

            draw_section(route_path,route_id);

        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

}

function draw_section(route_data,route_id) {

    console.log(route_data);

    route_data.forEach(function (d,i) {

        var features_line = [];

        features_line.push({
            'type': 'Feature',
            'properties':{
                'color':"#c8c6c4",
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': d
            }
        });

        var data_section = {
            "type": "FeatureCollection",
            "features": features_line
        };

        map.on("load", function () {

            map.addSource("route_source_"+route_id+i, {
                'type': 'geojson',
                'data': data_section
            });

            map.addLayer({
                'id': 'route_'+route_id+i,
                'type': 'line',
                'source': 'route_source_'+route_id+i,
                'paint': {
                    'line-width': 2,
                    'line-color': ['get', 'color']
                }
            });
        });
    });
}

function DrawStation(station_info) {

    var features_point = [];
    station_info.forEach(function (d) {
        features_point.push({
            "type": "Feature",
            "properties": {
                "station_id": d.station_id,
                "description": d.station_name + d.station_id,
                "color": "#8fa9ff"
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
        "features": features_point
    };

    map.on('load', function () {

        //station point
        map.addSource("station_source", {
            "type": "geojson",
            'data': data_point
        });

        map.addLayer({
            "id": "station_point",
            "source": "station_source",
            "type": "circle",
            'layout': {
                'visibility': 'visible'
            },
            "paint": {
                "circle-radius": 3,
                "circle-color": ['get', 'color']//station_color
            }
        });
    });

    map.on('click', 'station_point', function (e) {

        new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(map);

        update_radar(e.features[0].properties.station_id);

        function update_radar(station_id) {
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

                    var temp = [];

                    routes_id.forEach(function (route_id) {

                        var hours_data =[];
                        var hours_temp = [24];

                        for(var i =0;i<24;i++) hours_temp[i] =0;

                        var route_data = route_query(station_id,route_id,new Date(2016,0,1,7,0,0),new Date(2016,0,2,7,0,0));

                        route_data.forEach(function (d) {

                            if(d.start_date_time.getMinutes()>=30)
                            {
                                d.start_date_time.setHours(d.start_date_time.getHours()+1);
                                d.start_date_time.setMinutes(0,0);
                            }
                            else
                                d.start_date_time.setMinutes(0,0);

                            hours_temp[d.start_date_time.getHours()]+=d.stay_time;

                        });

                        for(var i =0;i<24;i++)
                        {
                            if(i<10)
                                hours_data.push({axis:"0"+i,value:hours_temp[i]});
                            else
                                hours_data.push({axis:""+i,value:hours_temp[i]});
                        }

                        temp.push(hours_data);
                    });

                    console.log(temp);

                    routes_radar(temp);

                },
                complete: function () {//请求完成的处理
                },
                error: function () {//请求出错处理
                }
            });


        }

        function route_query(station_id,route_id,start_time,end_time) {

            var route_data;

            $.ajax({
                url: "/sub_route_data",    //请求的url地址
                data:{
                    sub_route_id:route_id,
                    station_id:station_id,
                    start_time:start_time,
                    end_time:end_time
                },
                dataType: "json",   //返回格式为json
                async: false, //请求是否异步，默认为异步，这也是ajax重要特性
                type: "GET",   //请求方式
                contentType: "application/json",
                beforeSend: function () {//请求前的处理
                },
                success: function (sub_route_data, textStatus) {

                    sub_route_data.forEach(function (d) {
                        d.start_date_time=new Date(d.start_date_time);
                        d.end_date_time = new Date(d.end_date_time);
                    });

                    route_data = sub_route_data;
                },
                complete: function () {//请求完成的处理
                },
                error: function () {//请求出错处理
                }
            });

            return route_data;
        }

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'station_point', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'station_point', function () {
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
                'color':"#c8c6c4",
                'section_id': d.section_id
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

        updata_stream(e.features[0].properties.section_id);

        function updata_stream(section_id) {

            console.log(section_id);

            $.ajax({
                url: "/section_id_data",    //请求的url地址
                data:{
                    section_id:section_id.toLocaleString()
                    //date_extent:date_extent
                },
                dataType: "json",   //返回格式为json
                async: true, //请求是否异步，默认为异步，这也是ajax重要特性
                type: "GET",   //请求方式
                contentType: "application/json",
                beforeSend: function () {//请求前的处理
                },
                success: function (section_data, textStatus) {

                    section_data.forEach(function (d) {
                        d.start_date_time = new Date(d.start_date_time);
                        d.start_date_time.setSeconds(0,0);
                        d.stay_time = +d.stay_time;
                    });

                    d3.select("#time_svg").remove("*");
                    //chart(section_data);
                },
                complete: function () {//请求完成的处理
                },
                error: function () {//请求出错处理
                }
            });
        }
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
            "section_id":section_id.toLocaleString(),
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
