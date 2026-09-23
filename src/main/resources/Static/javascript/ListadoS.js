
const API_URL = "http://localhost:8080/api/servicios";
let paginaActual = 0;
const tamanoPagina = 6;
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar Sidebar y UI
    initSidebar();
    checkWindowSize();

    // Cargar datos de la API
    cargarServicios(paginaActual);
});

// Event listener para redimensionar ventana
window.addEventListener('resize', checkWindowSize);

function initSidebar() {
    const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const menusItemsStatic = document.querySelectorAll('.menu-item-static');
    const sidebarBtn = document.getElementById('sidebar-btn');

    // Ocultar / Mostrar sidebar completamente
    if (sidebarBtn) {
        sidebarBtn.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-hidden');
        });
    }

    // Minimizar / Expandir sidebar
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('minimize');
            cerrarTodosLosSubmenus();
        });
    }

    // Manejo de desplegables
    menusItemsDropDown.forEach((menuItem) => {
        menuItem.addEventListener('click', (e) => {
            if (e.target.closest('.sub-menu')) return;

            const subMenu = menuItem.querySelector('.sub-menu');
            const isActive = menuItem.classList.toggle('sub-menu-toggle');

            // Cerrar otros submenús (Comportamiento acordeón)
            menusItemsDropDown.forEach((item) => {
                if (item !== menuItem) {
                    const otherSubmenu = item.querySelector('.sub-menu');
                    if (otherSubmenu) {
                        item.classList.remove('sub-menu-toggle');
                        otherSubmenu.style.height = "0";
                        otherSubmenu.style.padding = "0";
                    }
                }
            });

            // Abrir/cerrar actual
            if (subMenu) {
                if (isActive) {
                    subMenu.style.height = `${subMenu.scrollHeight}px`;
                    subMenu.style.padding = '0.5rem 0';
                } else {
                    subMenu.style.height = '0';
                    subMenu.style.padding = '0';
                }
            }
        });
    });

    // Cerrar desplegables en hover sobre ítems estáticos
    menusItemsStatic.forEach((menuItem) => {
        menuItem.addEventListener('mouseenter', () => {
            if (sidebar && sidebar.classList.contains('minimize')) {
                cerrarTodosLosSubmenus();
            }
        });
    });
}

function cerrarTodosLosSubmenus() {
    const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
    menusItemsDropDown.forEach((item) => {
        const subMenu = item.querySelector('.sub-menu');
        if (subMenu) {
            item.classList.remove('sub-menu-toggle');
            subMenu.style.height = '0';
            subMenu.style.padding = '0';
        }
    });
}

function checkWindowSize() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (window.innerWidth <= 768) {
        sidebar.classList.add('minimize');
    } else {
        sidebar.classList.remove('minimize');
    }
}

async function cargarServicios(pagina) {
    try {
        const response = await fetch(`${API_URL}/paginado?page=${pagina}&size=${tamanoPagina}`);
        if (!response.ok) throw new Error("Error al obtener servicios");

        const data = await response.json();
        paginaActual = data.number;
        renderizarTabla(data.content);
        renderizarPaginacion(data);
    } catch (error) {
        console.error("Error al cargar servicios:", error);
    }
}

