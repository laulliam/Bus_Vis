/* Created by Liang Liu on 2018/1/20.*/
var bounds = [
    [104.57336425, 31.32255387], // Southwest coordinates
    [104.91016387, 31.59725256]  // Northeast coordinates
];

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';

var map =new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',//'mapbox://styles/silentll/cjhynnwpq39yo2rt7nm41q58e', //
    zoom: 13,
    center: [104.7503025807656, 31.45559907197881],
    pitch:50
    //maxBounds: bounds // Sets bounds as max
});

var mainChart = {};
mainChart.date_extent = null;

Init_tools();

mainChart.Message_search = $("#input_search");
mainChart.search_ul = $('#suggest_text .dropdown-menu');
mainChart.layer_setting = $('#layer_setting .dropdown-toggle').dropdown();
mainChart.Message_search.keyup(function(){
    var val = mainChart.Message_search.val(); // #获取搜索框输入的值
    Message_search(val,d3.select("#suggest_text .dropdown-menu"));
    mainChart.Message_search.keydown(function(){
        d3.select('#suggest_text .dropdown-menu').selectAll("li").remove();
    });
    mainChart.Message_search.click(function(){
        mainChart.Message_search.select();
        d3.select('#suggest_text .dropdown-menu').selectAll("li").remove();
    });
    mainChart.search_ul.mouseleave(function(){
        d3.select('#suggest_text .dropdown-menu').selectAll("li").remove();
    });
});
$("#ECalendar").ECalendar({
    type:"time",
    stamp:false,
    skin:5,
    step:10,
    format:"yyyy-mm-dd hh:ii",
    date:new Date(2016,0,1,0,0),
    callback:function(v,e) {
        var temp_date = v.toString();
        var date_start = new Date(temp_date);
        var date_end = new Date(new Date(temp_date).setMinutes(new Date(temp_date).getMinutes()+30));

        mainChart.date_extent = [];

        mainChart.date_extent[0] = new Date(temp_date);
        mainChart.date_extent[1] = new Date(new Date(temp_date).setDate(new Date(temp_date).getDate()+1));

        var date_start1 = new Date(temp_date);
        var date_end1 = new Date(new Date(temp_date).setDate(new Date(temp_date).getDate()+1));

        Update_section([date_start,date_end]);
        //Update_heat_map([date_start,date_end]);
    }
});

var get_date = setInterval(function () {
    if(mainChart.date_extent) {
        console.log(mainChart.date_extent);
        clearInterval(get_date);
        return 1;
    }
});
/*var date=new Date(2016,0,1,17,0,0).getTime();
var test_interval =setInterval(function (){

        date_start = new Date(date);
        var date_end = new Date(new Date(date).setMinutes(new Date(date).getMinutes() + 30));
        Update_heat_map([date_start, date_end]);
        console.log([date_start, date_end]);
        date = date_end.getTime();
        if (date_start.getMonth() > 0)
            date = new Date(2016, 0, 1, 17, 0, 0).getTime();

},5000);*/

mainChart.map_view = {
    "default":false,
    "heatmap":false,
    "animation":false,
    "calendar":false
};

