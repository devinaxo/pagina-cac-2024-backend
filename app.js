const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('Works');
})

const alquileresRouter = require('./routes/alquileres');
const clientesRouter = require('./routes/clientes');
const videojuegosRouter = require('./routes/videojuegos');

//Página de hub
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

//Página de alquileres
app.get('/alquileres', alquileresRouter.getAll);
//POST para agregar un alquiler
app.post('/alquileres', alquileresRouter.addAlquiler);
//PUT para modificar un alquiler
app.put('/alquileres/:id', alquileresRouter.modifyAlquiler);
//DELETE para borrar un alquiler
app.delete('/alquileres/:id', alquileresRouter.deleteAlquiler);

//Páginas de clientes
app.get('/clientes', clientesRouter.getClientes);
//POST para registrar nuevo cliente
app.post('/clientes', clientesRouter.addCliente);
//PUT para modificar un cliente
app.put('/clientes/:id', clientesRouter.modifyCliente);
//DELETE para borrar un cliente
app.delete('/clientes/:id', clientesRouter.deleteCliente);

//Página de videojuegos
app.get('/videojuegos', videojuegosRouter.getAll);
//POST para agregar un nuevo videojuego
app.post('/videojuegos', videojuegosRouter.addVideojuego);
//PUT para modificar un videojuego
app.put('/videojuegos/:id', videojuegosRouter.modifyVideojuego);
//DELETE para borrar un videojuego
app.delete('/videojuegos/:id', videojuegosRouter.deleteVideojuego);