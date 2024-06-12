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
//Página de clientes
app.get('/' + pages[1], (req, res) => {
    let sql = 'SELECT * FROM ' + pages[1];
    conn.query(sql, (err, results) => {
        if(err){
            console.log('Failed querying or smth');
            res.status(404).json({'query': sql, 'err': err});
            return;
        }
        res.json(results);
    })
})
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