function Init_tools() {

    var mainChart_tool = d3.select("#map")
        .append("div")
        .attr("class", "btn-group btn-group-sm")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "15%",
            "top":"2%"
        })
        .selectAll("btn btn-default")
        .data(["ECalendar","refresh"])
        .enter()
        .append("button")
        .attr({
            "id":function (d) {
                return d;
            },
            "type": "button",
            "class": "btn btn-default"
        })
        .attr("title", function (d) {
            switch (d) {
                case "ECalendar":
                    return "日期";
                case "dLabel":
                    return "主视图布局";
                case "refresh":
                    return "刷新";
            }
        });

    mainChart_tool.append("span")
        .attr("class", function (d) {
            if(d == "ECalendar")
                return "glyphicon glyphicon-calendar";
            else
                return "glyphicon glyphicon-"+ d;
        })
        .attr("aria-hidden",true);

    mainChart_tool.on("click", function (d) {
        switch (d) {
            case "ECalendar":
                mainChart.map_view.calendar=!mainChart.map_view.calendar;
                if(mainChart.map_view.calendar)
                    d3.select(".calendarWrap").style({"display":"block"});
                else
                    d3.select(".calendarWrap").style({"display":"none"});
                break;
            case "book":
                break;
            case "refresh":
                Control_Chart();
                map.setFilter("station-hover", ["==", "station_id", ""]);
                map.setLayoutProperty('line_animation', 'visibility', 'none');
                map.setLayoutProperty('route_station', 'visibility', 'none');
                map.setPaintProperty('section', 'line-color', '#ffd435');
                map.setPaintProperty('section', 'line-width', 2);
                map.setPaintProperty('section', 'line-opacity', .5);
                map.setPaintProperty('station', 'circle-color', '#eae33f');
                map.setPaintProperty('station', 'circle-radius', 5);
                map.setPaintProperty('station', 'circle-opacity', .5);
                map.flyTo({
                    center: [104.7503025807656, 31.45559907197881],
                    zoom:12});
                if (mainChart.Msg_pop)
                    mainChart.Msg_pop.remove();
                break;
        }
    });

    var layer_setting = d3.select("#map")
        .append("div")
        .attr("id","layer_setting")
        .attr("class", "dropdown")
        .style({
            "position": "absolute",
            "float":"left",
            "z-index": "999",
            "left": "2%",
            "top":"2%"
        });

    var layerSetting_button = layer_setting.append("button")
        .attr("id","dLabel")
        .attr("type","button")
        .attr("class","btn btn-sm btn-default")
        .attr("data-toggle","dropdown")
        .text("主视图布局  ");

    var layer_available =["default","heatmap","animation"];

    layerSetting_button
        .append("span")
        .attr("class","caret");

    var layer_setting_ul = layer_setting.append("ul")
        .attr("class","dropdown-menu")
        .attr("role","menu")
        .attr("aria-labelledby","dLabel");

    layer_setting_ul.append("li")
        .attr("role","presentation")
        .attr("class","divider");

    var layer_setting_li = layer_setting_ul.selectAll(".layer_setting_li")
        .data(layer_available)
        .enter()
        .append("li")
        .attr("class","layer_setting_li")
        .on("click",function (d) {
            switch (d){
                case 'default':
                    mainChart.map_view.default = !mainChart.map_view.default;
                    if(!mainChart.map_view.default){
                        map.setLayoutProperty('section', 'visibility', 'visible');
                        map.setLayoutProperty('station', 'visibility', 'visible');
                        map.setLayoutProperty('section-hover', 'visibility', 'visible');
                        map.setLayoutProperty('station-hover', 'visibility', 'visible');
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-open");
                    }
                    else {
                        map.setLayoutProperty('section', 'visibility', 'none');
                        map.setLayoutProperty('station', 'visibility', 'none');
                        map.setLayoutProperty('section-hover', 'visibility', 'none');
                        map.setLayoutProperty('station-hover', 'visibility', 'none');
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-close");
                    }
                    break;
                case 'heatmap':
                    mainChart.map_view.heatmap = !mainChart.map_view.heatmap;
                    if(mainChart.map_view.heatmap){
                        map.setLayoutProperty('section_heat', 'visibility', 'visible');
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-open");
                    }
                    else{
                        map.setLayoutProperty('section_heat', 'visibility', 'none');
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-close");
                    }
                    break;
                case 'animation':
                    mainChart.map_view.animation = !mainChart.map_view.animation;
                    if(mainChart.map_view.animation){
                        Update_Animation();
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-open");
                    }
                    else{
                        mainChart.clear_animation_interval(1);
                        d3.select(this).select("span").attr("class","glyphicon glyphicon-eye-close");
                    }
                    break;
            }
        });

    layer_setting_li
        .append("a")
        .attr("role","menuitem")
        .attr("tabindex","-1")
        .attr("href","#")
        .text(function (d) {
            var type_flag;
            switch (d){
                case 'default':
                    type_flag = "默认视图";
                    break;
                case 'heatmap':
                    type_flag = "热力视图";
                    break;
                case 'animation':
                    type_flag = "动态视图";
                    break;
            }
            return type_flag;
        })
        .append("span")
        .attr("class",function (d) {
            if(d == 'default')
                return  "glyphicon glyphicon-eye-close";
            else
                return  "glyphicon glyphicon-eye-open";
        })
        .style({
            "float":"left",
            "left":"-3%"
        });

    var mainChart_search = d3.select("#map")
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
        .attr("placeholder","公交路线/站点");

    mainChart_search.append("span")
        .attr("class","input-group-addon")
        .append("span")
        .attr("class", "glyphicon glyphicon-search");

    var suggest_div = d3.select("#map")
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

