"use strict";
const SERVER_IP_PORT = "http://localhost:3000";
const REFRESH_TIMEOUT_MS = 1000;

/*******************************************************************************
 * A class that represents a Chatter
 */
class Chatter {
    /***************************************************************************
     * Method that is called when the geolocation is successful
     * @param {Promise} resolve - The resolve function of the Promise
     * @param {Position} position - The position object
     */
    static geolocationSuccess(resolve, position) {
        resolve(position);
    }

    /***************************************************************************
     * Method that is called when the geolocation fails
     * @param {Promise} reject - The reject function of the Promise
     * @param {PositionError} err - The error object
     */
    static geolocationError(reject, err) {
        reject(null);
    }

    /***************************************************************************
     * Method that returns the current position
     * @returns {Promise} - The Promise object
     */
    static getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                Chatter.geolocationSuccess.bind(null, resolve),
                Chatter.geolocationError.bind(null, reject)
            );
        });
    }

    /***************************************************************************
     * Constructor of the Chatter class
     * @param {Number} id - The id of the Chatter
     * @param {String} name - The name of the Chatter
     */
    constructor(id, name = "Anonymous") {
        this.id = id;
        this.name = name;
        this.myMessages = [];
        this.allMessages = [];
        Chatter.getPosition().then(position => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
        }).catch(err => {
            this.latitude = err;
            this.longitude = err;
        });
        this.hostname = location.hostname;
        // Use screen object to define if the user is on a mobile device or not
        this.isMobile = screen.orientation.type.includes("portrait");
    }

    /***************************************************************************
     * Method that returns all messages of the current Chatter
     * @returns {Array} - The array of messages of the Message class
     */
    getAllMyMessages() {
        let url = `${SERVER_IP_PORT}/v1/${this.id}/messages`;
        fetch(url).then(
            response => response.json()
        ).then(messages => {
            this.myMessages = messages;
        }).catch(
            error => console.log(error)
        );
    }

    /***************************************************************************
     * Method that returns the last five messages of the current Chatter
     * @returns {Array} - The array of messages of the Message class
     */
    getMyLastFiveMessages() {
        return this.myMessages.slice(-5);
    }

    /***************************************************************************
     * Method that returns all messages of all Chatters
     * @returns {Array} - The array of messages of the Message class
     */
    getAllMessages() {
        fetch(`${SERVER_IP_PORT}/v1/messages/last-hundred`).then(
            response => response.json()
        ).then(messages => {
            this.allMessages = messages;
            console.log(messages);
        }).catch(
            error => console.log(error)
        );
    }

    /***************************************************************************
     * Method that add a message to the current Chatter
     * @param {Message} - The message to add
     */
    addMessage(message) {
        // POST on /v1/message using fetch API
        fetch(`${SERVER_IP_PORT}/v1/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message.content,
                id: message.id,
                userId: this.id,
                userName: this.name,
                date: message.date
            })
        }).then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    }

    /***************************************************************************
     * Method that returns a message by its id
     * @param {Number} id - The id of the message
     * @returns {Message} - The message object
     */
    getMessageById(id) {
        return this.myMessages.find(message => message.id === id);
    }

    /***************************************************************************
     * Method that returns all information of the current Chatter
     * The information is sent to the server
     * @returns {Object} - The object containing all information of the Chatter
     */
    allInfo() {
        if (!this.hasOwnProperty('latitude') || !this.hasOwnProperty('longitude')) {
            this.latitude = 0;
            this.longitude = 0;
        }
        // POST on /v1/chatter
        fetch(`${SERVER_IP_PORT}/v1/chatter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: this.id,
                name: this.name,
                hostname: this.hostname,
                messageNumber: this.myMessages.length,
                latitude: this.latitude,
                longitude: this.longitude,
            })
        }).then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
        return {
            id: this.id,
            name: this.name,
            hostname: this.hostname,
            messageNumber: this.myMessages.length,
            isMobile: this.isMobile,
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }
}

/*******************************************************************************
 * The structure of a message
 **/
class Message {
    /*
    * Constructor of the message class
    * @param {String} content - The content of the message
    * @param {String} chatterName - The name of the Chatter
    * */
    constructor(content, chatterName) {
        this.id = Number(Math.random().toString(10).slice(2));
        this.userName = chatterName;
        this.date = new Date();
        this.content = content;
    }

}

/*******************************************************************************
 Update all the UI, I.e., DOM
 @param {Chatter} chatter - The Chatter instance containing messages
 @param {HTMLInputElement} messageInputElement - The message input to
  disable/enable
 */
function updateWebUIAndMessages(chatter, messageInputElement) {
    chatter.getAllMessages();
    chatter.getAllMyMessages();
    updateInfoCard(chatter);
    updateMessageList(chatter, messageInputElement);
}

/*******************************************************************************
 Add information of the Chatter instance to the dedicated card.
 @param {Chatter} chatter - The Chatter instance containing messages
 */
