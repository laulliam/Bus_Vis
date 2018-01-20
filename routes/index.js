var express = require('express');
var router = express.Router();

/*var http = require('http');
var fs = require('fs');//引入文件读取模块

var documentRoot = 'E:/Bus_Vis';
//需要访问的文件的存放目录

var server= http.createServer(function(req,res){
    var url = req.url;
    var file = documentRoot + url;
    fs.readFile( file , function(err,data){
        /!*
            一参为文件路径
            二参为回调函数
                回调函数的一参为读取错误返回的信息，返回空就没有错误
                二参为读取成功返回的文本内容
        *!/
        if(err){
            res.writeHeader(404,{
                'content-type' : 'text/html;charset="utf-8"'
            });
            res.write('<h1>404错误</h1><p>你要找的页面不存在</p>');
            res.end();
        }else{
            res.writeHeader(200,{
                'content-type' : 'image/png;base64'
            });
            res.write(data);//将index.html显示在客户端
            res.end();
        }
    });
}).listen(8888);*/

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/traffic_data';

router.get('/all_routes', function(req, res, next) {
    var selectData = function(db, callback) {
        //连接到表
        var collection = db.collection('all_routes');
        //查询数据
        var whereStr = {}
        collection.find().toArray(function(err, result) {
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
