'use strict';
/*
An express server that listens for incoming messages from the chat client
and broadcasts them to all connected clients
*/
const express = require('express');
const app = express();
const PORT = 3000

/*
Configure CORS to allow all incoming request
*/
const cors = require('cors');
// Use CORS middleware
app.use(cors());
/*
Sequelize connection and model
*/
const Sequelize = require('sequelize');
const sequelize = new Sequelize('sqlite:chat.sqlite');
const Chatter = sequelize.define(
    'Chatter',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        latitude: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        longitude: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        hostname: {
            type: Sequelize.STRING,
            allowNull: false
        },
        messageNumber: {
            type: Sequelize.INTEGER,
            autoIncrement: false
        }
    },
    {
        timestamps: false
    }
);
const Message = sequelize.define(
    'Message',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: false
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
);
// Create the tables
sequelize.sync().then((result) => {
    console.log(result);
}).catch((err) => {
        console.log(err);
    }
);

/*
 * JSONMessage class to create JSON messages
 */
class JSONMessage {
    /***************************************************************************
     * Constructor of the JSONMessage class
     * @param {string} text - The message text
     **/
    constructor(text) {
        this.text = text
    }

    /***************************************************************************
     * Convert the JSONMessage object to a JSON object
     * @return {object} - The JSON object
     **/
    toJSON() {
        return {
            message: this.text
        }
    }
}

// To have a body in the POST request
app.use(express.json());

// All the GETs

// Route serving the static index.html file and required CSS and JS
app.get("/front", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/chat.js", (req, res) => {
    res.sendFile(__dirname + "/chat.js");
});
app.get("/css/bootstrap.min.css", (req, res) => {
    res.sendFile(__dirname + "/css/bootstrap.min.css");
});
app.get("/bootstrap.bundle.min.js", (req, res) => {
    res.sendFile(__dirname + "/bootstrap.bundle.min.js");
});
app.get('/v1/messages/last-hundred', (req, res) => {
    console.log('Last 100 messages from anyone')
    Message.findAll({
        order: [['date', 'DESC']],
        limit: 100
    }).then(messages => {
        res.status(200).json(messages)
    });
});

// Express server welcome message
app.get('/', (req, res) => {
    res.send('Welcome to Chatter server, post messages and express your thoughts!')
});

app.get('/v1/:id/messages', (req, res) => {
    console.log('All messages of ID ' + req.params.id)
    Message.findAll({
        where: {
            userId: req.params.id
        }
    }).then(messages => {
        res.status(200).json(messages)
    });
});

app.get('/v1/:id/messages/last-five', (req, res) => {
    console.log('Last five messages of ID ' + req.params.id)
    Message.findAll({
        where: {
            userId: req.params.id
        },
        order: [['date', 'DESC']],
        limit: 5
    }).then(messages => {
        res.status(200).json(messages)
    });
});

app.get('/v1/message/:messageId', (req, res) => {
    console.log('Message with ID ' + req.params.messageId)
    Message.findOne({
        where: {
            id: req.params.messageId
        }
    }).then(message => {
        if (message === null) {
            res.status(404).json(
                new JSONMessage(`Message with ID ${req.params.messageId} not found`).toJSON()
            );
        } else {
            res.status(200).json(message)
        }
    });
});

app.get('/v1/chatter/:id', (req, res) => {
    console.log('Chatter with ID ' + req.params.id)
    Chatter.findOne({
        where: {
            id: req.params.id
        }
    }).then(chatter => {
        if (chatter === null) {
            res.status(404).json(
                new JSONMessage(`Chatter with ID ${req.params.id} not found`).toJSON()
            );
        } else {
            res.status(200).json(chatter)
        }
    });
});
// All the POSTs
app.post('/v1/message', (req, res) => {
    console.log('Message posted by ID ' + req.body.id)
    // Add the message to the database
    sequelize.sync().then(() => {
        Message.create({
            content: req.body.content,
            id: req.body.id,
            userId: req.body.userId,
            userName: req.body.userName,
            date: req.body.date
        }).then(() => {
                res.status(200).json(
                    new JSONMessage(`Message ${req.body.id} added to database`).toJSON()
                )
            }
        ).catch((err) => {
                res.status(400).json(
                    new JSONMessage(err).toJSON()
                );
            }
        );
    });
});

app.post('/v1/chatter', (req, res) => {
    sequelize.sync().then(() => {
        Chatter.create({
            name: req.body.name,
            id: req.body.id,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            hostname: req.body.hostname,
            messageNumber: req.body.messageNumber
        }).then(() => {
            res.status(200).json(
                new JSONMessage(`Chatter ${req.body.id} added to database`).toJSON()
            )
        }).catch((err) => {
                console.error(err);
                res.status(400).json(
                    new JSONMessage(err).toJSON()
                );
            }
        );
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Example app listening on port ${PORT}`)
});

// Export both app, models and sequelize
module.exports = {app, Chatter, Message, sequelize}
