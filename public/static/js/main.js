/**
 * Created by Liang Liu on 2018/1/20.
 */

/*var southWest = L.latLng(31.32255387, 104.57336425),
    northEast = L.latLng(31.59725256, 104.91016387),
    mybounds = L.latLngBounds(southWest, northEast);

var osmUrl = 'http://localhost:8888/tiles/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {
        //maxBounds:mybounds,
        minZoom: 12,
        maxZoom: 18,
        attribution: osmAttrib
    });

var map = L.map('main')
    .setView([31.46,104.7416], 12)
    .addLayer(osm);

map.setMaxBounds(mybounds);

console.log(map.getBounds());
console.log(map.getCenter());*/
    //mapbox

    var bounds = [
        [104.57336425, 31.32255387], // Southwest coordinates
        [104.91016387, 31.59725256]  // Northeast coordinates
    ];

    mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';

    var map = new mapboxgl.Map({
        container: 'main',
        style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',
        zoom: 12,
        center: [104.78, 31.437]
        //maxBounds: bounds // Sets bounds as max
    });

    Init_tools();
    function Init_tools() {
        var mainChart_tool = d3.select("#main")
            .append("div")
            .attr("width",100)
            .attr("height",30)
            .attr("class", "btn-group btn-group-xs")
            .style({
                "position": "absolute",
                "z-index": "999",
                "top": "1%",
                "left": "10%"
            })
            .selectAll("btn btn-default")
            .data(["play", "user", "unchecked"])
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
                    case "unchecked":
                        return "cc";
                }
            });

        mainChart_tool.append("span")
            .attr("class", function (d) {
                console.log(d);
                return "glyphicon glyphicon-"+ d;
            })
            .attr("aria-hidden",true);
    }

    DrawSection(section_info);

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

            //update_stream(e.features[0].properties.station_id);
            function update_stream(station_id) {
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

                        routes_id.forEach(function (d) {
                            $.ajax({
                                url: "/sub_route_data",    //请求的url地址
                                data:{
                                    sub_route_id:d,
                                    station_id:station_id
                                },
                                dataType: "json",   //返回格式为json
                                async: true, //请求是否异步，默认为异步，这也是ajax重要特性
                                type: "GET",   //请求方式
                                contentType: "application/json",
                                beforeSend: function () {//请求前的处理
                                },
                                success: function (sub_route_data, textStatus) {
                                    console.log(sub_route_data);
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

            new mapboxgl.Popup()
                .setLngLat(e.features[0].geometry.coordinates[2])
                .setHTML(e.features[0].properties.section_id)
                .addTo(map);
        });

        map.on('mouseenter', 'section', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'section', function () {
            map.getCanvas().style.cursor = '';
        });
    }

    //Section_render(new Date(2016,0,1,7,0,0),new Date(2016,0,1,8,0,0));

    function  Section_render(start_time,end_time) {

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
