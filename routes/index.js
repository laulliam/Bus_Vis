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
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
