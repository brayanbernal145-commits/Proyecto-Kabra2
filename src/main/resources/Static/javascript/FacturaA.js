
console.log("FacturaA.js FUNCIONANDO");

const API_URL = "http://localhost:8080/api/factura";

const urlParams = new URLSearchParams(window.location.search);
const facturaId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {

    if (!facturaId) {
        alert("No se seleccionó ninguna factura para editar.");
        window.location.href = "/facturas";
        return;
    }

    await cargarDatosFactura(facturaId);

    const formFactura = document.getElementById("editarFacturaForm");

    if (formFactura) {
        formFactura.addEventListener("submit", actualizarFactura);
    }
});


async function cargarDatosFactura(id) {

    try {
        const response = await fetch(`${API_URL}/${id}`);

if (!response.ok) {
    throw new Error("No se pudo obtener la factura.");
}

const factura = await response.json();

console.log("Factura seleccionada:", factura);

document.getElementById("numFactura").value =
    factura.numFactura || "";

document.getElementById("idCitaFK").value =
    factura.idCitaFK || "";

document.getElementById("fechaEmision").value =
    convertirFechaParaInput(factura.fechaEmision);

document.getElementById("total").value =
    factura.total ?? 0;

document.getElementById("iva").value =
    factura.iva ?? 0;

document.getElementById("estadoFactura").value =
    factura.estadoFactura || "Pendiente";

document.getElementById("metodoPago").value =
    factura.metodoPago || "Efectivo";

document.getElementById("observaciones").value =
    factura.observaciones || "";

} catch (error) {

    console.error("Error al cargar la factura:", error);

    alert("No se pudieron cargar los datos de la factura.");
}
}


async function actualizarFactura(event) {

    event.preventDefault();

    const facturaData = {
        numFactura: Number(facturaId),

        idCitaFK: Number(
            document.getElementById("idCitaFK").value
        ),

        fechaEmision:
        document.getElementById("fechaEmision").value,

        total:
            Number(document.getElementById("total").value),

        iva:
            Number(document.getElementById("iva").value),

        estadoFactura:
        document.getElementById("estadoFactura").value,

        metodoPago:
        document.getElementById("metodoPago").value,

        observaciones:
            document.getElementById("observaciones").value.trim()
    };

    console.log("Actualizando factura:", facturaData);

    try {

        const response = await fetch(`${API_URL}/${facturaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(facturaData)
        });

        if (response.ok) {

            alert("¡Factura actualizada con éxito!");

            window.location.href = "/facturas";

        } else {

            const errorMsg = await response.text();

            alert(
                "No se pudo actualizar la factura: " + errorMsg
            );
        }

    } catch (error) {

        console.error("Error en la petición PUT:", error);

        alert("Error de conexión al actualizar la factura.");
    }
}


function convertirFechaParaInput(fecha) {

    if (!fecha) {
        return "";
    }

    // Si Spring devuelve algo como:
    // 2026-09-15T14:30:00
    // el input datetime-local necesita:
    // 2026-09-15T14:30

    return fecha.toString().substring(0, 16);
}
