/**
 * Created by Liang Liu on 2018/3/17.
 */
 let express = require('express');
 let router = express.Router();
 let d3 = require('./d3.min');

 let MongoClient = require('mongodb').MongoClient;
 let DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';
 
router.get('/sub_route_data', function(req, res, next) {

    let sub_route_id = req.query.sub_route_id;
    let station_id = req.query.station_id;
    let date_extent = req.query.date_extent;


    let selectData = function(db, callback) {
                let collection = db.collection('station_run_data');
                collection.find({
            "sub_route_id":sub_route_id,
            "station_id":station_id,
            "start_date_time":{$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}
        },{
            "_id":0,
            "id":0,
            "product_id":0
        }).toArray(function(err, result) {
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

router.get('/route_station_data', function(req, res, next) {

    let route_id= req.query.sub_route_id;

    console.log(route_id,typeof(route_id));

    let selectData = function(db, callback) {
                let collection = db.collection('station_run_data');
                collection.find({"sub_route_id":route_id,"start_date_time":{$gte:new Date(2016,0,1,7,0,0),$lte:new Date(2016,0,2,7,0,0)}
        },{
            "_id":0,
            "id":0,
            "product_id":0
        }).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);s
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
/* GET home page. */

router.get('/station_run_id', function(req, res, next) {

    let station_id = req.query.station_id;

    let selectData = function(db, callback) {
                let collection = db.collection('station_run_data');
                collection.find({"station_id":station_id},{
            "_id":0,
            "id":0,
            "product_id":0,
            "route_id":0,
            "end_date_time":0
        }).toArray(function(err, result) {
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

                                                
            /*var res_arr = [];

            data.forEach(function (d) {

                var data_date ={};
                for(var i = new Date(2016,0,1,6,0,0).getTime();i<new Date(2016,1,1).getTime();i += 300000)
                    data_date[new Date(i)] = 0;

                d.values.forEach(function (s) {
                    s.start_date_time = new Date(s.start_date_time);

                    if(s.stay_time>100)
                        s.stay = 0;

                    if(s.start_date_time.getSeconds()>30){
                        s.start_date_time.setMinutes(s.start_date_time.getMinutes()+1);
                        s.start_date_time.setSeconds(0);
                    }
                    s.start_date_time.setSeconds(0);
                    s.start_date_time.setMinutes(s.start_date_time.getMinutes()-s.start_date_time.getMinutes()%5);
                    data_date[s.start_date_time] = s.stay_time;
                });

                                                                Object.keys(data_date).forEach(function (key) {
                    res_arr.push({route_id:d.key,date:key,stay_time:data_date[key]});
                });

            });
*/
            res.json(result);
            db.close();
        });
    });

});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
