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
const API_INSUMOS = "http://localhost:8080/api/insumos";

document.addEventListener("DOMContentLoaded", () => {
    cargarResumenInsumos();
});

async function cargarResumenInsumos() {
    try {
        const response = await fetch(API_INSUMOS);
        if (!response.ok) throw new Error("Error al obtener los insumos");

        const insumos = await response.json();

        // 1. Filtrar los disponibles y con stock bajo
        const disponibles = insumos.filter(i => i.stockActual > 0);
        const stockBajo = insumos.filter(i => i.stockActual <= (i.stockMinPosible || 2));

        // 2. Renderizar KPIs (Recuadro Rojo)
        document.getElementById("kpiTotalDisponibles").textContent = disponibles.length;
        document.getElementById("kpiStockBajo").textContent = stockBajo.length;

        // 3. Renderizar Alertas (Recuadro Amarillo)
        const contenedorAlertas = document.getElementById("listaAlertasStock");
        contenedorAlertas.innerHTML = "";

        if (stockBajo.length === 0) {
            contenedorAlertas.innerHTML = `<p class="texto-ok"><i class='bx bx-check-circle'></i> Todo el stock está en niveles óptimos.</p>`;
            return;
        }

        stockBajo.forEach(insumo => {
            const item = document.createElement("div");
            item.className = "item-alerta";
            item.innerHTML = `
                <i class='bx bx-calendar-exclamation'></i>
                <div>
                    <strong>${insumo.nombreInsumo}</strong>
                    <span>Quedan ${insumo.stockActual} unidades (Mín: ${insumo.stockMinPosible ?? 2})</span>
                </div>
            `;
            contenedorAlertas.appendChild(item);
        });

    } catch (error) {
        console.error("Error al cargar datos del perfil:", error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos almacenados en localStorage tras el login
    const usuarioData = localStorage.getItem('usuarioSesion');

    if (!usuarioData) {
        // Redirigir al login si no hay sesión activa
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioData);

    // Inyectar datos en el HTML
    document.getElementById('user-perfil').textContent = usuario.perfil || 'Usuario';
    document.getElementById('user-email').textContent = usuario.email || '';
    document.getElementById('nombreHeader').textContent = usuario.nombreCompleto || '';

    document.getElementById('valNombre').textContent = usuario.nombreCompleto || '';
    document.getElementById('valTipoDoc').textContent = usuario.tipoDocumento || '';
    document.getElementById('valNumDoc').textContent = usuario.numDocumento || '';
    document.getElementById('valTelefono').textContent = usuario.telefono || '';
    document.getElementById('valEmail').textContent = usuario.email || '';
    document.getElementById('valDireccion').textContent = usuario.direccion || '';
    document.getElementById('valGenero').textContent = usuario.genero || '';
    document.getElementById('valEstado').textContent = usuario.estado || '';

    // Manejar el cierre de sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioSesion');
        window.location.href = 'login.html';
    });
});