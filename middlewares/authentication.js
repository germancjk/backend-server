var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ===============================
// Verificar Token (Colocandolo en este punto, lo que hay hacia abajo NO va a funcionar si el token es incorrecto)
// ===============================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        // retorno los datos y se puede utilizar en cualquier método que llame a verificaToken
        req.usuario = decoded.usuario;

        // habilita a seguir adelante
        next();
    });
}