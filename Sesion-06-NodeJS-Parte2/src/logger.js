export default function registrarProceso(msg) {
    return `[${new Date().toISOString()}] ${msg}`;
}