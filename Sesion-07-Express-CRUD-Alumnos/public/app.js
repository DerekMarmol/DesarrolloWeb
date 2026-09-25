const API = '/alumnos';
const API_KEY = 'umg-2026';

const cabeceras = (conJson = true) => ({
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    'x-api-key': API_KEY,
});

const tabla = document.querySelector('#tablaAlumnos tbody');
const mensaje = document.querySelector('#mensaje');
const dialogoForm = document.querySelector('#dialogoForm');
const dialogoEliminar = document.querySelector('#dialogoEliminar');
const form = document.querySelector('#formAlumno');
const tituloForm = document.querySelector('#tituloForm');
const inputNombre = document.querySelector('#nombre');
const inputApellido = document.querySelector('#apellido');
const inputEmail = document.querySelector('#email');
const inputEdad = document.querySelector('#edad');
const nombreEliminar = document.querySelector('#nombreEliminar');

let idEnEdicion = null;
let idAEliminar = null;

async function cargarAlumnos() {
    const res = await fetch(API);
    const alumnos = await res.json();

    tabla.innerHTML = '';
    for (const alumno of alumnos) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${alumno.id}</td>
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>${alumno.email}</td>
            <td>${alumno.edad ?? ''}</td>
            <td>
                <button type="button" class="btn-editar">Editar</button>
                <button type="button" class="btn-eliminar">Eliminar</button>
            </td>
        `;

        fila.querySelector('.btn-editar').addEventListener('click', () => abrirDialogoEditar(alumno.id));
        fila.querySelector('.btn-eliminar').addEventListener('click', () => eliminarAlumno(alumno.id));

        tabla.appendChild(fila);
    }
}

function abrirDialogoNuevo() {
    form.reset();
    idEnEdicion = null;
    tituloForm.textContent = 'Nuevo alumno';
    dialogoForm.showModal();
}

async function abrirDialogoEditar(id) {
    const res = await fetch(`${API}/${id}`);
    const alumno = await res.json();

    inputNombre.value = alumno.nombre;
    inputApellido.value = alumno.apellido;
    inputEmail.value = alumno.email;
    inputEdad.value = alumno.edad ?? '';

    idEnEdicion = id;
    tituloForm.textContent = 'Editar alumno';
    dialogoForm.showModal();
}

async function guardarAlumno(event) {
    event.preventDefault();

    const datos = {
        nombre: inputNombre.value,
        apellido: inputApellido.value,
        email: inputEmail.value,
        edad: inputEdad.value ? Number(inputEdad.value) : undefined,
    };

    try {
        const url = idEnEdicion ? `${API}/${idEnEdicion}` : API;
        const metodo = idEnEdicion ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: metodo,
            headers: cabeceras(),
            body: JSON.stringify(datos),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'No se pudo guardar el alumno');
        }

        dialogoForm.close();
        await cargarAlumnos();
        mostrarMensaje(idEnEdicion ? 'Alumno actualizado' : 'Alumno creado', 'ok');
    } catch (err) {
        mostrarMensaje(err.message, 'error');
    }
}

function eliminarAlumno(id) {
    idAEliminar = id;
    const fila = [...tabla.querySelectorAll('tr')].find((tr) => tr.firstElementChild.textContent === id);
    nombreEliminar.textContent = fila ? fila.children[1].textContent : id;
    dialogoEliminar.showModal();
}

async function confirmarEliminar() {
    try {
        const res = await fetch(`${API}/${idAEliminar}`, {
            method: 'DELETE',
            headers: cabeceras(false),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'No se pudo eliminar el alumno');
        }

        dialogoEliminar.close();
        await cargarAlumnos();
        mostrarMensaje('Alumno eliminado', 'ok');
    } catch (err) {
        mostrarMensaje(err.message, 'error');
    }
}

function mostrarMensaje(texto, tipo = 'ok') {
    mensaje.textContent = texto;
    mensaje.className = tipo;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#btnNuevo').addEventListener('click', abrirDialogoNuevo);
    form.addEventListener('submit', guardarAlumno);
    document.querySelector('#btnCancelar').addEventListener('click', () => dialogoForm.close());
    document.querySelector('#btnCancelarEliminar').addEventListener('click', () => dialogoEliminar.close());
    document.querySelector('#btnConfirmarEliminar').addEventListener('click', confirmarEliminar);

    cargarAlumnos();
});