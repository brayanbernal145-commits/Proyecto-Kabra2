document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();
    const numDocumento = document.getElementById('numDocumento').value.trim();
    const contrasenia = document.getElementById('contrasenia').value;

    // Validar campos
    if (!numDocumento || !contrasenia) {
        alert('Por favor, completa todos los campos.');

        return;
    }
    try {
        const response = await fetch('/api/usuarios/login', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({

                numDocumento: parseInt(numDocumento, 10),
                contrasenia: contrasenia

            })

        });
        if (response.ok) {
            // Recibimos el usuario
            const usuario = await response.json();
            // Guardamos el usuario
            localStorage.setItem(
                'usuarioSesion',
                JSON.stringify(usuario)
            );

            // MOSTRAR EL USUARIO EN LA CONSOLA
            console.log(usuario);
            // REDIRECCIONAR SEGÚN EL ID
            if (usuario.idRolFK === 1) {
                window.location.href = '/Admin';
            } else if (usuario.idRolFK === 2) {
                window.location.href = '/Empleado';
            } else if (usuario.idRolFK === 3) {
                window.location.href = '/Cliente';
            } else {
                alert('No se encontró un tipo de usuario válido.');
            }
        } else {
            const errorMsg = await response.text();
            alert(
                'Error de inicio de sesión: ' +
                (errorMsg || 'Credenciales incorrectas')
            );
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert(
            'No se pudo conectar con el servidor.'
        );
    }
});