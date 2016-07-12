var http=require('http');//引入http module
var express = require('express');

var mysqlUtil=require('./mysqlUtil');//引入http module

var app = express();

app.use(express.static('../client'));
app.use(express.static('../docs'));

app.get('/', function (req, res) {
    res.send('Hello World');
});
app.get('/process_get', function (req, res) {

    // 输出 JSON 格式
    response = {
        first_name:req.query.first_name,
        last_name:req.query.last_name
    };
    console.log(response);
    res.end(JSON.stringify(response));
});

//http.createServer(function(request,response){//创建一个web server
//    //回调函数，这样创建server方法就不会阻塞了
//    response.writeHead(200,{'contentType':'text/plain'});
//    response.end('Hello World!\n');
//}).listen(8124);
//console.log('Server running at http://127.0.0.1:8124/');
var server = app.listen(8124, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});

////连接数据库测试
//  var sqlUtil =  new mysqlUtil();
//sqlUtil.connect();
















