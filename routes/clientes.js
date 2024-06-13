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