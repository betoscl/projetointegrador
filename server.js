const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json()); // Para ler JSON enviado pelo fetch
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota da Tela de Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROTA Dashboard para ir após o login com sucesso
app.get('/dashboard', (req, res) => {
    res.send('<h1>Bem-vindo ao Sistema SUS</h1><p>Você está logado.</p><a href="/">Sair</a>');
});

// ROTA Login
app.post('/login', (req, res) => {
    const { email, senha, tipo } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (results.length === 0) {
            // Respondemos JSON com sucesso: false
            return res.json({ success: false, message: 'E-mail não encontrado.' });
        }

        const usuario = results[0];

        if (usuario.tipo_usuario !== tipo) {
             return res.json({ success: false, message: 'Perfil incorreto selecionado.' });
        }

        bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
            if (isMatch) {
                // Sucesso: Enviamos a URL para onde o front deve ir
                return res.json({ success: true, redirectUrl: '/dashboard' });
            } else {
                return res.json({ success: false, message: 'Senha incorreta.' });
            }
        });
    });
});

// ROTA Cadastro de pacientes
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se o usuário já existe
    const sqlCheck = 'SELECT * FROM usuarios WHERE email = ?';
    
    db.query(sqlCheck, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no banco de dados.' });

        if (results.length > 0) {
            return res.json({ success: false, message: 'Este e-mail já está cadastrado.' });
        }

        // Criptografar a senha
        bcrypt.hash(senha, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao criptografar senha.' });

            // Insiro o paciente no banco
            const sqlInsert = 'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)';
            
            db.query(sqlInsert, [nome, email, hash, 'paciente'], (err, result) => {
                if (err) return res.status(500).json({ success: false, message: 'Erro ao salvar usuário.' });

                res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});