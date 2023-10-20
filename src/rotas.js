const express = require('express')
const autenticacaoToken = require('./intermediario/autenticacao')
const { login, cadastrarUsuario, detalharUsuario, atualizarUsuario } = require('./controladores/usuario')
const { detalharTransacao, obterExtrato, cadastrarTransacao, atualizarTransacao, deletarTransacao, listarCategorias, listarTransacoes } = require('./controladores/categoria_transacoes')

const rotas = express()



rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login)

rotas.use(autenticacaoToken)

rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', atualizarUsuario)
rotas.get('/categoria', listarCategorias)
rotas.get('/transacao', listarTransacoes)
rotas.get('/transacao/extrato', obterExtrato)
rotas.get('/transacao/:id', detalharTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', atualizarTransacao)
rotas.delete('/transacao/:id', deletarTransacao)

module.exports = rotas