//*************Init Station&&Section*****
DrawStation(station_info);
DrawSection(section_info);
function DrawStation(station_info) {
    mainChart.station_features = [];
    station_info.forEach(function (d) {
        mainChart.station_features.push({
            "type": "Feature",
            "properties": {
                "station_id": d.station_id,
                "description": d.station_name,
                "color": "#eae33f",
                "opacity":0.5,
                "radius":5
            },
            "geometry": {
                "type": "Point",
                "coordinates": [d.longitude, d.latitude]
            }
        });
    });
    mainChart.data_point = {
        "type": "FeatureCollection",
        "features": mainChart.station_features
    };
    map.on('load', function () {
        //station point
        map.addSource("station_source", {
            "type": "geojson",
            'data': mainChart.data_point
        });

        map.addLayer({
            "id": "station",
            "source": "station_source",
            "minzoom":7,
            "type": "circle",
            "paint": {
                "circle-radius": ['get','radius'],
                /* "circle-radius": [
                 "interpolate",
                 ["linear"],
                 ["zoom"],
                 7,1,
                 13,8
                 ],*/
                "circle-color":['get','color'],//station_color
                "circle-opacity":['get','opacity'],
                "circle-stroke-color": "#9c9c9c",
                "circle-stroke-width": 0.5,
                "circle-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    8, 0,
                    15, 1
                ]
            }
        }, 'waterway-label');

        map.addLayer({
            "id": "station-hover",
            "source": "station_source",
            //"minzoom":7,
            "type": "circle",
            "paint": {
                //"circle-radius": ['get','radius'],
                "circle-radius": 10,
                "circle-color":['get','color'],//station_color
                "circle-opacity":1,
                "circle-stroke-color": "#9c9c9c",
                "circle-stroke-width": 0.5
            },
            "filter": ["==", "station_id", ""]
        }, 'waterway-label');
    });
    map.on('click', 'station-hover', function (e) {

        if(mainChart.Msg_pop)
            mainChart.Msg_pop.remove();

        mainChart.Msg_pop = new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(map);

        update_radar(e.features[0].properties.station_id,mainChart.date_extent);
        //Information(e.features[0].properties.station_id,e.features[0].properties.description);

    });
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'station', function (e) {

        station_info.forEach(function (d) {
            if(d.station_id === e.features[0].properties.station_id)
                d3.select("#collapseOne_station").html("<p>&nbsp;&nbsp;&nbsp;公交站名:"+d.station_name+"</p>" + "<p>&nbsp;&nbsp;&nbsp;人流高峰:"+"08:00-08:30"+"</p>"
                );
        });


        mainChart.station_timeout = setTimeout(function () {
            map.setFilter("station-hover", ["==", "station_id", e.features[0].properties.station_id]);
            if(mainChart.Msg_pop)
                mainChart.Msg_pop.remove();
            mainChart.Msg_pop = new mapboxgl.Popup()
                .setLngLat(e.features[0].geometry.coordinates)
                .setHTML(e.features[0].properties.description)
                .addTo(map);
        },500);
        map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'station', function () {
        clearTimeout( mainChart.station_timeout );
        map.setFilter("station-hover", ["==", "station_id",""]);
        map.getCanvas().style.cursor = '';
    });
    /*    // add markers to map
     radarChart.data_point.features.forEach(function(marker) {
     // create a DOM element for the marker
     var el = document.createElement('div');
     el.className = 'marker';
     el.style.backgroundImage = "url('static/img/station.ico')";
     el.style.width = marker.properties.iconSize[0] + 'px';
     el.style.height = marker.properties.iconSize[1] + 'px';

     el.addEventListener('click', function() {
     window.alert(marker.properties.message);
     });

     // add marker to map
     new mapboxgl.Marker(el)
     .setLngLat(marker.geometry.coordinates)
     .addTo(map);
     });
     */
}
function DrawSection(section_info) {

    var features_line = [];
    section_info.forEach(function (d) {

        features_line.push({
            'type': 'Feature',
            'properties':{
                'color': "#ffd435",
                'section_id': d.section_id
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': d.path
            }
        });

    });
    mainChart.section_data = {
        "type": "FeatureCollection",
        "features": features_line
    };
    map.on("load", function () {

        map.addSource("section_source", {
            'type': 'geojson',
            'data': mainChart.section_data
        });

        map.addLayer({
            'id': 'section',
            'type': 'line',
            'source': 'section_source',
            'paint': {
                'line-width': 2,
                'line-color': ['get', 'color'],
                'line-opacity':0.2
            }
        }, 'waterway-label');

        map.addLayer({
            'id': 'section-hover',
            'type': 'line',
            'source': 'section_source',
            'paint': {
                'line-width': 4,
                'line-color': ['get', 'color'],
                'line-opacity':0.7
            },
            "filter": ["==", "section_id", ""]
        }, 'waterway-label');

    });

    map.on('click', 'section-hover', function (e) {

        if (mainChart.Msg_pop)
            mainChart.Msg_pop.remove();

        var section_id = e.features[0].properties.section_id;

        time_line(section_id);

        mainChart.Msg_pop= new mapboxgl.Popup()
            .setLngLat(section_info[section_id-1].path[parseInt(section_info[section_id-1].path.length/2)])
            .setHTML(section_info[section_id-1].from_name+">>>>>" +section_info[section_id-1].target_name)
            .addTo(map);
        map.getCanvas().style.cursor = 'pointer';

        //section_message(section_id);
        Calendar(section_id);
        console.log(section_id);
        //update_stream(section_id);
    });

    map.on('mouseenter', 'section', function (e) {
        var section_id = e.features[0].properties.section_id;
        //console.log(section_id);
        d3.select("#collapseOne_section").html(section_info[section_id-1].from_name+">>>>>" +section_info[section_id-1].target_name);
        map.setFilter("section-hover", ["==", "section_id",""]);
        mainChart.section_timeout = setTimeout(function () {
            map.setFilter("section-hover", ["==", "section_id", e.features[0].properties.section_id]);
            if(mainChart.Msg_pop)
                mainChart.Msg_pop.remove();
            mainChart.Msg_pop= new mapboxgl.Popup()
                .setLngLat(section_info[section_id-1].path[parseInt(section_info[section_id-1].path.length/2)])
                .setHTML(section_info[section_id-1].from_name+">>>>>" +section_info[section_id-1].target_name)
                .addTo(map);
        },500);
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'section', function () {
        clearTimeout( mainChart.section_timeout );
        //map.setFilter("section-hover", ["==", "section_id",""]);
        map.getCanvas().style.cursor = '';
    });
}
//************************

//*************single route animation
Init_Animation_route();
function Init_Animation_route() {

    var route_path = [];
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
                /*$.ajax({
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
                 });*/
                route_path.push(section_info[parseInt(section_id)-1]);
            });
            route_path.reverse();
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
    var geojson_line ={
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            'properties':{
                'opacity':0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    route_path[0].path[0]
                ]
            }
        }]
    };
