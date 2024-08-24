import fs from 'fs';
import path from 'path';
import WebSocket, { WebSocketServer } from 'ws';
import { Enterprise } from '../interfaces/enterprise';

class EnterpriseManager {
    private static empresasPath = path.join(__dirname, '../data.json');

    // Método para leer el archivo y devolver las empresas
    static async read(): Promise<Enterprise[]> {
        try {
            const data = await fs.promises.readFile(EnterpriseManager.empresasPath, 'utf8');
            const jsonData = JSON.parse(data);

            // Convertir la fecha de string a Date
            return jsonData.enterprise.map((emp: any) => ({
                ...emp,
                dateCreated: new Date(emp.dateCreated)
            }));
        } catch (err) {
            console.error('Error al leer el archivo data.json:', err);
            throw new Error('Error al leer el archivo.');
        }
    }

    // Método para agregar una nueva empresa
    static async add(nameEnterprise: string): Promise<boolean> {
        try {
            const empresas = await this.read();
            const newId = empresas.length > 0 ? empresas[empresas.length - 1].id + 1 : 1;
            
            const newEnterprise: Enterprise = {
                id: newId,
                name: nameEnterprise,
                dateCreated: new Date(),
                status: true
            };

            empresas.push(newEnterprise);
            const updatedData = { enterprise: empresas };
            await fs.promises.writeFile(this.empresasPath, JSON.stringify(updatedData, null, 2));
            console.log('Empresa añadida:', newEnterprise);
            return true;
        } catch (err) {
            console.error('Error al agregar la empresa:', err);
            return false;
        }
    }

    // Método para eliminar una empresa por ID
    static async delete(id: number): Promise<boolean> {
        try {
            const empresas = await this.read();
            const updatedEmpresas = empresas.filter(emp => emp.id !== id);

            if (empresas.length === updatedEmpresas.length) {
                console.log('Empresa no encontrada:', id);
                return false; // No se encontró la empresa para eliminar
            }

            await fs.promises.writeFile(this.empresasPath, JSON.stringify(updatedEmpresas, null, 2));
            console.log('Empresa eliminada con ID:', id);
            return true;
        } catch (err) {
            console.error('Error al eliminar la empresa:', err);
            return false;
        }
    }

    // Método para notificar a todos los clientes conectados
    static notifyClients(wss: WebSocketServer, message: string) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

export { EnterpriseManager };
