const pool = require("../conexao")

const listarCategorias = async (req, res) => {
    try {
        const selecionarCategorias = await pool.query('SELECT * FROM categorias')

        if(selecionarCategorias.rows.length === 0){
            return res.status(404).json(selecionarCategorias.rows)
        }

        return res.status(200).json(selecionarCategorias.rows)

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const listarTransacoes = async (req, res) => {
    try {
        const {filtro} = req.query

        const filtroCategorias = []

        if (filtro && filtro.length > 0) {
            for (let i = 0; i < filtro.length; i++) {
              const { rows } = await pool.query(
                ` SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
                  FROM transacoes t
                  JOIN categorias c ON t.categoria_id = c.id
                  WHERE usuario_id = $1 AND c.descricao = $2`, [req.usuario_id, filtro[i]])
      
              for (let j = 0; j < rows.length; j++) {
                filtroCategorias.push(rows[j])
              }
            }
          } else {
            const { rows } = await pool.query(
                ` SELECT t.*, c.descricao as categoria_nome FROM transacoes t LEFT JOIN categorias c ON t.categoria_id = c.id
                  WHERE t.usuario_id = $1`, [req.usuario_id])
            return res.status(200).json(rows)
          }

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const detalharTransacao = async (req, res) => {
    try {
        const {id} = req.params

        const {rows} = await pool.query(`
        SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
        FROM transacoes t
        JOIN categorias c 
        ON t.categoria_id = c.id
        WHERE t.id = $1 and t.usuario_id = $2`, [id, req.usuario_id])

        if(rows.length === 0){
            return res.status(404).json({ "mensagem": "Transação não encontrada."})
        }

        return res.status(200).json(rows[0])
        
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const cadastrarTransacao = async (req, res) => {
    try {
        const {descricao, valor, categoria_id, tipo} = req.body

        if(!descricao || !valor || !categoria_id || !tipo){
            return res.status(404).json({  "mensagem": "Todos os campos obrigatórios devem ser informados."})
        }

        const categorias = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id])

        if(categorias.rows.length === 0){
            return res.status(404).json({ "mensagem": "Nenhuma categoria encontrada."})
        }

        if(tipo !== 'entrada' & tipo !== 'saida'){
            return res.status(400).json({ "mensagem": "Campo tipo deve receber apenas valores de entrada ou saida."})
        }

        const data = new Date()

        const inserirTransacao = await pool.query('INSERT INTO transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1, $2, $3, $4, $5, $6)', [descricao, valor, data, categoria_id, req.usuario_id, tipo])
       
        const {rows} = await pool.query(`
            SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
            FROM transacoes t
            JOIN categorias c 
            ON t.categoria_id = c.id
            WHERE t.id = (SELECT MAX(id) FROM transacoes) AND t.usuario_id = $1;`, [req.usuario_id])

        return res.status(201).json(rows[0])
        
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const atualizarTransacao = async (req, res) => {
    try {
        const {id} = req.params
        const {descricao, valor, categoria_id, tipo} = req.body
    
        if(!descricao || !valor || !categoria_id || !tipo){
            return res.status(400).json({  "mensagem": "Todos os campos obrigatórios devem ser informados."})
        }

        const validarTransacao = await pool.query('SELECT * FROM transacoes where id = $1 AND usuario_id = $2', [id, req.usuario_id])

        if(validarTransacao.rows.length === 0){
            return res.status(400).json({  "mensagem": "Nenhuma transação encontrada."})
        }

        const categorias = await pool.query('SELECT * FROM categorias WHERE id = $1', [categoria_id])//!

        if(categorias.rows.length === 0){
            return res.status(404).json({ "mensagem": "Nenhuma categoria encontrada."})
        }

        if(tipo !== 'entrada' & tipo !== 'saida'){
            return res.status(400).json({ "mensagem": "Campo tipo deve receber apenas valores de entrada ou saida."})
        }

        const data = new Date()

        const atualizarTransacao = await pool.query('UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6;', [descricao, valor, data, categoria_id, tipo, id])
        
        return res.status(204).json()
        
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }

}

const deletarTransacao = async (req, res) => {
    try {
        const {id} = req.params

        const {rows} = await pool.query(`
        SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
        FROM transacoes t
        JOIN categorias c 
        ON t.categoria_id = c.id
        WHERE t.id = $1 and t.usuario_id = $2`, [id, req.usuario_id])

        if(rows.length === 0){
            return res.status(404).json({ "mensagem": "Transação não encontrada."})
        }
        
        const deletarTransacao = await pool.query('DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2', [rows[0].id, req.usuario_id])

        return res.status(204).json()

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

const obterExtrato = async (req, res) => {
    try {
        const transacoesEntrada = await pool.query('SELECT SUM(valor) FROM transacoes WHERE usuario_id = $1 and tipo = $2', [req.usuario_id, 'entrada'])
        
        if(transacoesEntrada.rows[0].sum === null){
            return res.status(404).json({entrada: 0})
        }

        const transacoesSaida = await pool.query('SELECT SUM(valor) FROM transacoes WHERE usuario_id = $1 and tipo = $2', [req.usuario_id, 'saida'])

        if(transacoesSaida.rows[0].sum === null){
            return res.status(404).json({
                entrada: Number(transacoesEntrada.rows[0].sum),
                saida: 0})
        }

        return res.status(200).json({
            entrada: Number(transacoesEntrada.rows[0].sum),
            saida: Number(transacoesSaida.rows[0].sum)
        })
        
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro do servidor."})
    }
}

module.exports = {
    listarCategorias,
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    obterExtrato
}