function updateInfoCard(chatter) {
    // The card body Element
    let cardBody = document.getElementById('info-card-body');
    // Empty the card
    while (cardBody.firstChild) {
        cardBody.removeChild(cardBody.lastChild);
    }
    // Name
    let nameSpan = document.createElement('span');
    nameSpan.textContent = chatter.name;
    let nameP = document.createElement('p');
    nameP.textContent = "Chatter Name: ";
    nameP.append(nameSpan);
    cardBody.prepend(nameP);
    // ID
    let idSpan = document.createElement('span');
    idSpan.textContent = chatter.id;
    let idP = document.createElement('p');
    idP.textContent = "Chatter ID: ";
    idP.append(idSpan);
    cardBody.prepend(idP);
    // Message Number
    let messageNumberSpan = document.createElement('span');
    messageNumberSpan.textContent = chatter.myMessages.length;
    let messageNumberP = document.createElement('p');
    messageNumberP.textContent = "Message Number: ";
    messageNumberP.append(messageNumberSpan);
    cardBody.prepend(messageNumberP);
    // Latitude
    if (chatter.hasOwnProperty('latitude')) {
        let latitudeSpan = document.createElement('span');
        latitudeSpan.textContent = chatter.latitude.toFixed(2);
        let latitudeP = document.createElement('p');
        latitudeP.textContent = "Latitude: ";
        latitudeP.append(latitudeSpan);
        cardBody.prepend(latitudeP);
    }
    // Longitude
    if (chatter.hasOwnProperty('longitude')) {
        let longitudeSpan = document.createElement('span');
        longitudeSpan.textContent = chatter.longitude.toFixed(2);
        let longitudeP = document.createElement('p');
        longitudeP.textContent = "Longitude: ";
        longitudeP.append(longitudeSpan);
        cardBody.prepend(longitudeP);
    }
    // Hostname
    let hostnameSpan = document.createElement('span');
    hostnameSpan.textContent = chatter.hostname;
    let hostnameP = document.createElement('p');
    hostnameP.textContent = "Hostname: ";
    hostnameP.append(hostnameSpan);
    cardBody.prepend(hostnameP);
}

/*******************************************************************************
 Message input form is disabled by default.
 The parent's element's id is messages-card-body
 Each message should be displayed in a card with the following structure:
 <div class="card">
 <div class="card-header">
 <h4>${Chatter.name}, le ${Chatter.messages[i].date}</h4>
 </div>
 <div>
 <p>${Chatter.messages[i].content}</p>
 </div>
 </div>
 @param {Chatter} chatter - The Chatter instance containing messages
 @param {HTMLInputElement} messageInputElement - The message input to
  disable/enable
 */
function updateMessageList(chatter, messageInputElement) {

    // Enable the message form input
    messageInputElement.disabled = false;
    // Process the message card
    let messagesCardBody = document.getElementById('messages-card-body');
    // Empty the card
    while (messagesCardBody.firstChild) {
        messagesCardBody.removeChild(messagesCardBody.lastChild);
    }
    for (let i = 0; i < chatter.allMessages.length; i++) {
        let card = document.createElement('div');
        card.classList.add('card', 'mt-2');
        let cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        let header = document.createElement('h5');
        let messageDate = new Date(chatter.allMessages[i].date);
        header.textContent = `${chatter.allMessages[i].userName}, le ${messageDate.toLocaleString()}`;
        cardHeader.append(header);
        card.append(cardHeader);
        let content = document.createElement('div');
        content.classList.add('p-3');
        let contentP = document.createElement('p');
        contentP.textContent = chatter.allMessages[i].content;
        content.append(contentP);
        card.append(content);
        messagesCardBody.append(card);
    }
}

// when document fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Chatter form
    let chatterForm = document.getElementById('chatter-form');
    let inputs = chatterForm.querySelectorAll('input');

    // Message form
    let messageForm = document.getElementById('message-form');
    let messageInputElement = messageForm.querySelector('input');
    // Message cannot be filled
    messageInputElement.disabled = true;

    // Chatter data
    let chatterID = null;
    let chatter = null;

    // if parameters id and name are passed in the URL
    let url = new URL(location.href);
    let id = url.searchParams.get("id");
    let name = url.searchParams.get("name");
    if (id && name) {
        inputs[0].value = name;
        inputs[1].value = id;
        chatterID = Number(id);
        chatter = new Chatter(chatterID, name);
        document.title = `Chatter ${name}`;
        chatter.allInfo();
        setInterval(updateWebUIAndMessages, REFRESH_TIMEOUT_MS, chatter, messageInputElement);
    }
    // Add event listener to the button
    chatterForm.addEventListener('submit', function (event) {
        event.preventDefault()
        let chatterName = inputs[0].value;
        document.title = `Chatter ${chatterName}`;
        Number(chatterID = inputs[1].value);
        chatter = new Chatter(chatterID, chatterName);
        chatter.allInfo();
        setInterval(updateWebUIAndMessages, REFRESH_TIMEOUT_MS, chatter, messageInputElement);
    });
    // Message form event listener
    messageForm.addEventListener('submit', function (event) {
        event.preventDefault()
        chatter.addMessage(new Message(messageInputElement.value));
        messageInputElement.value = "";
        setInterval(updateWebUIAndMessages, REFRESH_TIMEOUT_MS, chatter, messageInputElement);
    })
});