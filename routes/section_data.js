
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';
var d3 = require('./d3.min');


//Calendar View
router.get('/section_route_data', function(req, res, next) {

    var section_id = req.query.section_id;

    var selectData = function(db, callback) {

        db.collection('section_run_data').find({"section_id" : parseInt(section_id)},
            {
                "from_station_id":0,
                "id":0,
                "stay_time":0,
                "from_station_name":0,
                "_id":0,
                "end_date_time":0,
                "product_id":0,
                "route_id": 0,
                "section_id":0,
                "sub_route_id": 0,
                "target_station_id": 0,
                "target_station_name": 0,
                "type": 0
            })
            .toArray(function(err, result) {
                if (err) throw err;
                callback(result);
            });

    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {

        selectData(db, function(result) {

            var data =[];
            for(var i = 1;i<=31;i++){
                for(var j=6;j<24;j++)
                    data.push({day:i,hour:j,speed:null});
            }

            result.forEach(function (d) {

                if(d.speed >= 80)
                    d.speed = null;

                d.start_date_time = new Date(d.start_date_time);

                if(d.start_date_time.getSeconds()>=30){
                    d.start_date_time.setMinutes(d.start_date_time.getMinutes()+1);
                    d.start_date_time.setSeconds(0);
                }
                else
                    d.start_date_time.setSeconds(0);

                if(d.start_date_time.getMinutes()>=30){
                    d.start_date_time.setHours(d.start_date_time.getHours()+1);
                    d.start_date_time.setMinutes(0);
                }
                else
                    d.start_date_time.setMinutes(0);

            });

            var dataset = d3.nest().key(function (d) {
                return d.start_date_time;
            }).entries(result);

            dataset.forEach(function (d) {

                var sum =0;
                d.values.forEach(function (s) {
                    sum += s.speed;
                });

                d.day = new Date(d.key).getDate();
                d.hour = new Date(d.key).getHours();
                d.speed = sum/d.values.length;

            });

            data.forEach(function (d){
                dataset.forEach(function (s) {
                    if(d.hour === s.hour &&d.day === s.day)
                        d.speed = parseFloat(s.speed.toFixed(2));
                });
            });

            db.collection('section_hour_data').insertMany([{section_id:parseInt(req.query.section_id),hour_data:data}],function(err, res) {
                if (err) throw err;
            });

            res.json(data);
            db.close();

        });
    });

});

router.get('/section_hour_data', function(req, res, next) {

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_hour_data');
        //查询数据
        collection.find({"section_id" : parseInt(req.query.section_id)}).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            res.json(result);
            db.close();
        });
    });

});

router.get('/route_search', function(req, res, next) {

    var route_id = req.query.route_id;
    console.log(typeof (route_id),route_id);
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('all_routes');
        //查询数据
        var whereStr = {}
        collection.find({sub_route_id:{$regex:route_id}}).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            callback(result);
        });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            res.json(result);
            db.close();
        });
    });

});

router.get('/section_heat', function(req, res, next) {
    var date_extent = req.query.date_extent;
    console.log(new Date(date_extent[0]));
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({"start_date_time" : {$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}},
            {
                "from_station_id":0,
                "id":0,
                "stay_time":0,
                "from_station_name":0,
                "_id":0
            })
            .toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    return;
                }
                callback(result);
            });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {

            var nest = d3.nest().key(function (d) {
                return d.section_id;
            });
            var section_heat = nest.entries(result);

            for(var i=0;i<section_heat.length;i++){
                if(section_heat[i].key === "null") section_heat.splice(i,1);
            }
            for(i=0;i<section_heat.length;i++){
                if(section_heat[i].key>2611) section_heat.splice(i,1);
            }

            section_heat.forEach(function (d) {
                var sum =0;
                d.values.forEach(function (s) {
                    if(s.speed>80) s.speed = null;
                    sum += s.speed;
                });
                d.values = parseFloat(sum/d.values.length).toFixed(2);
            });
            res.json(section_heat);
            db.close();
        });
    });

});

router.get('/section_id_date', function(req, res, next) {

    var section_id = req.query.section_id;
    var date_start = new Date(req.query.date);
    var date_end = new Date(req.query.date);
    date_end.setDate(date_end.getDate()+1);
    console.log(date_start,date_end);
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({"section_id" : parseInt(section_id),"start_date_time" : {$gte:date_start,$lte:date_end}},
            {
                "from_station_id":0,
                "id":0,
                "stay_time":0,
                "from_station_name":0,
                "_id":0,
                "end_date_time":0,
                "product_id":0,
                "route_id": 0,
                "section_id":0,
                "sub_route_id": 0,
                "target_station_id": 0,
                "target_station_name": 0,
                "type": 0
            })
            .toArray(function(err, result) {
                if(err)
                {
                    console.log('Error:'+ err);
                    return;
                }
                callback(result);
            });
    }

    MongoClient.connect(DB_CONN_STR, function(err, db) {
        selectData(db, function(result) {
            result.sort(function(a,b){
                return new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime();
            });
            result.forEach(function (d) {
                if(d.speed>80) d.speed = null;
            });
            res.json(result);
            db.close();
        });
    });

});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
