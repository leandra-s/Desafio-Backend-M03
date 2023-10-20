const jwt = require('jsonwebtoken')
const senhaJWT = require('../senhaJWT')

const autenticacaoToken = async (req, res, next) => {
    const {authorization} = req.headers

    try {
        if(!authorization){
            return res.status(401).json({ "mensagem": "Não autorizado" })
        }
    
        const token = authorization.split(' ')[1]

        const { id } = jwt.verify(token, senhaJWT)

        req.usuario_id = id
        
        next()
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

module.exports = autenticacaoToken