/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/section_run_data', function(req, res, next) {

    var section_id = parseInt(req.query.section_id);
    var date_start=req.query.date_start;
    var date_end = req.query.date_end;

    console.log(typeof(section_id),new Date(date_end));

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({
            "section_id":section_id,
            "start_date_time" :{$gte:new Date(date_start),$lte:new Date(date_end)}
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
            //console.log(result);
            db.close();
        });
    });

});

router.get('/section_id_data', function(req, res, next) {

    var section_id = parseInt(req.query.section_id);
    var date_extent = req.query.date_extent;

    //console.log(typeof(section_id),date_extent);

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        collection.find({section_id:section_id,start_date_time:{$gte:new Date(date_extent[0]),$lte:new Date(date_extent[1])}},{
            _id:0,id:0,product_id:0,
            from_station_id:0,from_station_name:0,target_station_id:0,target_station_name:0,
            section_id:0,speed:0,type:0,end_date_time:0
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
            res.send(result);
            //console.log(result);
            db.close();
        });
    });

});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
