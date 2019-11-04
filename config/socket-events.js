var queue = [];   // list of socket waiting for peers
var rooms = {};     // map socket.id => room
var names = {};     // map socket.id => name
var avatars = {};     // map socket.id => avatar
var allUsers = {};  // map socket.id => socket

function findPeerForLoneSocket(socket) {
    if (queue && queue.length !== 0) {
        // some body in queue and pair them
        const peer = queue.pop();
        const room = `${socket.id}#${peer.id}`;
        // join them both
        peer.join(room);
        socket.join(room);
        // register rooms to their names
        rooms[peer.id] = room;
        rooms[socket.id] = room;
        // exchange name between the two of them and start the game
        peer.emit('game start', {
            username: names[socket.id],
            avatar: avatars[socket.id],
            room,
            socketId: peer.id,
            youAre: 'x'
        });
        socket.emit('game start', {
            username: names[peer.id],
            avatar: avatars[peer.id],
            room,
            socketId: socket.id,
            youAre: 'o'
        });
    } else {
        // queue is empty and add our lone socket
        queue.push(socket);
    }
}

function leaveLobby(socket) {
    const index = queue.indexOf(socket);

    if (index !== -1) {
        queue.splice(index, 1);
    }

    delete names[socket.id];
    delete avatars[socket.id];
    delete allUsers[socket.id];
}

exports = module.exports = (io) => {
    io.on('connection', (socket) => {
        
        // Xử lí khi tìm kiếm đối thủ
        socket.on('lobby', (data) => {
            names[socket.id] = data.username;
            avatars[socket.id] = data.avatar;
            allUsers[socket.id] = socket;
            findPeerForLoneSocket(socket);
        });

        // Xử lí khi nhận message
        socket.on('message', (data) => {
            const room = rooms[socket.id];
            socket.nsp.to(room).emit('message', data);
        });

        // Xử lí khi rời khỏi phòng
        socket.on('leave room', () => {
            const room = rooms[socket.id];
            socket.nsp.to(room).emit('game end');
            const socketId = room.split('#');
            allUsers[socketId[0]].leave(room);
            allUsers[socketId[1]].leave(room);
            delete rooms[socketId[0]];
            delete rooms[socketId[1]];
            delete names[socketId[0]];
            delete names[socketId[1]];
            delete avatars[socketId[0]];
            delete avatars[socketId[1]];
            delete allUsers[socketId[0]];
            delete allUsers[socketId[1]];

        });

        // Xử lí khi mất kết nối
        socket.on('disconnect', () => {
            console.log('a socket has disconnected');
            const room = rooms[socket.id];
            socket.broadcast.to(room).emit('game end');
        });

        // Xử hủy tìm đối thủ
        socket.on('leave lobby', () => {
            leaveLobby(socket);
        });

        // Xử lí khi người chơi click ô cờ
        socket.on('click square', (data) => {
            const room = rooms[socket.id];
            socket.nsp.to(room).emit('click square', data);
        });

        // Xử lí khi người chơi đầu hàng
        socket.on('surrender', () => {
            const room = rooms[socket.id];
            socket.nsp.to(room).emit('surrender', socket.id);
        });
    });
}