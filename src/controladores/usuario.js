const pool = require('../conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJWT = require('../senhaJWT')

const cadastrarUsuario = async (req, res) => {
    try {
        const {nome, email, senha} = req.body

        if(!email || !senha || !nome){
            return res.status(401).json({ "mensagem": "Campos obrigatórios."})
        }

        const encontrarEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        if(encontrarEmail.rows.length !== 0){
            return res.status(400).json({ "mensagem": "Já existe usuário cadastrado com o e-mail informado." })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 8)

        const inserirUsuario = await pool.query('INSERT INTO usuarios (nome, email, senha) values ($1, $2, $3)', [nome, email, senhaCriptografada])
        
        const {rows} = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        return res.status(201).json({
            id: rows[0].id,
            nome,
            email
        })

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}


const login = async (req, res) => {
    try {
        const {email, senha} = req.body

        if(!email || !senha){
            return res.status(401).json({ "mensagem": "Campos obrigatórios."})
        }

        const verificarEmail = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email])

        if(verificarEmail.rows.length === 0){
            return res.status(401).json({ "mensagem": "Usuário e/ou senha inválido(s)."})
        }

        const senhaValida = await bcrypt.compare(senha, verificarEmail.rows[0].senha)

        if(!senhaValida){
            return res.status(404).json({ "mensagem": "Usuário e/ou senha inválido(s)." })
        }

        const token = jwt.sign({id: verificarEmail.rows[0].id}, senhaJWT,{expiresIn: '8h'})

        const {senha: _, ...usuarioLogado} = verificarEmail.rows[0]

        return res.status(201).json({ usuario: usuarioLogado, token})

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const detalharUsuario = async (req, res) => {
    try {
        if(!req.usuario_id){
            return res.status(401).json({ "mensagem": "Para acessar este recurso um token de autenticação válido deve ser enviado."})
        }

        const selecionarIdUsuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario_id])

        if(selecionarIdUsuario.rows.length === 0){
            return res.status(404).json({ "mensagem": "Nenhuma conta encontrada."})
        }

        const {nome, email} = selecionarIdUsuario.rows[0]

        return res.status(200).json({
            id: req.usuario_id,
            nome,
            email
        })
        
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const atualizarUsuario = async (req, res) => {
    try {
        const {nome, email, senha} = req.body

        if(!nome || !email || !senha){
            return res.status(400).json({  "mensagem": "Todos os campos obrigatórios devem ser informados."})
        }

        const validandoEmailJaExistente = await pool.query('SELECT email FROM usuarios where email = $1 and id != $2;', [email, req.usuario_id])
        
        if(validandoEmailJaExistente.rows.length >= 1){
            return res.status(400).json({ "mensagem": "O e-mail informado já está sendo utilizado por outro usuário." })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 8)

        const inserindoAtualizacao = await pool.query('UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4', [nome, email, senhaCriptografada, req.usuario_id])

        return res.status(204).json()
    
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
}