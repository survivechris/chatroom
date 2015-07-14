var app=require('express')();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/test');
var db=mongoose.connection;
db.on('error',console.error.bind(console,'we are facing connection error:'));

db.once('open',function(callback){
});

var flowSchema=mongoose.Schema(
    {
      name:{type:String},
      content:{type:String}
    }    
  );
var Flow = mongoose.model('Flow', flowSchema);

io.on('connection',function(socket){
  socket.on('add user',function(username) {
    socket.username = username;
    console.log(username);
    socket.emit('chat', 'SERVER: '+ 'You have connected'); 
    socket.broadcast.emit('chat', 'SERVER '+ username + ' is on deck');
    
    //read history msg from the mongodb
    Flow.find({},function(err,doc){
      //emit the doc (history) array to html file
      socket.emit('get history',doc);
    });
    
    //store in the mongodb
    var temp=new Flow({name: 'SERVER' ,content: 'SERVER: '+ socket.username + ' is on deck'});
    temp.save(function (err) {
      if (err) return handleError(err);
      // userOne (Simon) is saved!
    });

  });

  socket.on('chat', function(msg) {

    io.emit('chat', socket.username+': '+ msg);
    //store the chatting content
    var temp=new Flow({name: socket.username ,content: msg});
    temp.save(function (err) {
      if (err) return handleError(err);
      // userOne (Simon) is saved!
    });
  });
});

app.get('/chatroom',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

http.listen(8000,function(){
  console.log('listening on * : 8000');
});

