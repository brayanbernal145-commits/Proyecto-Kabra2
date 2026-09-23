const API_SERVICIOS_URL = "http://localhost:8080/api/servicios";
const API_USUARIOS_URL = "http://localhost:8080/api/usuarios";

//menu
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


// Capturar el ID del servicio de la URL (ejemplo: actualizarS.html?id=3)
const urlParams = new URLSearchParams(window.location.search);
const idServicio = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    if (!idServicio) {
        alert("No se proporcionó un ID de servicio válido.");
        window.location.href = "ListadoS.html";
        return;
    }

    // Primero cargar los estilistas en el select
    await cargarEstilistas();

    // Luego cargar la información del servicio actual
    await cargarDatosServicio(idServicio);

    // Escuchar el evento submit para enviar la actualización (PUT)
    const form = document.getElementById("form-actualizar-servicio");
    if (form) {
        form.addEventListener("submit", actualizarServicio);
    }
});

// Cargar estilistas (usuarios con rol de estilista/empleado)
async function cargarEstilistas() {
    const selectEstilista = document.getElementById("idUsuarioFK");
    if (!selectEstilista) return;

    try {
        const response = await fetch(`${API_USUARIOS_URL}/rol/3`);
        if (!response.ok) throw new Error("Error al obtener estilistas");

        const usuarios = await response.json();
        selectEstilista.innerHTML = '<option value="" disabled selected>Seleccione un estilista...</option>';

        usuarios.forEach(usuario => {
            const option = document.createElement("option");
            option.value = usuario.idUsuario;
            option.textContent = usuario.nombreCompleto || `Usuario ${usuario.idUsuario}`;
            selectEstilista.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar estilistas:", error);
        selectEstilista.innerHTML = '<option value="" disabled>Error al cargar estilistas</option>';
    }
}

// Cargar los datos del servicio a actualizar
async function cargarDatosServicio(id) {
    try {
        const response = await fetch(`${API_SERVICIOS_URL}/${id}`);
        if (!response.ok) throw new Error("No se pudo obtener el servicio.");

        const servicio = await response.json();

        document.getElementById("nombreServicio").value = servicio.nombreServicio || "";
        document.getElementById("descripcionServicio").value = servicio.descripcionServicio || "";
        document.getElementById("precioBase").value = servicio.precioBase || "";
        document.getElementById("categoria").value = servicio.categoria || "";
        document.getElementById("estado").value = servicio.estado || "Activo";

        // Mapeo adaptado a 'idUsuarioFk' ('k' minúscula según la entidad Java)
        document.getElementById("idUsuarioFK").value = servicio.idUsuarioFk || servicio.idUsuarioFK || "";

    } catch (error) {
        console.error("Error al cargar datos del servicio:", error);
        alert("Error al obtener la información del servicio.");
    }
}

// Petición PUT para enviar los cambios al backend
async function actualizarServicio(event) {
    event.preventDefault();

    const servicioData = {
        idServicio: parseInt(idServicio),
        nombreServicio: document.getElementById("nombreServicio").value.trim(),
        descripcionServicio: document.getElementById("descripcionServicio").value.trim(),
        precioBase: parseFloat(document.getElementById("precioBase").value),
        categoria: document.getElementById("categoria").value.trim(),
        estado: document.getElementById("estado").value,
        idUsuarioFk: parseInt(document.getElementById("idUsuarioFK").value) // 'k' minúscula
    };

    try {
        const response = await fetch(`${API_SERVICIOS_URL}/${idServicio}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(servicioData)
        });

        if (response.ok) {
            alert("¡Servicio actualizado exitosamente!");
            window.location.href = "ListadoS.html";
        } else {
            const errorText = await response.text();
            alert("Error al actualizar el servicio: " + errorText);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
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
