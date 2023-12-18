//UPLOAD DE ARQUIVOS LOCAL E AWS
const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const port = 3000;

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

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
        const uploadPromises = files.map(async (file) => {
            const filePath = file.path;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.originalname,
                Body: await fs.readFile(filePath), // Leitura do arquivo como buffer
            };

            await s3.upload(params).promise();

            await fs.unlink(filePath);
        });

        await Promise.all(uploadPromises);

        res.status(200).send('Arquivos enviados com sucesso para o S3.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao fazer upload para o S3.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
