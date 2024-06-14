const conn = require('../db/db');

exports.getAll = function(req, res) {
    let sql = 'SELECT * FROM videojuegos';
    conn.query(sql, (err, results) => {
        if(err){
            console.log('Failed querying or smth');
            res.status(404).json({'query': sql, 'err': err});
            return;
        }
        res.json(results);
    })
}
exports.addVideojuego = function(req, res) {
    const {
        titulo,
        genero,
        plataforma,
        year
    } = req.body;

    if(titulo == null || genero == null || plataforma == null || year == null){
        return res.status(500).json({error: 'Uno de los valores ingresados es nulo.'});
    }

    const query = 'INSERT INTO videojuegos (titulo, genero, plataforma, year) VALUES (?, ?, ?, ?)';
    const valores = [titulo, genero, plataforma, year];

    conn.query(query, valores, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            return res.status(500).json({error: 'Error interno.'});
        }
        res.status(201).json({mensaje: 'Videojuego agregado exitosamente.'});
    });
}

exports.modifyVideojuego = function(req, res) {
    const {
        titulo,
        genero,
        plataforma,
        year
    } = req.body;

    if (titulo === undefined && genero === undefined && plataforma === undefined && year === undefined) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    const id = req.params.id;
    let query = 'SELECT * FROM videojuegos WHERE id_videojuego = ?';
    conn.query(query, id, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            return res.status(500).json({error: 'Error interno.'});
        }
        if(results.length == 0){
            return res.status(404).json({error: 'No se encontró el videojuego con el ID especificado.'});
        }else{

            let updSQL = [];
            let valores = [];

            if (titulo !== undefined) {
                updSQL.push('titulo = ?');
                valores.push(titulo);
            }
            if (genero !== undefined) {
                updSQL.push('genero = ?');
                valores.push(genero);
            }
            if (plataforma !== undefined) {
                updSQL.push('plataforma = ?');
                valores.push(plataforma);
            }
            if (year !== undefined) {
                updSQL.push('year = ?');
                valores.push(year);
            }

            const query = `UPDATE videojuegos SET ${updSQL.join(', ')} WHERE id_videojuego = ?`;
            valores.push(id);

            conn.query(query, valores, (updErr, updResults) => {
                if(updErr){
                    console.error('Error ejecutando query: ', err);
                    return res.status(500).json({error: 'Error interno.'});
                }
                res.status(201).json({mensaje: 'Videojuego actualizado exitosamente.'});
            })
        }
    });
}

//Si borramos un videojuego, debemos borrar los alquileres relacionados a ese videojuego
exports.deleteVideojuego = function(req, res) {
    const id = req.params.id;

    //Lo realizamos en una transacción para poder volver los cambios si algo sale mal
    conn.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno al iniciar la transacción.' });
        }
        let query = 'DELETE FROM alquileres WHERE id_videojuego = ?';
        conn.query(query, id, (err, results) => {
            if (err) {
                return conn.rollback(() => {
                    res.status(500).json({ error: 'Error interno al borrar alquileres.' });
                });
            }
            query = 'DELETE FROM videojuegos WHERE id_videojuego = ?';
            conn.query(query, id, (err, results) => {
                if (err) {
                    return conn.rollback(() => {
                        res.status(500).json({ error: 'Error interno.' });
                    });
                }
                if (results.affectedRows == 0) {
                    return conn.rollback(() => {
                        res.status(404).json({ error: 'No se encontró el videojuego con el ID especificado.' });
                    });
                }
                conn.commit((err) => {
                    if (err) {
                        return conn.rollback(() => {
                            res.status(500).json({ error: 'Error interno al confirmar la transacción.' });
                        });
                    }
                    res.status(200).json({ mensaje: 'Videojuego y alquileres asociados borrados exitosamente.' });
                });
            });
        });
    });
}