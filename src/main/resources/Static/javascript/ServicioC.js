const API_URL = "http://localhost:8080/api/servicios";
const API_USUARIOS_URL = "http://localhost:8080/api/usuarios";
const API_INSUMOS_URL = "http://localhost:8080/api/insumos"; // URL para insumos

document.addEventListener("DOMContentLoaded", () => {
    cargarEstilistas();
    cargarInsumos(); // Carga la lista al iniciar
    inicializarVistaPreviaServicio();
    cargarServiciosRecientes();
    inicializarInstrucciones();

    const form = document.getElementById("ServiceForm");
    if (form) {
        form.addEventListener("submit", crearServicio);
    }
});

async function cargarEstilistas() {
    const selectEstilista = document.getElementById("idUsuarioFK");
    if (!selectEstilista) return;

    try {
        const response = await fetch(`${API_USUARIOS_URL}/rol/2`);
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

// Cargar la lista de insumos desde la API
async function cargarInsumos() {
    const selectInsumo = document.getElementById("idInsumoFk") || document.getElementById("idIsumoFk");
    if (!selectInsumo) return;

    try {
        const response = await fetch(API_INSUMOS_URL);
        if (!response.ok) throw new Error("Error al obtener insumos");

        const insumos = await response.json();

        // Limpiar opciones previas
        selectInsumo.innerHTML = '<option value="" disabled selected>Seleccione un insumo...</option>';

        if (!insumos || insumos.length === 0) {
            selectInsumo.innerHTML = '<option value="" disabled>No hay insumos registrados</option>';
            return;
        }

        insumos.forEach(insumo => {
            const option = document.createElement("option");
            // Soporte para diferentes nombres de ID y Nombre en el JSON
            option.value = insumo.idInsumo || insumo.id || insumo.id_insumo;
            option.textContent = insumo.nombreInsumo || insumo.nombre || insumo.nombre_insumo || `Insumo ${option.value}`;
            selectInsumo.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar insumos:", error);
        selectInsumo.innerHTML = '<option value="" disabled>Error al cargar insumos</option>';
    }
}

async function crearServicio(event) {
    event.preventDefault();

    // Capturar referencias de los elementos
    const elNombre = document.getElementById("nombreServicio");
    const elDesc = document.getElementById("descripcionServicio");
    const elPrecio = document.getElementById("precioBase");
    const elCat = document.getElementById("categoria");
    const elUsuario = document.getElementById("idUsuarioFK");
    const elInsumo = document.getElementById("idInsumoFk") || document.getElementById("idIsumoFk");

    // Diagnóstico en consola si alguno falta (SE CORRIGIÓ idIdnsumo -> elInsumo)
    if (!elNombre || !elDesc || !elPrecio || !elCat || !elUsuario || !elInsumo) {
        console.error("Error: Uno o más elementos no se encontraron en el HTML:", {
            nombreServicio: elNombre,
            descripcionServicio: elDesc,
            precioBase: elPrecio,
            categoria: elCat,
            idUsuarioFK: elUsuario,
            idInsumoFk: elInsumo
        });
        alert("Error interno: Hay un problema con los IDs del formulario.");
        return;
    }

    // Obtener valores de manera segura
    const nombreServicio = elNombre.value.trim();
    const descripcionServicio = elDesc.value.trim();
    const precioBase = parseFloat(elPrecio.value);
    const categoria = elCat.value;
    const idUsuarioFk = parseInt(elUsuario.value);
    const idInsumoFk = parseInt(elInsumo.value);

    if (isNaN(idUsuarioFk)) {
        alert("Por favor seleccione un estilista válido.");
        return;
    }

    if (isNaN(idInsumoFk)) {
        alert("Por favor seleccione un insumo válido.");
        return;
    }

    // (SE ELIMINÓ LA "a" SUELTA AQUÍ Y SE AÑADIERON LAS VARIANTES DE LLAVE FORÁNEA)
    const servicioData = {
        nombreServicio,
        descripcionServicio,
        precioBase,
        categoria,
        estado: "Disponible",
        idUsuarioFk,
        idUsuarioFK: idUsuarioFk,
        idInsumoFk,
        idInsumoFK: idInsumoFk
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(servicioData)
        });

        if (response.ok) {
            alert("¡Servicio creado exitosamente!");
            document.getElementById("ServiceForm").reset();
            resetearVistaPrevia();
            cargarServiciosRecientes();
        } else {
            const errorText = await response.text();
            alert("Error al guardar el servicio: " + errorText);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error al conectar con el servidor backend.");
    }
}

function inicializarVistaPreviaServicio() {
    const inNombre = document.getElementById("nombreServicio");
    const inDesc = document.getElementById("descripcionServicio");
    const inPrecio = document.getElementById("precioBase");
    const inCat = document.getElementById("categoria");
    const btnLimpiar = document.getElementById("btnLimpiarServicio");

    inNombre?.addEventListener("input", (e) => {
        const prevNombre = document.getElementById("prevNombreS");
        if (prevNombre) prevNombre.textContent = e.target.value.trim() || "Nombre del Servicio";
    });

    inDesc?.addEventListener("input", (e) => {
        const prevDesc = document.getElementById("prevDescS");
        if (prevDesc) prevDesc.textContent = e.target.value.trim() || "Descripción breve del servicio...";
    });

    inPrecio?.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        const prevPrecio = document.getElementById("prevPrecioS");
        if (prevPrecio) prevPrecio.innerHTML = `<strong>Precio:</strong> $${isNaN(val) ? '0.00' : val.toLocaleString('es-CO')}`;
    });

    inCat?.addEventListener("change", (e) => {
        const prevCat = document.getElementById("prevCategoriaS");
        if (prevCat) prevCat.textContent = e.target.value || "Sin Categoría";
    });

    btnLimpiar?.addEventListener("click", () => setTimeout(resetearVistaPrevia, 50));
}

function resetearVistaPrevia() {
    const prevNombre = document.getElementById("prevNombreS");
    const prevDesc = document.getElementById("prevDescS");
    const prevPrecio = document.getElementById("prevPrecioS");
    const prevCat = document.getElementById("prevCategoriaS");

    if (prevNombre) prevNombre.textContent = "Nombre del Servicio";
    if (prevDesc) prevDesc.textContent = "Descripción breve del servicio...";
    if (prevPrecio) prevPrecio.innerHTML = "<strong>Precio:</strong> $0.00";
    if (prevCat) prevCat.textContent = "Sin Categoría";
}

async function cargarServiciosRecientes() {
    const lista = document.getElementById("listaUltimosServicios");
    if (!lista) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al obtener servicios");

        const servicios = await response.json();
        lista.innerHTML = "";

        if (!servicios || servicios.length === 0) {
            lista.innerHTML = `<li class="sin-registros">No hay servicios creados.</li>`;
            return;
        }

        const ultimos = servicios.slice(-3).reverse();
        ultimos.forEach(s => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${s.nombreServicio || 'Servicio'}</strong>
                    <br><small style="color:#aaa">${s.categoria || 'Gral'}</small>
                </div>
                <span>$${Number(s.precioBase || 0).toLocaleString('es-CO')}</span>
            `;
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar lista reciente:", error);
        lista.innerHTML = `<li class="sin-registros">No se pudo cargar la lista.</li>`;
    }
}

function inicializarInstrucciones() {
    const btnInstrucciones = document.getElementById("btnInstrucciones");
    const contenidoInstrucciones = document.getElementById("contenidoInstrucciones");
    const iconoFlecha = document.getElementById("iconoFlecha");

    btnInstrucciones?.addEventListener("click", () => {
        contenidoInstrucciones?.classList.toggle("abierto");
        iconoFlecha?.classList.toggle("rotar");
    });
}

const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const sidebarBtn = document.getElementById('sidebar-btn');

sidebarBtn?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-hidden');
});

menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('minimize');
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