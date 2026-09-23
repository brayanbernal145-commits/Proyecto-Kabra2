const API_URL = "http://localhost:8080/api/usuarios";

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
            consultarUsuarios();
        } else {
            alert("Error al guardar el usuario");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor Spring Boot");
    }
}