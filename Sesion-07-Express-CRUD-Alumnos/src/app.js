import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export function autenticacionFalsa(req, res, next) {
    const claveEsperada = process.env.API_KEY || 'umg-2026';
    const claveRecibida = req.get('x-api-key');

    if (claveRecibida !== claveEsperada) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    next();
}

export function validarAlumno(req, res, next) {
    const { nombre, apellido, email, edad } = req.body;

    if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }

    if (typeof apellido !== 'string' || apellido.trim() === '') {
        return res.status(400).json({ error: 'El apellido es requerido' });
    }

    if (typeof email !== 'string' || email.trim() === '' || !email.includes('@')) {
        return res.status(400).json({ error: 'El email es inválido' });
    }

    if (edad !== undefined && (typeof edad !== 'number' || edad < 0)) {
        return res.status(400).json({ error: 'La edad debe ser un número mayor o igual a 0' });
    }

    next();
}

export function crearApp(repositorio) {
    const app = express();

    app.use(express.json());

    app.use(express.static(join(__dirname, '..', 'public')));

        app.get('/alumnos', (req, res) => {
        res.status(200).json(repositorio.listar());
    });

    app.get('/alumnos/:id', (req, res) => {
        const alumno = repositorio.obtener(req.params.id);
        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        res.status(200).json(alumno);
    });

    app.post('/alumnos', autenticacionFalsa, validarAlumno, (req, res) => {
        const nuevoAlumno = repositorio.crear(req.body);
        res.status(201).json(nuevoAlumno);
    });

    app.put('/alumnos/:id', autenticacionFalsa, validarAlumno, (req, res) => {
        const actualizado = repositorio.actualizar(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        res.status(200).json(actualizado);
    });

    app.delete('/alumnos/:id', autenticacionFalsa, (req, res) => {
        const eliminado = repositorio.eliminar(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        res.status(204).send();
    });

    return app;
}
