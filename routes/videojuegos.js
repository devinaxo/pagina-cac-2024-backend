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