// Configuración de la URL de tu API REST
const API_URL = "http://localhost:8080/api/usuarios";

// Extraer el 'id' enviado desde listadoU.html?id=X
const urlParams = new URLSearchParams(window.location.search);
const usuarioId = urlParams.get('id');

// Menú Lateral (sidebar) y dropdowns
const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const sidebarBtn = document.getElementById('sidebar-btn');

sidebarBtn?.addEventListener('click', () => document.body.classList.toggle('sidebar-hidden'));
menuBtn?.addEventListener('click', () => sidebar.classList.toggle('minimize'));

menusItemsDropDown.forEach((menuItem) => {
    menuItem.addEventListener('click', (e) => {
        if (e.target.closest('.menu-link')) e.preventDefault();
        const subMenu = menuItem.querySelector('.sub-menu');
        const isActive = menuItem.classList.toggle('sub-menu-toggle');
        if (subMenu) {
            subMenu.style.height = isActive ? `${subMenu.scrollHeight + 20}px` : '0';
            subMenu.style.padding = isActive ? '0.2rem 0' : '0';
        }
    });
});

// Inicialización de la pantalla al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    if (!usuarioId) {
        alert("No se especificó un ID de usuario válido.");
        window.location.href = "listadoU.html";
        return;
    }

    cargarDatosUsuario(usuarioId);

    const formActualizar = document.getElementById("form-actualizar");
    if (formActualizar) {
        formActualizar.addEventListener("submit", enviarActualización);
    }
});

// Obtiene los datos del usuario mediante GET
let contraseniaActual = "";
let idRolFKActual = null;

// GET: Cargar datos
async function cargarDatosUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Error al obtener datos.");

        const usuario = await response.json();

        // Almacenar valores por si el HTML no tiene los campos
        contraseniaActual = usuario.contrasenia || '';
        idRolFKActual = usuario.idRolFK || null;

        // Asignar datos a los inputs
        document.getElementById("tipoDocumento").value = usuario.tipoDocumento || '';
        document.getElementById("numDocumento").value = usuario.numDocumento || '';
        document.getElementById("nombreCompleto").value = usuario.nombreCompleto || '';
        document.getElementById("telefono").value = usuario.telefono || '';
        document.getElementById("email").value = usuario.email || '';
        document.getElementById("direccion").value = usuario.direccion || '';
        document.getElementById("genero").value = usuario.genero || '';
        document.getElementById("cargo").value = usuario.cargo || '';
        document.getElementById("estado").value = usuario.estado || 'Activo';

        // Si existe el select en el HTML, seleccionar la opción que corresponde al idRolFK
        const selectRol = document.getElementById("idRolFK");
        if (selectRol && usuario.idRolFK) {
            selectRol.value = usuario.idRolFK;
        }

    } catch (error) {
        console.error("Error al cargar usuario:", error);
    }
}

// PUT: Enviar actualización
async function enviarActualización(e) {
    e.preventDefault();

    const selectRol = document.getElementById("idRolFK");
    // Toma el valor del select HTML si existe; de lo contrario usa la variable global
    const rolValor = selectRol && selectRol.value ? selectRol.value : idRolFKActual;

    const usuarioData = {
        idUsuario: Number(usuarioId),
        tipoDocumento: document.getElementById("tipoDocumento").value,
        numDocumento: Number(document.getElementById("numDocumento").value),
        nombreCompleto: document.getElementById("nombreCompleto").value.trim(),
        telefono: Number(document.getElementById("telefono").value),
        email: document.getElementById("email").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        genero: document.getElementById("genero").value,
        cargo: document.getElementById("cargo").value || "Cliente",
        estado: document.getElementById("estado").value || "Activo",
        contrasenia: contraseniaActual,
        idRolFK: Number(rolValor) // Must be a number and not null/NaN
    };

    // Validación preventiva en JS
    if (!usuarioData.idRolFK || isNaN(usuarioData.idRolFK)) {
        alert("El campo 'Rol' es obligatorio y no puede ir vacío.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${usuarioId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuarioData)
        });

        if (response.ok) {
            alert("Usuario actualizado con éxito.");
            window.location.href = "listadoU.html";
        } else {
            alert("No se pudo actualizar el usuario. Verifique la consola de Java.");
        }
    } catch (error) {
        console.error("Error en la solicitud PUT:", error);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const btnInstrucciones = document.getElementById("btnInstrucciones");
    const contenidoInstrucciones = document.getElementById("contenidoInstrucciones");
    const iconoFlecha = document.getElementById("iconoFlecha");

    if (btnInstrucciones && contenidoInstrucciones) {
        btnInstrucciones.addEventListener("click", () => {
            // Alterna la clase 'abierto' en el contenedor del contenido
            contenidoInstrucciones.classList.toggle("abierto");

            // Rota la flecha según el estado
            if (iconoFlecha) {
                iconoFlecha.classList.toggle("rotar");
            }
        });
    }
});
