/**
 * Created by Liang Liu on 2018/3/17.
 */
/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/sub_route_data', function(req, res, next) {

    var sub_route_id = req.query.sub_route_id;
    var station_id = req.query.station_id;
    var start_time = req.query.start_time;
    var end_time = req.query.end_time;


    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('station_run_data');
        //查询数据
        var whereStr = {}
        collection.find({
            "sub_route_id":sub_route_id,
            "station_id":station_id,
            "start_date_time":{$gte:new Date(2016,0,1,7,0,0),$lte:new Date(2016,0,2,7,0,0)}
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

router.get('/rank_station_data', function(req, res, next) {

    var date= req.query.date;

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('station_run_data');
        //查询数据
        var whereStr = {}
        collection.find({"start_date_time":{$gte:new Date(2016,0,1,7,0,0),$lte:new Date(2016,0,1,8,0,0)}
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

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
