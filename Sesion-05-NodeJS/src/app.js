import http from 'node:http';
import { EventEmitter } from 'node:events';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

export function generarId() {
    return `m-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function leerBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

export function parsearArgumentos(argv) {
    const args = argv.slice(2);
    let nombre = 'invitado';
    let puerto = 3000;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--nombre' && args[i + 1]) {
            nombre = args[i + 1];
        } else if (args[i] === '--puerto' && args[i + 1]) {
            puerto = Number(args[i + 1]);
        }
    }

    return { nombre, puerto };
}

export function obtenerConfig(env) {
    return {
        puerto: env.PORT ? Number(env.PORT) : 3000,
        nombreApp: env.NOMBRE_APP || 'mensajes-api',
        archivoDatos: env.ARCHIVO_DATOS || 'data/mensajes.json',
    };
}

export function infoSistema() {
    return {
        plataforma: os.platform(),
        nucleos: os.cpus().length,
        memoriaLibreMB: Math.round(os.freemem() / 1024 / 1024),
        hostname: os.hostname(),
    };
}

export function crearLogger() {
    const emitter = new EventEmitter();
    return {
        registrar(mensaje) {
            const linea = `[${new Date().toISOString()}] ${mensaje}`;
            emitter.emit('registro', linea);
        },
        onRegistro(fn) {
            emitter.on('registro', fn);
        },
    };
}

export async function leerMensajes(archivoDatos) {
    try {
        const contenido = await fs.readFile(archivoDatos, 'utf-8');
        const datos = JSON.parse(contenido);
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

export async function agregarMensaje(archivoDatos, texto) {
    const textoLimpio = texto.trim();
    if (textoLimpio === '') {
        return null;
    }

    const mensajes = await leerMensajes(archivoDatos);
    const nuevoMensaje = {
        id: generarId(),
        texto: textoLimpio,
        fecha: new Date().toISOString(),
    };

    mensajes.push(nuevoMensaje);

    const directorio = path.dirname(archivoDatos);
    await fs.mkdir(directorio, { recursive: true });
    await fs.writeFile(archivoDatos, JSON.stringify(mensajes, null, 2));

    return nuevoMensaje;
}

export function crearServidor(config = {}) {
    const {
        archivoDatos = 'data/mensajes.json',
        nombreApp = 'mensajes-api',
        logger = crearLogger(),
    } = config;

    const server = http.createServer(async (req, res) => {
        try {
            logger.registrar(`${req.method} ${req.url}`);

            if (req.method === 'GET' && req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    mensaje: `Bienvenido a ${nombreApp}`,
                    hora: new Date().toISOString(),
                    sistema: infoSistema(),
                }));
                return;
            }

            if (req.method === 'GET' && req.url === '/mensajes') {
                const mensajes = await leerMensajes(archivoDatos);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mensajes));
                return;
            }

            if (req.method === 'POST' && req.url === '/mensajes') {
                const body = await leerBody(req);
                let texto;
                try {
                    texto = JSON.parse(body).texto;
                } catch {
                    texto = undefined;
                }

                if (!texto || texto.trim() === '') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'El texto es requerido' }));
                    return;
                }

                const nuevoMensaje = await agregarMensaje(archivoDatos, texto);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(nuevoMensaje));
                return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
        } catch {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error interno del servidor' }));
        }
    });

    return server;
}

export function iniciarServidor(config = {}) {
    const { puerto = 3000 } = config;
    const logger = config.logger || crearLogger();
    const server = crearServidor({ ...config, logger });

    server.listen(puerto, () => {
        logger.registrar(`Servidor en http://localhost:${puerto}`);
    });

    return server;
}