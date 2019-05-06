/**
 * Created by Liang Liu on 2018/3/17.
 */
/**
 * Created by Liang Liu on 2018/1/20.
 */
 let express = require('express');
 let router = express.Router();
 let d3 = require('./d3.min');

 let MongoClient = require('mongodb').MongoClient;
 let DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';


//获取站点雷达数据
router.get('/sub_route_data', function(req, res, next) {

    let sub_route_id = req.query.sub_route_id;
    let station_id = req.query.station_id;
    let date_extent = req.query.date_extent;


    let selectData = function(db, callback) {
        //连接到表
        let collection = db.collection('station_run_data');
        //查询数据
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
        //连接到表
        let collection = db.collection('station_run_data');
        //查询数据
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
        //连接到表
        let collection = db.collection('station_run_data');
        //查询数据
        collection.find({"station_id":station_id},{
            "_id":0,
            "id":0
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
            let route_id_nest = d3.nest().key(function (d) {
                return d.sub_route_id;
            });
            let data = route_id_nest.entries(result);

            /*let date_extent = [new Date("2016-1-1 06:00:00"),new Date("2016-1-31 23:00:00")];

            data.forEach((d)=>{

                d.values.sort((a,b)=>{
                    return new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime();
                });

                let date_min= [];

                for(let i = date_extent[0].getTime();i<=date_extent[1].getTime();i+=300000){
                    date_min.push({sub_route_id:null,date:new Date(i),value:0});
                }
                });

            });*/



            res.json(data);
            db.close();
        });
    });

});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
