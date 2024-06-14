const conn = require('../db/db');

exports.getClientes = function(req, res) {
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
        let sql = 'SELECT * FROM clientes';
        conn.query(sql, (err, results) => {
            if (err) {
                console.log('Failed querying or smth');
                res.status(404).json({ 'query': sql, 'err': err });
                return;
            }
            res.json(results);
        });
    }
}

exports.addCliente = function(req, res) {
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
}

exports.modifyCliente = function(req, res){
    const {
        nombre,
        email,
        telefono
    } = req.body;

    if (nombre === undefined && email === undefined && telefono === undefined) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    const id = req.params.id;
    let query = 'SELECT * FROM clientes WHERE id_cliente = ?';
    conn.query(query, id, (err, results) => {
        if(err){
            console.error('Error ejecutando query: ', err);
            return res.status(500).json({error: 'Error interno.'});
        }
        if(results.length == 0){
            return res.status(404).json({error: 'No se encontró el cliente con el ID especificado.'});
        }else{

            let updSQL = [];
            let valores = [];

            if (nombre !== undefined) {
                updSQL.push('nombre = ?');
                valores.push(nombre);
            }
            if (email !== undefined) {
                updSQL.push('email = ?');
                valores.push(email);
            }
            if (telefono !== undefined) {
                updSQL.push('telefono = ?');
                valores.push(telefono);
            }

            const query = `UPDATE clientes SET ${updSQL.join(', ')} WHERE id_cliente = ?`;
            valores.push(id);

            conn.query(query, valores, (updErr, updResults) => {
                if(updErr){
                    console.error('Error ejecutando query: ', err);
                    return res.status(500).json({error: 'Error interno.'});
                }
                res.status(201).json({mensaje: 'Cliente actualizado exitosamente.'});
            })
        }
    });
}

//Si borramos un cliente, debemos borrar los alquileres relacionados a ese cliente
exports.deleteCliente = function(req, res) {
    const id = req.params.id;

    //Lo realizamos en una transacción para poder volver los cambios si algo sale mal
    conn.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno al iniciar la transacción.' });
        }
        let query = 'DELETE FROM alquileres WHERE id_cliente = ?';
        conn.query(query, id, (err, results) => {
            if (err) {
                return conn.rollback(() => {
                    res.status(500).json({ error: 'Error interno al borrar alquileres.' });
                });
            }
            query = 'DELETE FROM clientes WHERE id_cliente = ?';
            conn.query(query, id, (err, results) => {
                if (err) {
                    return conn.rollback(() => {
                        res.status(500).json({ error: 'Error interno.' });
                    });
                }
                if (results.affectedRows == 0) {
                    return conn.rollback(() => {
                        res.status(404).json({ error: 'No se encontró el cliente con el ID especificado.' });
                    });
                }
                conn.commit((err) => {
                    if (err) {
                        return conn.rollback(() => {
                            res.status(500).json({ error: 'Error interno al confirmar la transacción.' });
                        });
                    }
                    res.status(200).json({ mensaje: 'Cliente y alquileres asociados borrados exitosamente.' });
                });
            });
        });
    });
}