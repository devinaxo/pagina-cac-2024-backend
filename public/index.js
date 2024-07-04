document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('telefono').addEventListener("keypress", function(e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });

    fetch('/videojuegos')
        .then(res => res.json())
        .then(videojuegos => {
            const selectVideojuegos = document.getElementById('videojuego');
            videojuegos.forEach(videojuego => {
                let opcion = document.createElement('option');
                opcion.value = videojuego.id_videojuego;
                opcion.textContent = `${videojuego.titulo} (${videojuego.plataforma})`;
                selectVideojuegos.appendChild(opcion);
            });
        });

    const rentalDateInput = document.getElementById('fecha_alquiler');
    const returnDateInput = document.getElementById('fecha_retorno');
    
    const today = new Date().toISOString().split('T')[0];
    rentalDateInput.min = today;
    returnDateInput.min = today;
    
    rentalDateInput.addEventListener('input', () => {
        returnDateInput.min = rentalDateInput.value;
    });

    function checkClientExists(clientName) {
        return fetch(`/clientes?name=${encodeURIComponent(clientName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.id_cliente !== null) {
                    return data.id_cliente;
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                return null;
            });
    }

    document.getElementById('formularioRenta').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('cliente').value;
        const videogame = document.getElementById('videojuego').value;
        const initialD = rentalDateInput.value;
        const finalD = returnDateInput.value;

        if (initialD > finalD) {
            e.preventDefault();
            alert('Fecha de retorno debe ser después de fecha de alquiler.');
            return;
        }
        if (!name || !videogame || !rentalDateInput.value || !returnDateInput.value) {
            alert('Todos los campos son obligatorios.');
            return;
        }
        checkClientExists(name).then(clientId => {
            if (clientId !== null) {
                const formData = new FormData(e.target);
                formData.set('id_cliente', clientId); // Hacemos que id_cliente sea el valor de la bbdd
                const data = Object.fromEntries(formData.entries());

                // Procedemos con el alquiler
                fetch('/alquileres', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(result => {
                    alert('Se ha agregado el alquiler.');
                    e.target.reset();
                })
                .catch(err => {
                    console.error('Error: ' + err);
                    alert('Algo salió mal al agregar el alquiler...');
                });
            } else {
                alert('El cliente no está registrado.');
                e.target.reset();
            }
        });
    });

    document.getElementById('formularioCliente').addEventListener('submit', function(e) {
        e.preventDefault();
    
        const nombreInput = document.getElementById('nombre').value;
        const emailInput = document.getElementById('email').value;
        const telefonoInput = document.getElementById('telefono').value;
    
        // Validación básica
        if (!nombreInput || !emailInput || !telefonoInput) {
            alert('Por favor complete todos los campos.');
            return;
        }
    
        // Mandar POST para registrar nuevo cliente
        fetch('/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nombre": nombreInput,
                "email": emailInput,
                "telefono": telefonoInput
            })
        })
        .then(async res => {
            if (res.ok) {
                return res.json();
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || 'No se pudo registrar el cliente.');
            }
        })
        .then(data => {
            alert('Cliente registrado exitosamente.');
            e.target.reset();
        })
        .catch(err => {
            console.error('Error:', err.message);
            alert(`No se pudo registrar el cliente. Error: ${err.message}`);
        });
    });
});