/*    var geojson_point ={
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            'properties':{
                'opacity':0
            },
            "geometry": {
                "type": "Point",
                "coordinates": route_path[0].path[0]
            }
        }]
    };*/
    map.on('load', function() {

        /*map.addSource('point_animation', {
            "type": "geojson",
            "data": geojson_point
        });*/

        map.addSource('line_animation',{
            'type': 'geojson',
            'data': geojson_line
        });
        // add the line which will be modified in the animation
/*        map.addLayer({
            "id": "point_animation",
            "source": "point_animation",
            "type": "circle",
            "paint": {
                "circle-radius": 2.2,
                "circle-color": "#ff6f5c",
                "circle-opacity":['get','opacity']
            }
        });*/
        map.addLayer({
            'id': 'line_animation',
            'type': 'line',
            'source':'line_animation',
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fff95d',
                'line-width': 2,
                'line-opacity': .8
            }
        });

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
                        "opacity":0,
                        "radius":4
                        // "icon": "music"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [d.longitude, d.latitude]
                    }
                });
            });
            var route_station_data = {
                "type": "FeatureCollection",
                "features": station_point
            };
            map.on('load', function () {

                //station point
                map.addSource("route_station_source", {
                    "type": "geojson",
                    'data': route_station_data
                });

                map.addLayer({
                    "id": "route_station",
                    "source": "route_station_source",
                    "type": "circle",
                    'layout': {
                        'visibility': 'visible'
                    },
                    "paint": {
                        "circle-radius": ['get','radius'],
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
//******Update****
function Update_Animation_route(route_id) {

    map.setLayoutProperty('line_animation', 'visibility', 'visible');
    map.setLayoutProperty('route_station', 'visibility', 'visible');

    var route_path = [];

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
                route_path.push(section_info[parseInt(section_id)-1]);
            });
            route_path.reverse();
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
                        "color": "#ff9363",
                        "opacity":0.8,
                        "radius":4
                        // "icon": "music"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [d.longitude, d.latitude]
                    }
                });
            });
            var route_station_data = {
                "type": "FeatureCollection",
                "features": station_point
            };
            map.getSource('route_station_source').setData(route_station_data);

            /*            mainChart.station_interval = setInterval(function () {
             map.setPaintProperty('route_station', 'circle-radius',Math.ceil(Math.random()*5));
             },200);*/
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });

    var geojson_line ={
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            'properties':{
                'opacity':0
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    route_path[0].path[0]
                ]
            }
        }]
    };
    /*    var geojson_point ={
     "type": "FeatureCollection",
     "features": [{
     "type": "Feature",
     'properties':{
     'opacity':0
     },
     "geometry": {
     "type": "Point",
     "coordinates": route_path[0].path[0]
     }
     }]
     };*/

    /* map.getSource('point_animation').setData(geojson_point);*/
    map.getSource('line_animation').setData(geojson_line);

    animate_line();

    function animate_line() {
        var i = 0,j=0,flag=true;
        //clearInterval(mainChart.route_interval);
        mainChart.route_interval = setInterval(function(){
            if(i>route_path.length - 1){
                flag = false;
                i=0;
                clearInterval(mainChart.route_interval);
                return 1;
                //geojson_point.features[0].geometry.coordinates = route_path[0].path[0];
            }
            else{
                if(flag){
                    geojson_line.features[0].geometry.coordinates.push(route_path[i].path[j]);
                    map.getSource('line_animation').setData(geojson_line);
                    map.flyTo({
                        center: route_path[i].path[j],
                        zoom:13
                    });
                }
                //geojson_point.features[0].geometry.coordinates = route_path[i].path[j];
                //geojson_point.features[0].properties.opacity = 1;
                //map.getSource('point_animation').setData(geojson_point);
            }
            j++;
            if(j>route_path[i].path.length-1)
            {
                i++;
                j=0;
            }
        },30);
    }
}
//......********

