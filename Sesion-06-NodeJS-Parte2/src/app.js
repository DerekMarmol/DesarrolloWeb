import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export function generarId() {
    return `r-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export async function filtrarLogs(origen, destino, texto) {
    let contador = 0;

    const filtro = new Transform({
        transform(chunk, encoding, callback) {
            this._buffer = (this._buffer || '') + chunk.toString();
            const lineas = this._buffer.split('\n');
            this._buffer = lineas.pop();

            for (const linea of lineas) {
                if (linea.includes(texto)) {
                    contador++;
                    this.push(linea + '\n');
                }
            }
            callback();
        },
        flush(callback) {
            if (this._buffer && this._buffer.includes(texto)) {
                contador++;
                this.push(this._buffer + '\n');
            }
            callback();
        },
    });

    await pipeline(
        createReadStream(origen, { encoding: 'utf-8' }),
        filtro,
        createWriteStream(destino)
    );

    return contador;
}

export async function leerLineas(ruta) {
    return new Promise((resolve, reject) => {
        const stream = createReadStream(ruta, { encoding: 'utf-8' });
        let data = '';

        stream.on('data', (chunk) => {
            data += chunk;
        });

        stream.on('end', () => {
            const lineas = data.split('\n').filter((linea) => linea.trim() !== '');
            resolve(lineas);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

export function rutaAbsoluta(rutaRelativa) {
    return join(__dirname, rutaRelativa);
}

export function parsearEnv(contenido) {
    const resultado = {};
    const lineas = contenido.split('\n');

    for (const linea of lineas) {
        const limpia = linea.trim();
        if (limpia === '' || limpia.startsWith('#')) {
            continue;
        }

        const igualIndex = limpia.indexOf('=');
        if (igualIndex === -1) {
            continue;
        }

        const clave = limpia.slice(0, igualIndex).trim().toUpperCase();
        const valor = limpia.slice(igualIndex + 1).trim();
        resultado[clave] = valor;
    }

    return resultado;
}