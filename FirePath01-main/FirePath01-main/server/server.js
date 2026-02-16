
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
const dbo = require('./db.js');

app.use(require('./routes/record'));

app.listen(port, () => {
    // perform a database connection when server starts
    dbo.connectToServer(function (err) {
        if (err) console.error(err);
    });
    console.log(`Server is running on port: ${port}`);
});