//******Animation
Init_Animation();
function Init_Animation() {
    mainChart.Bus_lines = [];
    $.ajax({
        url: "/all_routes_animation",    //请求的url地址
        dataType: "json",   //返回格式为json
        async: false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (all_routes, textStatus) {
            //console.log(all_routes);
            all_routes.forEach(function (d,i) {
                mainChart.Bus_lines[i] =[];
                var section_arr = d.path.split(',');
                section_arr.reverse();
                section_arr.forEach(function (section_id) {
                    section_info[parseInt(section_id)-1].path.forEach(function (coor) {
                        mainChart.Bus_lines[i].push(coor);
                    });
                });
            });
            //console.log(mainChart.Bus_lines);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
    var features_route = [];
    var features_line = [];
    mainChart.route_length=[];

    var color =["#EDC951","#5abacc","#92ff4e","#dfff1a"];

    mainChart.Bus_lines.forEach(function (d,i) {
        mainChart.route_length.push(0);
        features_route.push({
            "type": "Feature",
            "properties": {
                "color": color[i%4]//
                // "icon": "music"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [d[0][0], d[0][1]]
            }
        });
        features_line.push({
            "type": "Feature",
            'properties':{
                'opacity':1,
                'color':color[i%4]
            },
            "geometry": {
                "type": "LineString",
                "coordinates":d
            }
        });
    });

    mainChart.route_point = {
        "type": "FeatureCollection",
        "features": features_route
    };

    map.on('load', function() {

        map.addSource("init_animation", {
            "type": "geojson",
            'data': mainChart.route_point
        });
        map.addLayer({
            "id": "init_animation",
            "source": "init_animation",
            "type": "circle",
            'layout': {
                'visibility': 'none'
            },
            "paint": {
                "circle-radius": 6,
                "circle-color":['get','color'],//station_color
                "circle-opacity":1
            }
        });

        map.addLayer({
            'id': 'init_routes',
            'type': 'line',
            'layout': {
                 'visibility': 'none'
            },
            'source':{
                "type":"geojson",
                "data":{
                    "type": "FeatureCollection",
                    "features": features_line
                }
            },
            'paint': {
                'line-color':['get','color'],
                'line-width': .8,
                'line-opacity': .1
            }
        },'init_animation');
    });
}
function Update_Animation() {

    map.setLayoutProperty('init_animation', 'visibility', 'visible');
    map.setLayoutProperty('init_routes', 'visibility', 'visible');

    mainChart.clear_animation_interval = function (IS_SOP) {
        if(IS_SOP){
            clearInterval(mainChart.animation_interval);
            map.setLayoutProperty('init_animation', 'visibility', 'none');
            map.setLayoutProperty('init_routes', 'visibility', 'none');
        }
    };

    mainChart.animation_interval= setInterval(function(){
        for(var i = 0;i<mainChart.Bus_lines.length;i++){
            mainChart.route_length[i]++;
            if(mainChart.route_length[i]==mainChart.Bus_lines[i].length)
                mainChart.route_length[i] = 0;
            mainChart.route_point.features[i].geometry.coordinates = mainChart.Bus_lines[i][mainChart.route_length[i]];
        }
        map.getSource('init_animation').setData(mainChart.route_point);
    },150);
}
//**********

//**********heatMap*********
Init_heat_Map();
function Init_heat_Map() {
    $.ajax({
        url: "/section_heat",    //请求的url地址
        data: {
            date_extent:[new Date(2016,0,1,7,0,0),new Date(2016,0,1,8,0,0)]
        },
        dataType: "json",   //返回格式为json
        async:false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_run_data, textStatus) {

            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_heat = nest.entries(section_run_data);

            for(var i=0;i<section_heat.length;i++){
                if(section_heat[i].key == "null") section_heat.splice(i,1);
            }
            section_heat.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });
                d.values = sum/d.values.length;
                d.coor = section_info[d.key-1].path[2];
            });
            Draw_heatmap(section_heat);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
    function Draw_heatmap(section_heat) {
        var heat_point;
        var features_heat = [];
        section_heat.forEach(function (d) {
            features_heat.push({
                "type": "Feature",
                "properties": {
                    "section_id": d.key,
                    //"mag":Math.random()*100
                    "mag": d.values
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

        map.on('load', function () {
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            map.addSource('heatmap_source', {
                "type": "geojson",
                "data": heat_point
            });
            map.addLayer({
                "id": "section_heat",
                "type": "heatmap",
                "layout":{
                    'visibility': 'none'
                },
                "source": "heatmap_source",
                "maxzoom": 14,
                "paint": {
                    // Increase the heatmap weight based on frequency and property magnitude
                    "heatmap-weight": [
                        "interpolate",
                        ["linear"],
                        ["get", "mag"],
                        0, 0,
                        30, 1
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    "heatmap-intensity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7, 0,
                        14, 1
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    "heatmap-color": [
                        "interpolate",
                        ["linear"],
                        ["heatmap-density"],
                        0, "rgba(33,102,172,0)",
                        0.2, "rgb(65,105,255)",
                        0.4, "rgb(0,250,154)",
                        0.6, "rgb(175,255,43)",
                        0.8, "rgb(255,255,10)",
                        1, "rgb(255,0,0)"
                    ],
                    // Adjust the heatmap radius by zoom level
                    "heatmap-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        7, 8,
                        14, 25
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    "heatmap-opacity": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        8, 0,
                        20, 1
                    ]
                }
            }, 'waterway-label');

            /*  map.addLayer({
             "id": "earthquakes-point",
             "type": "circle",
             "source": "earthquakes",
             "minzoom": 7,
             "paint": {
             // Size circle radius by earthquake magnitude and zoom level
             "circle-radius": [
             "interpolate",
             ["linear"],
             ["zoom"],
             7,
             ["interpolate",
             ["linear"],
             ["get", "mag"],
             7, 1,
             13, 3
             ],
             13, [
             "interpolate",
             ["linear"],
             ["get", "mag"],
             13, 3,
             18, 5
             ]
             ],
             // Color circle by earthquake magnitude
             "circle-color": [
             "interpolate",
             ["linear"],
             ["get", "mag"],
             7, "rgba(33,102,172,0)",
             8, "rgb(103,169,207)",
             9, "rgb(209,229,240)",
             11, "rgb(253,219,199)",
             14, "rgb(239,138,98)",
             16, "rgb(178,24,43)"
             ],
             // "circle-stroke-color": "white",
             // "circle-stroke-width": 1,
             // Transition from heatmap to circle layer by zoom level
             "circle-opacity": [
             "interpolate",
             ["linear"],
             ["zoom"],
             8, 0,
             15, 1
             ]
             }
             });*/
        });
    }
}
//******Update****
function Update_heat_map(date_extent){

    $.ajax({
        url: "/section_heat",    //请求的url地址
        data: {
            date_extent:date_extent
        },
        dataType: "json",   //返回格式为json
        async:false, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_run_data, textStatus) {

            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_heat = nest.entries(section_run_data);

            for(var i=0;i<section_heat.length;i++){
                if(section_heat[i].key == "null") section_heat.splice(i,1);
            }
            for(i=0;i<section_heat.length;i++){
                if(section_heat[i].key>2611) section_heat.splice(i,1);
            }

            section_heat.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });
                d.values = sum/d.values.length;
                if(section_info[d.key-1].path.length<2)
                    d.coor = section_info[d.key-1].path[0];
                else
                    d.coor = section_info[d.key-1].path[parseInt(section_info[d.key-1].path.length/2)];
            });
            console.log(section_heat);
            Draw_heatmap(section_heat);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
    function Draw_heatmap(section_heat) {
        var features_heat = [];
        section_heat.forEach(function (d) {
            features_heat.push({
                "type": "Feature",
                "properties": {
                    "section_id": d.key,
                    //"mag":Math.random()*100
                    "mag": d.values
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": d.coor
                }
            });
        });

        var heat_point = {
            "type": "FeatureCollection",
            "features": features_heat
        };

        map.getSource('heatmap_source').setData(heat_point);
        map.setLayoutProperty('section_heat', 'visibility', 'visible');
    }

}
//*************************

//**********Route Search*********************//
function Message_search(val,obj) {

    if (mainChart.click_pop_flag)
        mainChart.click_pop_flag.remove();

    d3.select('#suggest_text .route_option').remove();
    map.setLayoutProperty('station-hover', 'visibility', 'visible');
    map.setFilter("station-hover", ["==", "station_id", ""]);

    var reg = /^[0-9]+.?[0-9]*$/;
    var VAL_ISNUMBER = reg.test(val);
    if(VAL_ISNUMBER){
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
                if(route.length>7)
                    route.splice(8,route.length-8);

                if(route.length>0)
                    obj.append("li")
                        .attr("role","presentation")
                        .attr("class","divider");

                obj.selectAll(".route_option")
                    .data(route)
                    .enter()
                    .append("li")
                    .attr("class",".route_option")
                    .attr("role","presentation")
                    .append("a")
                    .attr("role","menuitem")
                    .attr("tabindex","-1")
                    .attr("href","javascript:void(0)")
                    .text(function (d) {
                        return d.sub_route_id;
                    })
                    .on("click",function (d) {
                        $("#input_search").val(d.sub_route_id);
                        Update_Animation_route(d.sub_route_id);
                        // message_cloud(d.sub_route_id);
                    });
            },
            complete: function () {//请求完成的处理

            },
            error: function () {//请求出错处理
            }
        });
    }
    else if(val != ""){
        $.ajax({
            url: "/station_name_search",    //请求的url地址
            data:{
                station_name: val
            },
            dataType: "json",   //返回格式为json
            async: false, //请求是否异步，默认为异步，这也是ajax重要特性
            type: "GET",   //请求方式
            contentType: "application/json",
            beforeSend: function () {//请求前的处理
            },
            success: function (station, textStatus) {
                if(station.length>7)
                    station.splice(8,station.length-8);

                if(station.length>0)
                    obj.append("li")
                        .attr("role","presentation")
                        .attr("class","divider");

                obj.selectAll(".station_option")
                    .data(station)
                    .enter()
                    .append("li")
                    .attr("class",".station_option")
                    .attr("role","presentation")
                    .append("a")
                    .attr("role","menuitem")
                    .attr("tabindex","-1")
                    .attr("href","javascript:void(0)")
                    .text(function (d){
                        return d.station_name;
                    })
                    .on("click",function (d) {
                        $("#input_search").val(d.station_name);
                        map.flyTo({
                            center: [d.longitude, d.latitude],
                            zoom:13
                        });
                        mainChart.click_pop_flag = new mapboxgl.Popup()
                            .setLngLat([d.longitude, d.latitude])
                            .setHTML(d.station_name)
                            .addTo(map);

                        map.setFilter("station-hover", ["==", "station_id", d.station_id]);
                    });
            },
            complete: function () {//请求完成的处理

            },
            error: function () {//请求出错处理
            }
        });
    }

}
//*******************************************//

//**********section render*********************//
function Update_section(date_extent) {
    $.ajax({
        url: "/section_run_data",    //请求的url地址
        data: {
            date_extent:date_extent
        },
        dataType: "json",   //返回格式为json
        async: true, //请求是否异步，默认为异步，这也是ajax重要特性
        type: "GET",   //请求方式
        contentType: "application/json",
        beforeSend: function () {//请求前的处理
        },
        success: function (section_run_data, textStatus) {
            console.log(section_run_data);
            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_data = nest.entries(section_run_data);
            for(var i=0;i<section_data.length;i++){
                if(section_data[i].key == "null") section_data.splice(i,1);
            }
            for(i=0;i<section_data.length;i++){
                if(section_data[i].key>2611) section_data.splice(i,1);
            }
            section_data.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });
                d.values = sum/d.values.length;
                d.path = section_info[d.key-1].path;
            });
            var features_line = [];

            section_data.forEach(function (d) {
                features_line.push({
                    'type': 'Feature',
                    'properties':{
                        'color':section_render(d.values),
                        'section_id': d.key
                    },
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': d.path
                    }
                });
            });

            function section_render(value){
                if(value) {
                    return threshold(value);
                }
            }
            mainChart.section_data = {
                "type": "FeatureCollection",
                "features": features_line
            };
            map.getSource('section_source').setData(mainChart.section_data);
        },
        complete: function () {//请求完成的处理
        },
        error: function () {//请求出错处理
        }
    });
}


