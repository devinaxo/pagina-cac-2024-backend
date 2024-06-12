const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mysql = require('mysql');
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
conn.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Connected to AlwaysData');
})

//Página de hub
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

//Test de JSON
app.get('/test', (req, res) => {
    const getItems = fs.readFileSync(__dirname + '/public/test.json');
    res.send(JSON.parse(getItems));
})

let pages = ['alquileres', 'clientes', 'videojuegos'];

//Página de alquileres
app.get('/' + pages[0], (req, res) => {
    let sql = 'SELECT * FROM ' + pages[0];
    conn.query(sql, (err, results) => {
        if(err){
            console.log('Failed querying or smth');
            res.status(404).json({'query': sql, 'err': err});
            return;
        }
        res.json(results);
    })
})
//Páginas de clientes
app.get('/' + pages[1], (req, res) => {
    const nombreCliente = decodeURIComponent(req.query.name);
    if (nombreCliente != 'undefined') {
        const query = 'SELECT id_cliente FROM clientes WHERE nombre = ?';
        conn.query(query, [nombreCliente], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ error: 'Error interno' });
            return;
        }
        if (results.length > 0) {
            res.json({ id_cliente: results[0].id_cliente });
        } else {
            res.status(404).json({ error: 'El cliente no está registrado' });
        }
    });
    } else {
        let sql = 'SELECT * FROM ' + pages[1];
        conn.query(sql, (err, results) => {
            if (err) {
                console.log('Failed querying or smth');
                res.status(404).json({ 'query': sql, 'err': err });
                return;
            }
            res.json(results);
        });
    }
});
//POST para registrar nuevo cliente
app.post('/clientes', (req, res) => {
    const { nombre, email, telefono } = req.body;

    // Veo si el mail o el teléfono ya están registrados
    const checkQuery = 'SELECT * FROM clientes WHERE email = ? OR telefono = ?';
    conn.query(checkQuery, [email, telefono], (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ error: 'Error interno' });
            return;
        }
        
        if (results.length > 0) {
            res.status(400).json({ error: 'El cliente ya está registrado' });
        } else {
            // Insertar el nuevo cliente a la tabla
            const insertQuery = 'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)';
            conn.query(insertQuery, [nombre, email, telefono], (err, results) => {
                if (err) {
                    console.error('Error inserting into database:', err);
                    res.status(500).json({ error: 'Error interno' });
                    return;
                }
                res.status(201).json({ message: 'Cliente registrado exitosamente' });
            });
        }
    });
});
//Página de videojuegos
app.get('/' + pages[2], (req, res) => {
    let sql = 'SELECT * FROM ' + pages[2];
    conn.query(sql, (err, results) => {
        if(err){
            console.log('Failed querying or smth');
            res.status(404).json({'query': sql, 'err': err});
            return;
        }
        res.json(results);
    })
})

//Método post para agregar un alquiler
app.post('/' + pages[0], (req, res) => {
    const {
        id_cliente,
        id_videojuego,
        fecha_alquiler,
        fecha_retorno
    } = req.body;

    if(id_cliente == null || id_videojuego == null || fecha_alquiler == null || fecha_retorno == null){
        res.status(500).json({error: 'Error interno'});
        return;
    }

    const query = 'INSERT INTO alquileres (id_cliente, id_videojuego, fecha_alquiler, fecha_retorno) VALUES (?, ?, ?, ?)';
    const valores = [id_cliente, id_videojuego, fecha_alquiler, fecha_retorno];

    conn.query(query, valores, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            res.status(500).json({error: 'Error interno'});
            return;
        }
        res.status(201).json({mensaje: 'Alquiler agregado exitosamente'});
    });
});

app.listen(3000, () => {
    console.log('Works');
})