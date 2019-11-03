const queue = [];   // list of socket waiting for peers
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
            socketId: peer.id
        });
        socket.emit('game start', {
            username: names[peer.id],
            avatar: avatars[peer.id],
            room,
            socketId: socket.id
        });
    } else {
        // queue is empty and add our lone socket
        queue.push(socket);
    }
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
            socket.broadcast.to(room).emit('game end');
        });

        // Xử lí khi mất kết nối
        socket.on('disconnect', () => {
            const room = rooms[socket.id];
            socket.broadcast.to(room).emit('game end');
        });
    });
}