function renderizarTabla(servicios) {
    const tbody = document.getElementById("tabla-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!servicios || servicios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="sin-datos">No hay servicios registrados.</td></tr>`;
        return;
    }

    servicios.forEach(servicio => {
        // Valida si es 'activo' o 'disponible' para aplicar la clase CSS correcta
        const estadoTexto = servicio.estado ? servicio.estado.toLowerCase() : '';
        const esActivo = estadoTexto === 'activo' || estadoTexto === 'disponible';
        const estadoClase = esActivo ? 'activo' : 'inactivo';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${servicio.nombreServicio || 'Sin nombre'}</td>
            <td>${servicio.descripcionServicio || '-'}</td>
            <td>$${servicio.precioBase || '0.00'}</td>
            <td>${servicio.categoria || '-'}</td>
            <td><span class="estado ${estadoClase}">${servicio.estado || 'Inactivo'}</span></td>
            <td>
                <div class="acciones">
                    <a class="btn-accion editar" href="ActualizarS.html?id=${servicio.idServicio}" title="Actualizar">
                        <i class='bx bx-edit'></i>
                    </a>
                    <button class="btn-accion eliminar" onclick="eliminarServicio(${servicio.idServicio})" title="Eliminar Servicio">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarPaginacion(data) {
    const infoRegistros = document.getElementById("info-registros");
    const infoPagina = document.getElementById("info-pagina");
    const paginacionContainer = document.getElementById("paginacion-container");

    if (infoRegistros) infoRegistros.textContent = `Mostrando ${data.numberOfElements} de ${data.totalElements} servicios`;
    if (infoPagina) infoPagina.textContent = `Página ${data.number + 1} de ${data.totalPages || 1}`;

    if (!paginacionContainer) return;
    paginacionContainer.innerHTML = "";

    // Botón Anterior
    const btnAnt = document.createElement("button");
    btnAnt.className = "btn-pag";
    btnAnt.textContent = "Anterior";
    btnAnt.disabled = data.first;
    btnAnt.onclick = () => cargarServicios(data.number - 1);
    paginacionContainer.appendChild(btnAnt);

    // Lógica para limitar a máximo 5 botones numéricos
    const maxBotones = 5;
    let inicio = Math.max(0, data.number - Math.floor(maxBotones / 2));
    let fin = Math.min(data.totalPages, inicio + maxBotones);

    if (fin - inicio < maxBotones) {
        inicio = Math.max(0, fin - maxBotones);
    }

    // Botones numéricos acotados
    for (let i = inicio; i < fin; i++) {
        const btnPage = document.createElement("button");
        btnPage.className = `btn-pag ${i === data.number ? 'actual' : ''}`;
        btnPage.textContent = i + 1;
        btnPage.onclick = () => cargarServicios(i);
        paginacionContainer.appendChild(btnPage);
    }

    // Botón Siguiente
    const btnSig = document.createElement("button");
    btnSig.className = "btn-pag";
    btnSig.textContent = "Siguiente";
    btnSig.disabled = data.last;
    btnSig.onclick = () => cargarServicios(data.number + 1);
    paginacionContainer.appendChild(btnSig);
}

async function eliminarServicio(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) {
                alert("Servicio eliminado con éxito");
                cargarServicios(paginaActual);
            } else {
                alert("No se pudo eliminar el servicio");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}
let categoriaActual = 'TODAS';
let estadoActual = 'TODOS';

// Funciones para actualizar filtros
function filtrarCategoria(categoria, elementoBtn) {
    categoriaActual = categoria;
    paginaActual = 0; // Reiniciar a la primera página

    // Marcar botón activo visualmente
    if (elementoBtn) {
        document.querySelectorAll('.grupo-filtro:nth-child(2) .btn-filtro').forEach(b => b.classList.remove('active'));
        elementoBtn.classList.add('active');
    }

    cargarServicios(paginaActual);
}

function filtrarEstado(estado, elementoBtn) {
    estadoActual = estado;
    paginaActual = 0;

    // Marcar botón activo visualmente
    if (elementoBtn) {
        document.querySelectorAll('.grupo-filtro:nth-child(3) .btn-filtro').forEach(b => b.classList.remove('active'));
        elementoBtn.classList.add('active');
    }

    cargarServicios(paginaActual);
}

async function cargarServicios(pagina) {
    try {
        const url = `${API_URL}/paginado?page=${pagina}&size=${tamanoPagina}&categoria=${encodeURIComponent(categoriaActual)}&estado=${encodeURIComponent(estadoActual)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener servicios");

        const data = await response.json();
        console.log("Respuesta de la API:", data);

        paginaActual = data.number;

        // IMPORTANTE: Dibujar la tabla y la paginación con la nueva respuesta
        renderizarTabla(data.content);
        renderizarPaginacion(data);

    } catch (error) {
        console.error("Error al cargar servicios:", error);
    }
}