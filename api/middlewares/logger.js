const logger = (req, res, next)=>{
    console.log(`${Date.now()} ${req.method} ${req.path}`);
    next();
}
module.exports = logger;