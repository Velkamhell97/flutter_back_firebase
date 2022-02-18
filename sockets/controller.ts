import { Server, Socket } from "socket.io";

const socketController = async (client : Socket, server : Server) => {
  console.log('Client Connected (From Server)');

  client.on('disconnect', () => {
    console.log('Client Disconnect (From Server)');
  })
}

export default socketController;