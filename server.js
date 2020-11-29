require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;
app.use('/uploads', express.static('uploads'));
app.use (cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MONGODB conectado");
});

const usersRouter = require('./routes/users');

const categoryRouter = require('./routes/category');

const serviceRouter = require('./routes/service');

const ratingKtalogRouter = require('./routes/ratingKtalog');

app.use('/ratingKtalog', ratingKtalogRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/service', serviceRouter);

app.listen(port, () => {
    console.log("ei luigi vai tomar no cu");
});