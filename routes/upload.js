var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs'); // FileSystem para poder borrar imagenes en el path

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// middleware
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó archivo',
            errors: { message: 'Debe seleccionar un archivo' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones admitidas
    var extensionesValidas = ['jpg', 'png', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Extensiones validas: ' + extensionesValidas.join(',') }
        });
    }

    // Nombre del archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al subir archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // });
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe imagen en el path la elimina
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, err => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen',
                            errors: { message: err }
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;
            // actualizo el usuario que me retorna findById en la base de datos
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = null;

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    } else if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe imagen en el path la elimina
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, err => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen',
                            errors: { message: err }
                        });
                    }
                });
            }

            medico.img = nombreArchivo;
            // actualizo el medico que me retorna findById en la base de datos
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    } else if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe imagen en el path la elimina
            if (fs.existsSync(pathViejo)) {

                fs.unlink(pathViejo, err => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al borrar imagen',
                            errors: { message: err }
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;
            // actualizo el hospital que me retorna findById en la base de datos
            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;