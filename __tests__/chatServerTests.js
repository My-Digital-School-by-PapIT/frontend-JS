'use strict';
const request = require('supertest');
// Import both app and sequelize form chatServer
const {app, Chatter, Message, sequelize} = require('../chatServer');

// Test helper
function randomId() {
    return Number(Math.random().toString(10).slice(2, 10));
}

// Test dataset
const JOHN_DOE_ID = 1;
const JOHN_DOE_NAME = "John Doe";

function initDB() {
    sequelize.sync().then(() => {
        Chatter.create({
            id: JOHN_DOE_ID,
            name: JOHN_DOE_NAME,
            latitude: 40.7128,
            longitude: -74.0060,
            hostname: 'localhost',
            messageNumber: 0
        });
        Message.create({
            id: 1,
            content: 'Hello, world!',
            userId: JOHN_DOE_ID,
            userName: JOHN_DOE_NAME,
            date: new Date()
        });
        Message.create({
            id: 2,
            content: 'How are you?',
            userId: JOHN_DOE_ID,
            userName: JOHN_DOE_NAME,
            date: new Date()
        });
    }).catch(
        err => console.error(err)
    );
}

//initDB();

// Jest test suite
describe('Chat Server API', () => {
    // Tests for GET routes
    it('Should return welcome message on GET /', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Welcome to Chatter server, post messages and express your thoughts!');
    });

    it('Should return all messages of a chatter on GET /v1/:userId: req.params.userId/messages/last-five', async () => {
        const res = await request(app).get('/v1/1/messages');
        expect(res.statusCode).toEqual(200);
    });
    it('Should return the last five messages of a chatter on GET /v1/:userId: req.params.userId/messages/last-five', async () => {
        const res = await request(app).get('/v1/1/messages/last-five');
        expect(res.statusCode).toEqual(200);
    });

    it('Should return a message by its ID on GET /v1/message/:messageId', async () => {
        const res = await request(app).get('/v1/message/1');
        expect(res.statusCode).toEqual(200);
    });

    it('Should return a chatter by its ID on GET /v1/chatter/:id', async () => {
        const res = await request(app).get('/v1/chatter/1');
        expect(res.statusCode).toEqual(200);
    });
    // 404 with wrong id
    it('Should return 404 on GET /v1/:id/message with wrong id', async () => {
        const res = await request(app).get('/v1/message/345434');
        expect(res.statusCode).toEqual(404);
    });
    it('Should return 404 on GET /v1/chatter/:id with wrong id', async () => {
        const res = await request(app).get('/v1/chatter/345434');
        expect(res.statusCode).toEqual(404);
    });
    // Tests for POST routes
    it('Should add a message on POST /v1/message', async () => {
        const res = await request(app)
            .post('/v1/message')
            .send({
                content: 'Hello, world!',
                id: randomId(),
                userId: JOHN_DOE_ID,
                userName: JOHN_DOE_NAME,
                date: new Date()
            });
        expect(res.statusCode).toEqual(200);
    });

    it('Should add a chatter on POST /v1/chatter', async () => {
        const res = await request(app)
            .post('/v1/chatter')
            .send({
                name: 'John Doe',
                id: randomId(),
                latitude: 40.7128,
                longitude: -74.0060,
                hostname: 'localhost',
                isMobile: false,
                messageNumber: 1
            });
        expect(res.statusCode).toEqual(200);
    });

    // 400 returning test with wrong body
    it('Should return 400 on POST /v1/message with wrong body', async () => {
        const res = await request(app)
            .post('/v1/message')
            .send({
                content: 'Hello, world!',
                id: randomId(),
                userId: 1
            });
        expect(res.statusCode).toEqual(400);
    });
    it('Should return 400 on POST /v1/chatter', async () => {
        const res = await request(app)
            .post('/v1/chatter')
            .send({
                name: 'John Doe',
                id: randomId(),
                latitude: 40.7128,
                longitude: -74.0060,
                //hostname: 'localhost',
                messageNumber: 1
            });
        expect(res.statusCode).toEqual(400);
    });
});