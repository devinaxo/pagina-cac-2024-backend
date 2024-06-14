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
        return res.status(500).json({error: 'Uno de los valores ingresados es nulo.'});
    }

    const query = 'INSERT INTO alquileres (id_cliente, id_videojuego, fecha_alquiler, fecha_retorno) VALUES (?, ?, ?, ?)';
    const valores = [id_cliente, id_videojuego, fecha_alquiler, fecha_retorno];

    conn.query(query, valores, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            res.status(500).json({error: 'Error interno.'});
            return;
        }
        res.status(201).json({mensaje: 'Alquiler agregado exitosamente.'});
    });
}

exports.modifyAlquiler = function(req, res) {
    const {
        id_cliente,
        id_videojuego,
        fecha_alquiler,
        fecha_retorno
    } = req.body;

    if (id_cliente === undefined && id_videojuego === undefined && fecha_alquiler === undefined && fecha_retorno === undefined) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    const id = req.params.id;
    let query = 'SELECT * FROM alquileres WHERE id_alquiler = ?';
    conn.query(query, id, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            return res.status(500).json({error: 'Error interno.'});
        }
        if(results.length == 0){
            return res.status(404).json({error: 'No se encontró el alquiler con el ID especificado.'});
        } else {
            let updSQL = [];
            let valores = [];

            if (id_cliente !== undefined) {
                updSQL.push('id_cliente = ?');
                valores.push(id_cliente);
            }
            if (id_videojuego !== undefined) {
                updSQL.push('id_videojuego = ?');
                valores.push(id_videojuego);
            }
            if (fecha_alquiler !== undefined) {
                updSQL.push('fecha_alquiler = ?');
                valores.push(fecha_alquiler);
            }
            if (fecha_retorno !== undefined) {
                updSQL.push('fecha_retorno = ?');
                valores.push(fecha_retorno);
            }

            const query = `UPDATE alquileres SET ${updSQL.join(', ')} WHERE id_alquiler = ?`;
            valores.push(id);

            conn.query(query, valores, (updErr, updResults) => {
                if(updErr){
                    console.error('Error ejecutando query: ', updErr);
                    return res.status(500).json({error: 'Error interno.'});
                }
                res.status(201).json({mensaje: 'Alquiler actualizado exitosamente.'});
            });
        }
    });
}

exports.deleteAlquiler = function(req, res) {
    const id = req.params.id;
    const query = 'DELETE FROM alquileres WHERE id_alquiler = ?';

    conn.query(query, id, (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error interno.'});
        }
        if(results.affectedRows == 0){
            return res.status(404).json({ error: 'No se encontró el alquiler con el ID especificado.' });
        }
        res.status(200).json({mensaje: 'Alquiler borrado exitosamente.'});
    });
}