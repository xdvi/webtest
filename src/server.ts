import { createHttpServer } from './http/index';
import { setupWebSocket } from './ws/index';

// Crea el servidor HTTP
const server = createHttpServer();

// Configura WebSocket en el servidor HTTP
setupWebSocket(server);

// Inicia el servidor en el puerto 8080
server.listen(8080, () => {
  console.log('Servidor escuchando en http://localhost:8080');
});
