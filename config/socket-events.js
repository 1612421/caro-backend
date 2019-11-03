exports = module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('have a new connection');
        socket.on('chat mouted', (user) => {
            console.log('mouted');
        })
    });
}