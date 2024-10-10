import { createHttpServer } from './http/index';
import { setupWebSocket } from './ws/index';

// Crea el servidor HTTP
const server = createHttpServer();
const production = false;

let ssl = true;
if (!production && ssl) {
  ssl = false
}

const url = 'webtest-j76z.onrender.com';
const port = 8080;

// Configura WebSocket en el servidor HTTP
setupWebSocket(server);

// Inicia el servidor en el puerto 8080
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});
