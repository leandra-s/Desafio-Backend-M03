const { Pool} = require('pg')

const pool = new Pool({
    host: 'localhost',
    database: 'dindin',
    user: 'postgres',
    password: '1234',
    port: 5432
})

module.exports = pool