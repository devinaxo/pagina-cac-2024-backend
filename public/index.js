document.addEventListener('DOMContentLoaded', function(){
    fetch('/clientes')
        .then(res => res.json())
        .then(clientes => {
            const selectClientes = document.getElementById('cliente');
            clientes.forEach(cliente => {
                let opcion = document.createElement('option');
                opcion.value = cliente.id_cliente;
                opcion.textContent = cliente.nombre;
                selectClientes.appendChild(opcion);
            });
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
    
    rentalDateInput.addEventListener('input', () => {
        returnDateInput.min = rentalDateInput.value;
    });

    document.getElementById('formularioRenta').addEventListener('submit', function(e){
        e.preventDefault();

        if (rentalDateInput.value > returnDateInput.value) {
            e.preventDefault();
            alert('Fecha de retorno debe ser después de fecha de alquiler.');
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

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
            alert('Algo salió mal...');
        })
    })
})