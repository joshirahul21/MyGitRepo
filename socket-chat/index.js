//var config = require('config');
//var socketioJwt = require('socketio-jwt');
//var config = require('config');
//var secret = config.get('secretToken');

module.exports = function (server) {
    var io = require('socket.io')(server);

    //Set authorization to validate token.
//    io.set('authorization', socketioJwt.authorize({
//        secret: secret,
//        handshake: true
//    }));

    io.on('connection', function (socket) {
        console.log('Connected: ' + socket.id);
//        if (socket && socket.client && socket.client.request && socket.client.request.decoded_token) {
//            console.log(socket.client.request.decoded_token, 'connected');
//
//        }
        
        socket.emit('message','message from server.')
        
        socket.on('disconnect', function () {
            console.log('Disconnected: ' + socket.id);
        });
    });
    
    
};