// Obtener usuario de localStorage
const usuario = JSON.parse(
    localStorage.getItem('usuarioSesion')
);
if (!usuario) {
    window.location.href = '/login';
}
// Definir las páginas permitidas para cada rol
const permisos = {

    // ADMIN
    1: [
        '/Admin',
        '/usuarios',
        '/usuarios/crear',
        '/servicios',
        '/servicios/crear',
        '/facturas',
        '/facturas/crear',
        '/citas',
        '/citas/crear',
        '/insumos',
        '/insumos/crear',
        '/insumos/editar',
        '/reportes/usuarios',
        '/reportes/servicios',
        '/reportes/citas',
        '/reportes/insumos'
    ],


    // EMPLEADO
    2: [
        '/Empleado',
        '/usuarios',
        '/servicios',
        '/citas',
        '/insumos'
    ],

    // CLIENTE
    3: [
        '/Cliente',
        '/citas',
        '/citas/crear'
    ]

};

const rol = usuario.idRolFK;
const paginaActual = window.location.pathname;
if (
    !permisos[rol] ||
    !permisos[rol].includes(paginaActual)
) {

    alert('No tienes permiso para acceder a esta página.');
    window.location.href = '/login';
}