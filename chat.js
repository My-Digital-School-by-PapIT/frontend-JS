class Chatter {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.messages = [];
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
        this.messages.push(message);
    }

    // Méthode qui ramène toutes les informations
    getAllInfo() {
        return {
            name: this.name,
            totalMessages: this.messages.length,
            messages: this.messages
        };
    }
}

// Exemple d'utilisation
const manager = new Chatter(1, "Jeanjean");
manager.addMessage("Bonjour");
manager.addMessage("Comment ça va ?");
manager.addMessage("Tout va bien.");
manager.addMessage("Merci.");
manager.addMessage("À bientôt.");
manager.addMessage("Bonne journée.");

console.log(manager.getAllMessages()); // Affiche tous les messages
console.log(manager.getLastFiveMessages()); // Affiche les 5 derniers messages
console.log(manager.getAllInfo()); // Affiche toutes les informations