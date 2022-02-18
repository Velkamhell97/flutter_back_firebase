// const { io } = require("socket.io-client");

//Esta carpeta no entiende el require o import, por que no esta dentro de un entorno de node, por lo tanto
//-para este caso de vanilla javascript tenemos que trabajar si tipado
const socket = io();

socket.on('connect', () => {
  console.log('Server Connected (From Client)');
});

socket.on('disconnect', () => {
  console.log('Server Disconnected (From Client)');
});