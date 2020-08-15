const jwt = require('jsonwebtoken');
const config = require('./../../config');

const auth = (req, res, next) => {
    const token = req.headers['x-access-token'];
    let decoded;    
    try{
        decoded = jwt.verify(token, config.tokenKey);
        req._id = decoded._id;
    }catch(error){
        decoded = false;
    }
    !!decoded ? 
        next()
    :
        res.status(500).send('Usuario no autorizado')    
};

module.exports = auth;