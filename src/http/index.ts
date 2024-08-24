import http from 'http';
import fs from 'fs';
import path from 'path';
import { EnterpriseManager } from '../ws/modules/enterprise.manager';

async function apiRest(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.url === '/enterprise') {
    try {
      // Obtén los datos de `EnterpriseManager`
      const empresas = await EnterpriseManager.read();

      // Establece el tipo de contenido como JSON
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(empresas), 'utf8');
    } catch (err) {
      console.error('Error al obtener datos de EnterpriseManager:', err);
      res.writeHead(500);
      res.end('Error al obtener los datos.');
    }
    return true; // Indica que la solicitud fue manejada
  }
  return false; // Indica que la solicitud no fue manejada por `apiRest`
}

function pages(req: http.IncomingMessage, res: http.ServerResponse) {
  let filePath: string;
  let contentType = 'text/html';

  switch (req.url) {
    case '/environment':
      filePath = path.join(__dirname, '../template/environment.html');
      break;
    case '/history':
      filePath = path.join(__dirname, '../template/history.html');
      break;
    case '/styles':
      filePath = path.join(__dirname, '../styles.css');
      contentType = 'text/css';
      break;
    default:
      // Maneja la raíz del servidor y cualquier otro archivo
      filePath = path.join(__dirname, '../../src', req.url || '');
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, 'index.html');
      }
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf8');
      } else {
        res.writeHead(500);
        res.end('Sorry, there was an error processing your request.');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
}

export function createHttpServer() {
  const server = http.createServer(async (req, res) => {
    const handledByApiRest = await apiRest(req, res);

    if (!handledByApiRest) {
      pages(req, res);
    }
  });

  return server;
}
