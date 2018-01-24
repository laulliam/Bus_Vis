/**
 * Created by Liang Liu on 2018/1/20.
 */
var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/section_run_data', function(req, res, next) {

    var time_start_end = req.query.time;
    var section_id = req.query.section_id;

    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('section_run_data');
        //查询数据
        var whereStr = {};
        collection.find({
            //"id":1,
            "section_id":section_id,
            "start_date_time" :{$gte:new Date('2015-12-31T22:00:00.000Z'),$lte:new Date('2015-12-31T23:00:00.000Z')}
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
