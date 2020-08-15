const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('./../../models/users');
const config = require('./../../../config');
const auth = require('./../../middlewares/auth');

router.route('/')
    .get(auth, (req, res)=>{
        User.find({})
        .then(users=>{
            res.status(200).send(users);
        })
    })
    .post((req, res)=>{
        const password = req.body.password;
        const salt = bcrypt.genSaltSync(parseInt(config.saltRounds));
        const hash = bcrypt.hashSync(password, salt);

        const user = {
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hash
        };

        User.find({ $or: [{username: user.username}, {email: user.email} ]})
        .then(users=>{
            if(users.length>0){
                res.status(500).send({message: 'Ya existe un usuario con el mismo correo o el mismo nombre del usuario'});
            }else{

                const object = new User(user);
                object.save()
                .then(()=>{
                    res.status(200).send({message: 'El usuario ha sido creado'});
                });
            }    
        });

        
    })
    .put(auth, (req, res)=>{

        res.status(200);
    })
    .delete(auth, (req, res)=>{
        User.remove({})
        .then(()=>{
            res.status(200).send({message: 'Todos los usuarios han sido eliminados'});
        });
    });

    router.route('/info')
    .get(auth, (req, res)=>{
        const user = req._id;
        User.find({_id: user}, ["username", "name", "email"])
        .then(users=>{
            res.status(200).send(users[0]);
        })
    });

    router.route('/:id')
        .get(auth, (req, res)=>{
            const id = req.params.id;
            User.find({_id: id})
            .then(user=>{
                res.status(200).send(user);
            })
            .catch(err=>{
                res.status(400).send({message: 'No existe el usuario'});
            })
        })
        .delete(auth, (req, res)=>{
            const id = req.params.id;
            User.remove({_id: id})
            .then(()=>{
                res.status(200).send({message: `El usuario con id: ${id} ha sido eliminado`});
            });
        });


    router.route('/login')
    .post((req, res)=>{
        const user = {
            username: req.body.username,
            password: req.body.password
        };
        User.find({username: user.username})
        .then(users=>{
            if (bcrypt.compareSync(user.password, users[0].password)){
                const token = jwt.sign({_id: users[0]._id}, config.tokenKey);
                const name = users[0].name;
                const id = users[0]._id;
                const username = users[0].username;
                res.status(200).send(JSON.stringify({name, token, id, username}));
            }else{
                res.status(500).send({message: 'Contraseña inválida'});
            }
        })
        .catch(err=>{
            res.status(500).send({message: 'Nombre de usuario inválido'});
        })
    });

module.exports = router;