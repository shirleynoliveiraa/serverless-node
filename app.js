const express = require('express');
const AWS = require('aws-sdk');
const serverless = require('serverless-http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'UsersTable';

app.use(express.json());

// POST /users - Cria um novo usuário
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  const id = uuidv4();

  const params = {
    TableName: USERS_TABLE,
    Item: {
      id,
      name,
      email
    }
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({ id, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// GET /users/:id - Obtém um usuário pelo ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  const params = {
    TableName: USERS_TABLE,
    Key: {
      id
    }
  };

  try {
    const { Item } = await dynamoDB.get(params).promise();

    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
});

module.exports.handler = serverless(app);
