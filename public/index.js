document.addEventListener('DOMContentLoaded', function(){
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

    document.getElementById('formularioRenta').addEventListener('submit', function(e){
        e.preventDefault();
        if (rentalDateInput.value > returnDateInput.value) {
            e.preventDefault();
            alert('Fecha de retorno debe ser después de fecha de alquiler.');
            return;
        }
        const clientNameInput = document.getElementById('cliente').value;
        checkClientExists(clientNameInput).then(clientId => {
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
})})