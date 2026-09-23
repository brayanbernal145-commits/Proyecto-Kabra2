const API_URL = "http://localhost:8080/api/usuarios";

document.addEventListener("DOMContentLoaded", () => {
    inicializarInstrucciones();
    inicializarVistaPrevia();
    cargarUsuariosRecientes();
});

/* Lógica para crear el usuario */
async function crearUsuario(event) {
    if (event) event.preventDefault();

    const tipoDocumento = document.getElementById("TipoDocumento").value;
    const numDocumento = Number(document.getElementById("numDocumento").value);
    const nombreCompleto = document.getElementById("nombreCompleto").value.trim();
    const telefono = Number(document.getElementById("telefono").value);
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const contrasenia = document.getElementById("contrasenia").value.trim();
    const genero = document.getElementById("genero").value;
    const idRolFK = Number(document.getElementById("idRolFK").value);

    const estado = document.getElementById("estado").value || "Activo";
    const cargo = document.getElementById("cargo").value || "Cliente";

    if (!numDocumento || !nombreCompleto || !email || !contrasenia || !idRolFK) {
        alert("Por favor complete todos los campos obligatorios.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipoDocumento: tipoDocumento,
                numDocumento: numDocumento,
                nombreCompleto: nombreCompleto,
                telefono: telefono,
                email: email,
                direccion: direccion,
                contrasenia: contrasenia,
                genero: genero,
                cargo: cargo,
                estado: estado,
                idRolFK: idRolFK
            })
        });

        if (response.ok) {
            alert("Usuario creado correctamente");
            document.getElementById("userForm").reset();
            resetearVistaPrevia();
            cargarUsuariosRecientes();
        } else {
            alert("Error al guardar el usuario. Verifique los datos ingresados.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor Spring Boot");
    }
}

/* Actualización en Tiempo Real de la Vista Previa */
function inicializarVistaPrevia() {
    const inNombre = document.getElementById("nombreCompleto");
    const inDoc = document.getElementById("numDocumento");
    const inTipoDoc = document.getElementById("TipoDocumento");
    const inEmail = document.getElementById("email");
    const inRol = document.getElementById("idRolFK");
    const btnLimpiar = document.getElementById("btnLimpiar");

    inNombre?.addEventListener("input", (e) => {
        document.getElementById("prevNombre").textContent = e.target.value.trim() || "Nombre del Usuario";
    });

    inDoc?.addEventListener("input", actualizarDocumentoPreview);
    inTipoDoc?.addEventListener("change", actualizarDocumentoPreview);

    function actualizarDocumentoPreview() {
        const tipo = inTipoDoc.value || "";
        const doc = inDoc.value || "";
        document.getElementById("prevDoc").textContent = (tipo || doc) ? `Doc: ${tipo} ${doc}` : "Doc: -";
    }

    inEmail?.addEventListener("input", (e) => {
        document.getElementById("prevCorreo").textContent = e.target.value.trim() || "correo@ejemplo.com";
    });

    inRol?.addEventListener("change", (e) => {
        const roles = { "1": "Administrador", "2": "Empleado", "3": "Cliente" };
        document.getElementById("prevRol").textContent = roles[e.target.value] || "Rol No Seleccionado";
    });

    btnLimpiar?.addEventListener("click", () => {
        setTimeout(resetearVistaPrevia, 50);
    });
}

function resetearVistaPrevia() {
    document.getElementById("prevNombre").textContent = "Nombre del Usuario";
    document.getElementById("prevDoc").textContent = "Doc: -";
    document.getElementById("prevCorreo").textContent = "correo@ejemplo.com";
    document.getElementById("prevRol").textContent = "Rol No Seleccionado";
}

/* Consultar los últimos usuarios registrados */
async function cargarUsuariosRecientes() {
    const lista = document.getElementById("listaUltimosUsuarios");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al consultar usuarios");

        const usuarios = await response.json();
        lista.innerHTML = "";

        if (!usuarios || usuarios.length === 0) {
            lista.innerHTML = `<li class="sin-registros">No hay usuarios registrados.</li>`;
            return;
        }

        // Tomar los últimos 3 usuarios registrados
        const ultimos = usuarios.slice(-3).reverse();

        ultimos.forEach(u => {
            const li = document.createElement("li");
            const rolTexto = u.idRolFK === 1 ? "Admin" : u.idRolFK === 2 ? "Empleado" : "Cliente";
            li.innerHTML = `
                <div>
                    <strong>${u.nombreCompleto || 'Sin nombre'}</strong>
                    <br><small style="color:#aaa">${u.email || ''}</small>
                </div>
                <span>${rolTexto}</span>
            `;
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar los últimos usuarios:", error);
        lista.innerHTML = `<li class="sin-registros">No se pudo cargar la lista.</li>`;
    }
}

/* Lógica del Sidebar y Menú Desplegable */
const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const sidebarBtn = document.getElementById('sidebar-btn');

sidebarBtn?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-hidden');
});

menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('minimize');
});

menusItemsDropDown.forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        const subMenu = menuItem.querySelector('.sub-menu');
        const isActive = menuItem.classList.toggle('sub-menu-toggle');
        if (subMenu) {
            subMenu.style.height = isActive ? `${subMenu.scrollHeight + 20}px` : '0';
            subMenu.style.padding = isActive ? '0.2rem 0' : '0';
        }
    });
});

function inicializarInstrucciones() {
    const btnInstrucciones = document.getElementById("btnInstrucciones");
    const contenidoInstrucciones = document.getElementById("contenidoInstrucciones");
    const iconoFlecha = document.getElementById("iconoFlecha");

    btnInstrucciones?.addEventListener("click", () => {
        contenidoInstrucciones.classList.toggle("abierto");
        iconoFlecha?.classList.toggle("rotar");
    });
}