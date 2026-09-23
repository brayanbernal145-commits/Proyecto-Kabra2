const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const menusitemsStactic = document.querySelectorAll('.menu-item-static');
const sidebarBtn = document.getElementById('sidebar-btn');

sidebarBtn?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-hidden');
});

menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('minimize');
});

menusItemsDropDown.forEach((menuItem) => {
    menuItem.addEventListener('click', (e) => {
        // Previene la navegación en enlaces "#"
        if (e.target.closest('.menu-link')) {
            e.preventDefault();
        }

        const subMenu = menuItem.querySelector('.sub-menu');
        const isActive = menuItem.classList.toggle('sub-menu-toggle');

        if (subMenu) {
            if (isActive) {
                subMenu.style.height = `${subMenu.scrollHeight + 20}px`;
                subMenu.style.padding = '0.2rem 0';
            } else {
                subMenu.style.height = '0';
                subMenu.style.padding = '0';
            }
        }

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
    });
});

menusitemsStactic.forEach((menuItem) => {
    menuItem.addEventListener('mouseenter', () => {
        if (!sidebar.classList.contains('minimize')) return;

        menusItemsDropDown.forEach((item) => {
            const otherSubmenu = item.querySelector('.sub-menu');
            if (otherSubmenu) {
                item.classList.remove('sub-menu-toggle');
                otherSubmenu.style.height = "0";
                otherSubmenu.style.padding = "0";
            }
        });
    });
});

function checkWindowsSize() {
    sidebar.classList.remove('minimize');
}
checkWindowsSize();
window.addEventListener('resize', checkWindowsSize);

/* API Y PAGINACIÓN */
const API_URL = "http://localhost:8080/api/usuarios";
let paginaActual = 0;
const tamanoPagina = 6;

document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios(paginaActual);
});

async function cargarUsuarios(pagina) {
    try {
        const response = await fetch(`${API_URL}/paginado?page=${pagina}&size=${tamanoPagina}`);
        if (!response.ok) throw new Error("Error al obtener usuarios");

        const data = await response.json();
        paginaActual = data.number; // Sincroniza el número de página actual
        renderizarTabla(data.content);
        renderizarPaginacion(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderizarTabla(usuarios) {
    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="sin-datos">No hay usuarios registrados.</td></tr>`;
        return;
    }

    usuarios.forEach(usuario => {
        const estadoClase = (usuario.estado && usuario.estado.toLowerCase() === 'activo') ? 'activo' : 'inactivo';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${usuario.nombreCompleto || 'Sin nombre'}</td>
            <td>${usuario.tipoDocumento || '-'}</td>
            <td>${usuario.numDocumento || '-'}</td>
            <td>${usuario.genero || '-'}</td>
            <td>${usuario.direccion || '-'}</td>
            <td>${usuario.email || '-'}</td>
            <td>${usuario.telefono || '-'}</td>
            <td>${usuario.cargo || '-'}</td>
            <td><span class="estado ${estadoClase}">${usuario.estado || 'Inactivo'}</span></td>
            <td>
                <div class="acciones">
                    <a class="btn-accion editar" href="ActualizarU.html?id=${usuario.idUsuario}" title="Actualizar">
                        <i class='bx bx-edit'></i>
                    </a>
                    <button class="btn-accion eliminar" onclick="eliminarUsuario(${usuario.idUsuario})" title="Inactivar Usuario">
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

    infoRegistros.textContent = `Mostrando ${data.numberOfElements} de ${data.totalElements} usuarios`;
    infoPagina.textContent = `Página ${data.number + 1} de ${data.totalPages || 1}`;

    paginacionContainer.innerHTML = "";

    const btnAnt = document.createElement("button");
    btnAnt.className = "btn-pag";
    btnAnt.textContent = "Anterior";
    btnAnt.disabled = data.first;
    btnAnt.onclick = () => cargarUsuarios(data.number - 1);
    paginacionContainer.appendChild(btnAnt);

    for (let i = 0; i < data.totalPages; i++) {
        const btnPage = document.createElement("button");
        btnPage.className = `btn-pag ${i === data.number ? 'actual' : ''}`;
        btnPage.textContent = i + 1;
        btnPage.onclick = () => cargarUsuarios(i);
        paginacionContainer.appendChild(btnPage);
    }

    const btnSig = document.createElement("button");
    btnSig.className = "btn-pag";
    btnSig.textContent = "Siguiente";
    btnSig.disabled = data.last;
    btnSig.onclick = () => cargarUsuarios(data.number + 1);
    paginacionContainer.appendChild(btnSig);
}

async function eliminarUsuario(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) {
                alert("Usuario eliminado con éxito");
                cargarUsuarios(paginaActual);
            } else {
                alert("No se pudo eliminar el usuario");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}