//세팅에 필요한 모듈들은 require로 가져와 변수에 담는다.
const express = require('express');
const http = require('http');
//http 모듈은 서버 생성 메소드(createServer)를 제공하며 파라미터로 express는 서버를 생성
const app = express();
const server = http.createServer(app);
//index.html의 파일을 읽기
const fs = require("fs");
const io = require('socket.io')(server);

//만약 이 작업을 하지 않으면 http://주소/src/index.html로 접근하려고 했을때 액세스가 거부됩니다. express의 use 메소드를 통해 정적파일 설정을 해줍니다.
app.use(express.static('src'));

//사용자가 사이트에 접근할 때는 get과 post방식으로 접근. 여기선 express의 get 메소드 사용
//'/'는 사용자가 접근할 url의 경로값. '/'은 localhost:8080/의 경로
app.get('/', function(req,res){
    //'/'로 접속이 성공했을 때 실행될 function
    //req 요청 오브젝트가 전달. res 응답 오브젝트 전달
    fs.readFile("./src/index.html", (err,data)=> {
        if(err) throw err;
        //정상적으로 응답 데이터가 있을 경우
        //writehead 메소드는 응답 스트림에 헤더와 상태코드 작성. 이게 완료되면 write 실행(응답 바디 작성)
        res.writeHead(200, {
            "Content-Type" : "text/html"
        })
        .write(data)
        .end();
    });
});

io.sockets.on('connection', function(socket){
    socket.on('newUserConnect', function(name){
        socket.name = name;
        
        //io.sockets.emit을 통해 updateMessage라는 이벤트를 호출하며 해당 데이터들을 객체 리터럴로 전송
        //newUserConnect는 서버에서 전달하는 메시지이므로 name에는 서버라고 작성
        io.sockets.emit('updateMessage',{
            name : 'SERVER',
            message : name + "님이 접속했습니다"
        });
    });
    socket.on('disconnect', function(){        
        //io.sockets은 나를 포함한 전체 소켓, socket.broadcast는 나를 제외한 전체 소켓. 내가 접속을 종료하는데 나에게 emit할 필요는 없음
        io.sockets.emit('updateMessage', { 
            name : 'SERVER', 
            message : socket.name + '님이 퇴장했습니다'
        }); 
    });

    socket.on('sendMessage', function(data){
        data.name = socket.name;
        io.sockets.emit('updateMessage', data);
    });
});

//생성된 서버를 웹에서 확인할 수 있도록 함
server.listen(8080, function(){
    console.log('서버 실행중...');
});