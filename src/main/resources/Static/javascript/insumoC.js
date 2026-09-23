const API_URL = "http://localhost:8080/api/insumos";
const API_USUARIOS_URL = "http://localhost:8080/api/usuarios";

document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
    inicializarVistaPreviaInsumo();
    cargarInsumosRecientes();
    inicializarInstrucciones();

    const form = document.getElementById("InsumoForm");
    if (form) {
        form.addEventListener("submit", crearInsumo);
    }
});

async function cargarUsuarios() {
    const selectUsuario = document.getElementById("idUsuarioFK");
    if (!selectUsuario) return;

    try {
        const response = await fetch(API_USUARIOS_URL);
        if (!response.ok) throw new Error("Error al obtener usuarios");

        const usuarios = await response.json();
        selectUsuario.innerHTML = '<option value="" disabled selected>Seleccione un usuario...</option>';

        usuarios.forEach(usuario => {
            const option = document.createElement("option");
            option.value = usuario.idUsuario;
            option.textContent = usuario.nombreCompleto || `Usuario ${usuario.idUsuario}`;
            selectUsuario.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        selectUsuario.innerHTML = '<option value="" disabled>Error al cargar usuarios</option>';
    }
}

async function crearInsumo(event) {
    event.preventDefault();

    const nombreInsumo = document.getElementById("nombreInsumo")?.value.trim();
    const descripcionInsumo = document.getElementById("descripcionInsumo")?.value.trim();
    const categoriaInsumo = document.getElementById("categoriaInsumo")?.value;
    const stockActual = parseInt(document.getElementById("stockActual")?.value) || 0;
    const stockMinPosible = parseInt(document.getElementById("stockMinPosible")?.value) || 0;
    const fechaVencimiento = document.getElementById("fechaVencimiento")?.value || null;
    const horaActualizacion = document.getElementById("horaActualizacion")?.value || null;
    const precioUnitario = parseFloat(document.getElementById("precioInsumo")?.value) || 0;



    if (!nombreInsumo) {
        alert("Por favor ingrese el nombre del insumo.");
        return;
    }

    const insumoData = {
        nombreInsumo,
        descripcionInsumo,
        categoriaInsumo,
        stockActual,
        stockMinPosible,
        fechaVencimiento,
        horaActualizacion,
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(insumoData)
        });

        if (response.ok) {
            alert("¡Insumo creado exitosamente!");
            document.getElementById("InsumoForm").reset();
            resetearVistaPrevia();
            cargarInsumosRecientes();
        } else {
            const errorText = await response.text();
            alert("Error al guardar el insumo: " + errorText);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}
function inicializarVistaPreviaInsumo() {
    const nombreInsumo = document.getElementById("nombreInsumo");
    const descripcionInsumo = document.getElementById("descripcionInsumo");
    const categoriaInsumo = document.getElementById("categoriaInsumo");
    const stockActual = document.getElementById("stockActual");
    const stockMinPosible = document.getElementById("stockMinPosible"); // Disponible si lo necesitas
    const fechaVencimiento = document.getElementById("fechaVencimiento"); // Disponible si lo necesitas
    const horaActualizacion = document.getElementById("horaActualizacion"); // Disponible si lo necesitas

    // Asumiendo que estos IDs existen en tu HTML para el precio y el botón de limpiar:
    const precioInsumo = document.getElementById("precioInsumo"); // Ajusta el ID según tu HTML si es diferente
    const btnLimpiarInsumo = document.getElementById("btnLimpiarInsumo");

    const actualizarVista = () => {
        const nombre = nombreInsumo?.value.trim() || "Nombre del Insumo";
        const desc = descripcionInsumo?.value.trim() || "Descripción del insumo...";
        const stock = parseInt(stockActual?.value) || 0;
        const precio = parseFloat(precioInsumo?.value);
        const cat = categoriaInsumo?.value || "Sin Categoría";

        document.getElementById("prevNombreI").textContent = nombre;
        document.getElementById("prevDescI").textContent = desc;
        document.getElementById("prevStockI").innerHTML = `<strong>Stock:</strong> ${stock} un. | <strong>Precio:</strong> $${isNaN(precio) ? '0.00' : precio.toLocaleString('es-CO')}`;
        document.getElementById("prevCategoriaI").textContent = cat;
    };

    nombreInsumo?.addEventListener("input", actualizarVista);
    descripcionInsumo?.addEventListener("input", actualizarVista);
    stockActual?.addEventListener("input", actualizarVista);
    precioInsumo?.addEventListener("input", actualizarVista);
    categoriaInsumo?.addEventListener("change", actualizarVista);

    btnLimpiarInsumo?.addEventListener("click", () => setTimeout(resetearVistaPrevia, 50));
}

function resetearVistaPrevia() {
    document.getElementById("prevNombreI").textContent = "Nombre del Insumo";
    document.getElementById("prevDescI").textContent = "Descripción del insumo...";
    document.getElementById("prevStockI").innerHTML = "<strong>Stock:</strong> 0 un. | <strong>Precio:</strong> $0.00";
    document.getElementById("prevCategoriaI").textContent = "Sin Categoría";
}

async function cargarInsumosRecientes() {
    const lista = document.getElementById("listaUltimosInsumos");
    if (!lista) return;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al obtener insumos");

        const insumos = await response.json();
        lista.innerHTML = "";

        if (!insumos || insumos.length === 0) {
            lista.innerHTML = `<li class="sin-registros">No hay insumos creados.</li>`;
            return;
        }

        const ultimos = insumos.slice(-3).reverse();
        ultimos.forEach(i => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <strong>${i.nombreInsumo || 'Insumo'}</strong>
                    <br><small style="color:#aaa">${i.categoria || 'Gral'} - Stock: ${i.cantidadStock ?? 0}</small>
                </div>
                <span>$${Number(i.precioUnitario || 0).toLocaleString('es-CO')}</span>
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
        contenidoInstrucciones.classList.toggle("abierto");
        iconoFlecha?.classList.toggle("rotar");
    });
}

/* Manejo del Sidebar */
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