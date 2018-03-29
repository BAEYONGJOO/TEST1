/**
 * Socket.io
 */
var sample = require('./test1_input');
var socketio = (server) => {
    var io = require('socket.io')(server);
    console.info('sample input data',sample.length);    
    
    io.on('connection',function(socket){
        var idx = 0;
        var pid = null;
        if(pid != null) {clearInterval(pid);}
        pid = setInterval(()=>{
            socket.emit('data', {"no":idx+1, "type": sample[idx][0], "price": sample[idx][1], "qty":sample[idx][2]});
            idx++;
            if(idx > sample.length - 1){
                if(pid != null) {clearInterval(pid);}
            }
        },200);
        socket.on('disconnect', function(){
            if(pid != null) {clearInterval(pid);}
            console.log('user disconnected');
        });
    });
};

module.exports = socketio;