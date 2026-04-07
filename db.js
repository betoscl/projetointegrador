const mysql = require('mysql2');

// Crio a conexão com o banco
const connection = mysql.createConnection({
    host: 'localhost',
    //host: 'insupport.com.br',
    user: 'root',
    //user: 'albe0624_agendamentos',
    password: 'MySQL@bd', 
    //database: 'albe0624_sus_agendamentos'
    database: 'sus_agendamentos'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');
});

module.exports = connection;