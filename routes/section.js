/**
 * Created by Liang Liu on 2018/1/20.
 */
/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/section_info', function(req, res, next) {
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section');
        //查询数据
        var whereStr = {}
        collection.find({},{}).toArray(function(err, result) {
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

router.get('/section_', function(req, res, next) {

    var section_id = parseInt(req.query.section_id);

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section');
        //查询数据
        var whereStr = {}
        collection.find({"section_id":section_id}).toArray(function(err, result) {
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
