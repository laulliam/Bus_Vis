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

    $.ajax({
     url: "/station_info",    //请求的url地址
     data:{
     },
     dataType: "json",   //返回格式为json
     async: true, //请求是否异步，默认为异步，这也是ajax重要特性
     type: "GET",   //请求方式
     beforeSend: function () {//请求前的处理
     },
     success: function (data, textStatus) {
     console.log(data);
     Drawmap(data);
     },
     complete: function () {//请求完成的处理
     },
     error: function () {//请求出错处理
     }
     });

    function Drawmap(data) {

    mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';

    /*var southWest = L.latLng(31.32255387, 104.57336425),
        northEast = L.latLng(31.59725256, 104.91016387),
        mybounds = L.latLngBounds(southWest, northEast);*/

    var map = new mapboxgl.Map({
        container: 'main',
        style: 'mapbox://styles/silentll/cjckbaggi8de22sp5g6cblhnx',
        zoom:12,
        center:[104.7416,31.46]
    });

    function pointOnCircle(data) {
        return {
            "type": "Point",
            "coordinates": [data.longitude,data.latitude]
        };
    }

    map.on('load', function() {
        map.addLayer({
            'id': 'lines',
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'properties': {
                            'color': '#2af725' // red
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [-122.4833858013153, 37.829607404976734],
                                [-122.4830961227417, 37.82932776098012],
                                [-122.4830746650696, 37.82932776098012],
                                [-122.48218417167662, 37.82889558180985],
                                [-122.48218417167662, 37.82890193740421],
                                [-122.48221099376678, 37.82868372835086],
                                [-122.4822163581848, 37.82868372835086],
                                [-122.48205006122589, 37.82801003030873]
                            ]
                        }
                    }, {
                        'type': 'Feature',
                        'properties': {
                            'color': '#ebe23b' // blue
                        },
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [
                                [-122.48393028974533, 37.829471820141016],
                                [-122.48395174741744, 37.82940826466351],
                                [-122.48395174741744, 37.829412501697064],
                                [-122.48423874378203, 37.829357420242125],
                                [-122.48422533273697, 37.829361657278575],
                                [-122.48459815979002, 37.8293425906126],
                                [-122.48458743095398, 37.8293447091313],
                                [-122.4847564101219, 37.82932776098012],
                                [-122.48474299907684, 37.829331998018276],
                                [-122.4849334359169, 37.829298101706186],
                                [-122.48492807149889, 37.82930022022615],
                                [-122.48509705066681, 37.82920488676767],
                                [-122.48509168624878, 37.82920912381288],
                                [-122.48520433902739, 37.82905870855876],
                                [-122.48519897460936, 37.82905870855876],
                                [-122.4854403734207, 37.828594749716714],
                                [-122.48543500900269, 37.82860534241688],
                                [-122.48571664094925, 37.82808206121068],
                                [-122.48570591211319, 37.82809689109353],
                                [-122.4858346581459, 37.82797189627337],
                                [-122.48582661151886, 37.82797825194729],
                                [-122.4859634041786, 37.82788503534145],
                                [-122.48595803976059, 37.82788927246246],
                                [-122.48605459928514, 37.82786596829394]
                            ]
                        }
                    }]
                }
            },
            'paint': {
                'line-width': 3,
                // Use a get expression (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-get)
                // to set the line-color to a feature property value.
                'line-color': ['get', 'color']
            }
        });

        data.forEach(function (d,i) {

            map.addSource('point', {
                "type": "geojson",
                "data": pointOnCircle(d)
            });

            map.addLayer({
                "id": "point_"+i,
                "source": "point",
                "type": "circle",
                "paint": {
                    "circle-radius": 3,
                    "circle-color": "#bf170b"
                }
            });
        });





    });
}