var express = require('express');

var app = express();

var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/authentication');

// ===============================
// Obtener Medicos
// ===============================
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde) ||  0;

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargar usuarios',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// ===============================
// Crear Medicos
// ===============================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // recibe en json los datos del form usando parsebody
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

// ===============================
// Actualizar Medicos
// ===============================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico con ID ' + id + ' no encontrado',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        medico.nombre = body.nombre,
            medico.usuario = req.usuario._id,
            medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ===============================
//   Eliminar Médico
// ===============================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400), json({
                ok: false,
                mensaje: 'No existe ningún médico con ese id',
                errors: { message: 'No existe ningún médico con ese id' }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;