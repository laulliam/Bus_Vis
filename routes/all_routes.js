/**
 * Created by Liang Liu on 2018/2/2.
 */
/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/all_routes', function(req, res, next) {

    var route_id = req.query.route_id;
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('all_routes');
        //查询数据
        var whereStr = {}
        collection.find({"sub_route_id":route_id},{
            "_id":0
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

router.get('/all_routes_animation', function(req, res, next) {
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('all_routes');
        //查询数据
        collection.find({},{
            "_id":0
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

router.get('/route_search', function(req, res, next) {

    var sub_route_id = req.query.sub_route_id;
    console.log(typeof (sub_route_id),sub_route_id);
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('all_routes');
        //查询数据
        var pattern = new RegExp("^"+sub_route_id+"");
        console.log(pattern);
        collection.find({sub_route_id:{$regex:pattern}}).toArray(function(err, result) {
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
