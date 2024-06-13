const conn = require('../db/db');

exports.getAll = function(req, res) {
    let sql = 'SELECT * FROM alquileres';
    conn.query(sql, (err, results) => {
        if(err){
            console.log('Failed querying or smth');
            res.status(404).json({'query': sql, 'err': err});
            return;
        }
        res.json(results);
    })
}

exports.addAlquiler = function(req, res) {
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
}