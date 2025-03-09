class Chatter {
    static geolocationSuccess(resolve, position) {
        resolve(position);
    }

    static geolocationError(reject, err) {
        reject(null);
    }

    static getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                Chatter.geolocationSuccess.bind(null, resolve),
                Chatter.geolocationError.bind(null, reject)
            );
        });
    }

    constructor(id, name = "Anonymous") {
        this.id = id;
        this.name = name;
        this.messages = [];
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

    // Méthode qui retourne tous les messages
    getAllMessages() {
        return this.messages;
    }

    // Méthode qui retourne les 5 derniers messages
    getLastFiveMessages() {
        return this.messages.slice(-5);
    }

    // Méthode qui permet l'ajout d'un message
    addMessage(message) {
        this.messages.unshift(message);
        history.pushState({messageId: message.id}, null, `#${message.id}`);
    }

    // get a message by its id
    getMessageById(id) {
        return this.messages.find(message => message.id === id);
    }

    // Méthode qui ramène toutes les informations
    getAllInfo() {
        return {
            id: this.id,
            name: this.name,
            hostname: this.hostname,
            messageNumber: this.messages.length,
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }
}

class Message {
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
function updateWebUI(chatter, messageInputElement) {
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
    messageNumberSpan.textContent = chatter.messages.length;
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
    for (let i = 0; i < chatter.messages.length; i++) {
        let card = document.createElement('div');
        card.classList.add('card', 'mt-2');
        let cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        let header = document.createElement('h5');
        header.textContent = `${chatter.name}, le ${chatter.messages[i].date.toLocaleString()}`;
        cardHeader.append(header);
        card.append(cardHeader);
        let content = document.createElement('div');
        content.classList.add('p-3');
        let contentP = document.createElement('p');
        contentP.textContent = chatter.messages[i].content;
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

    // Location
    if (location.hash !== "") {
        chatterID = Number(location.hash.slice(1));
        inputs[0].value = "Anonymous";
        inputs[1].value = chatterID;
        chatter = new Chatter(chatterID);
        document.title = `Chatter ${chatterID}`;
        updateWebUI(chatter, messageInputElement);
    }

    // Add event listener to the button
    chatterForm.addEventListener('submit', function (event) {
        event.preventDefault()
        let chatterName = inputs[0].value;
        document.title = `Chatter ${chatterName}`;
        if (chatterID == null) {
            chatterID = inputs[1].value;
        }
        chatter = new Chatter(chatterID, chatterName);
        updateWebUI(chatter, messageInputElement);
    });

    // Message form event listener
    messageForm.addEventListener('submit', function (event) {
        event.preventDefault()
        chatter.addMessage(new Message(messageInputElement.value));
        messageInputElement.value = "";
        updateWebUI(chatter, messageInputElement);
    })

});