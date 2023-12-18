//VERSÃO COM UPLOAD DE ARQUIVOS APENAS LOCAL
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C://Users//user//PhpstormProjects//microservicopoc//upload');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('text/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        return cb(null, true);
    } else {
        return cb(new Error('Tipo de arquivo não suportado. Envie um arquivo de texto, PDF ou imagem.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter,
});

app.post('/upload', upload.array('files', 5), async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    try {
        await Promise.all(files.map(async (file) => {
            const filePath = file.path;

            // Operações assíncronas com o arquivo local aqui, se necessário.

            // Remover o arquivo localmente.
            // await fs.unlink(filePath);
        }));

        res.status(200).send('Arquivos salvos localmente com sucesso.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao salvar arquivos localmente.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


