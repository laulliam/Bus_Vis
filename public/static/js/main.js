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
//offline osm map
    function Get_data() {

        $.ajax({
         url: "/station_info",    //请求的url地址
         data:{
         },
         dataType: "json",   //返回格式为json
         async: true, //请求是否异步，默认为异步，这也是ajax重要特性
         type: "GET",   //请求方式
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
                 beforeSend: function () {//请求前的处理
                 },
                 success: function (section_data, textStatus) {
                     console.log(section_data);
                     Drawmap(station_data,section_data);
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

    Get_data();

    function Drawmap(station_data,section_data) {

        mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';

        /*var southWest = L.latLng(31.32255387, 104.57336425),
         northEast = L.latLng(31.59725256, 104.91016387),
         mybounds = L.latLngBounds(southWest, northEast);*/

        var map = new mapboxgl.Map({
            container: 'main',
            style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',
            zoom: 12,
            center: [104.7416, 31.46]
        });

        var features_point=[];
        station_data.forEach(function (d) {
            features_point.push({ "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [d.longitude, d.latitude]
                }});
        });

        var features_line=[];
        section_data.forEach(function (d) {

            d.path=eval(d.path);

            d.path.forEach(function (s) {
                var tem=s[0];
                s[0] = s[1];
                s[1] = tem;
            });

            features_line.push({
                'type': 'Feature',
                'properties': {
                    'color': '#2af725' // red
                },
                'geometry': {
                    'type': 'LineString',
                    'coordinates':d.path
                }
            });
        });

        var geojson_point = {
            "type": "FeatureCollection",
            "features": features_point
        };

        map.on('load', function () {

            //station point
            map.addSource('point', {
                "type": "geojson",
                "data": geojson_point
            });
            map.addLayer({
                "id": "point",
                "source": "point",
                "type": "circle",
                "paint": {
                    "circle-radius": 1.5,
                    "circle-color": "#007cbf"
                }
            });

            //routes
            map.addLayer({
                'id': 'lines',
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data':  {
                        'type': 'FeatureCollection',
                        'features':features_line
                    }
                },
                'paint': {
                    'line-width': 2,
                    'line-color': ['get', 'color']
                }
            });



        });
    }

