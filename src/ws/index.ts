import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { EnterpriseManager } from './modules/enterprise.manager';

async function handleCommand(ws: WebSocket, command: string, wss: WebSocketServer) {
    const parts = command.split(' ');

    // Comprobamos si el comando tiene al menos 3 partes: comando, tipo y nombre
    if (parts.length < 3) {
        ws.send('Comando inválido.');
        return;
    }

    // Validamos el tipo de comando
    switch (parts[0]) {
        case 'new':
            switch (parts[1]) {
                case 'enterprise':
                    const empresaName = parts[2];
                    if (!empresaName) {
                        ws.send('Nombre de la empresa no proporcionado.');
                        break;
                    }

                    const success = await EnterpriseManager.add(empresaName);
                    if (success) {
                        ws.send(`Empresa añadida: ${empresaName}`);
                        EnterpriseManager.notifyClients(wss, `Nueva empresa añadida: ${empresaName}`);
                    } else {
                        ws.send('Error al procesar la solicitud.');
                    }
                    break;

                default:
                    ws.send('Tipo de entidad no reconocido.');
                    break;
            }
            break;

        default:
            ws.send(`Comando no reconocido: ${command}`);
            break;
    }
}


function handleWebSocketMessage(ws: WebSocket, message: WebSocket.MessageEvent, wss: WebSocketServer) {
    let msg = typeof message === 'string' ? message : message.toString();
    console.log(`Mensaje recibido: ${msg}`);
    if (msg.startsWith('/')) {
        msg = msg.slice(1);
        handleCommand(ws, msg, wss);
    } else {
        ws.send(`Mensaje recibido: ${msg}`);
    }
}

export function setupWebSocket(server: http.Server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('Cliente conectado');

        ws.on('message', (message: WebSocket.MessageEvent) => {
            handleWebSocketMessage(ws, message, wss);
        });

        ws.on('close', () => {
            console.log('Cliente desconectado');
        });

        ws.on('error', (error: Error) => {
            console.error('Error en WebSocket:', error);
        });
    });

    return wss;
}
