export const datosSemilla = [
    { id: 'a-1', nombre: 'Ana',    apellido: 'López',   email: 'ana.lopez@umg.edu.gt',    edad: 20 },
    { id: 'a-2', nombre: 'Luis',   apellido: 'Pérez',   email: 'luis.perez@umg.edu.gt',   edad: 22 },
    { id: 'a-3', nombre: 'Marta',  apellido: 'García',  email: 'marta.garcia@umg.edu.gt', edad: 21 },
];

export class RepositorioAlumnos {
    constructor(alumnosIniciales = []) {
        this.alumnos = alumnosIniciales.map((alumno) => ({ ...alumno }));
        this.siguienteId = this.alumnos.length + 1;
    }

    listar() {
        return [...this.alumnos];
    }

    obtener(id) {
        return this.alumnos.find((alumno) => alumno.id === id);
    }

    crear(datos) {
        const nuevoAlumno = { id: `a-${this.siguienteId}`, ...datos };
        this.siguienteId++;
        this.alumnos.push(nuevoAlumno);
        return nuevoAlumno;
    }

    actualizar(id, datos) {
        const alumno = this.alumnos.find((a) => a.id === id);
        if (!alumno) {
            return undefined;
        }
        Object.assign(alumno, datos);
        return alumno;
    }

    eliminar(id) {
        const cantidadAntes = this.alumnos.length;
        this.alumnos = this.alumnos.filter((alumno) => alumno.id !== id);
        return this.alumnos.length < cantidadAntes;
    }
}
