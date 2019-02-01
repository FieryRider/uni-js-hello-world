const fs = require('fs');
var events = {};
var clients = {};

// Blocks adding of events or clients
var blockAdding = false;

var currentEventId=0;

/*
 *Event Management functions
 */

/*
 * @param {string} eventName
 * @param {string} ageRestriction
 *   '18-' or '18+'
 */
function addEvent(eventName, ageRestriction) {
    if (blockAdding) {
        console.log("Добавянето на събития и клиенти е блокирано");
        return;
    }

    if (eventName.match(/^\\s*$/)) {
        console.log("Невалидно име");
        return;
    }

    let accessFlag = false;
    if (arguments.length == 2) {
        if (ageRestriction.match(/^18\+$/)) {
            accessFlag = true;
        } else if (ageRestriction.match(/^18-$/)) {
            accessFlag = false;
        } else {
            console.log("Грешно възрастово ограничение!");
            return;
        }
    }

    events[currentEventId] = {'name': eventName, 'accessFlag': accessFlag, 'participants': []};
    currentEventId++;
    writeDataToJSON();
}

/*
 * @param {int} id
 *   Event ID
 * @param {object} newValues
 *   The new event properties
 */
function editEvent(id, newValues) {
    if (('name' in newValues) && newValues['name'].match(/^\\s*$/)) {
        console.log("Невалидно име");
        return;
    }

    let accessFlag = events[id]['accessFlag'];
    if ('ageRestriction' in newValues) {
        if (newValues['ageRestriction'].match(/^18\+$/)) {
            accessFlag = true;
        } else if (newValues['ageRestriction'].match(/^18-$/) || newValues['ageRestriction'].match(/^$/)) {
            accessFlag = false;
        } else {
            console.log("Грешно възрастово ограничение!");
            return;
        }
    }

    if ('name' in newValues)
        events[id]['name'] = newValues['name'];
    if ('ageRestriction' in newValues)
        events[id]['accessFlag'] = accessFlag;

    ageRestriction = events[id]['accessFlag'] ? "18+" : "18-";
    console.log(`${id}. Име на събитие: ${events[id]['name']}, Възрастово ограничение: ${ageRestriction}`);
    writeDataToJSON();
}

function removeEvent(id) {
    if (isNaN(id)) {
        console.log("Невалидно id");
        return;
    }

    let ageRestriction = events[id]['accessFlag'] ? "18+" : "18-";
    let msg = `Събитие: ${id}: ${events[id]['name']}, Възрастово ограничение: ${ageRestriction} е премахнато!`;
    delete events[id];
    console.log(msg);
    writeDataToJSON();
}

function printEvents() {
    for (let eventId in events) {
        let ageRestriction = events[eventId]['accessFlag'] ? "18+" : "18-";
        console.log(`${eventId}. Име на събитие: ${events[eventId]['name']}, Възрастово ограничение: ${ageRestriction}`);
    }
}

/*
 * Prints the clients that participate in an event (All info about them)
 * @param {int} eventId
 *   ID of the event
 * @param {char} sex (optional)
 *   Filter client by sex ('м' or 'ж')
 */
function printEventClients(eventId, sex) {
    let filter = false;
    if (arguments.length == 2) {
        if ((sex != 'м') && (sex != 'ж')){
            console.log("Невалиден пол!");
            return;
        }
        filter = true;
    }
    events[eventId]['participants'].forEach((clientName) => {
        if (filter == true) {
            if (client[clientName]['sex'] == sex)
                console.log(`Име: ${clientName}, Пол: ${clients[clientName]['sex']}, Възраст: ${clients[clientName]['age']}`)
        } else {
            console.log(`Име: ${clientName}, Пол: ${clients[clientName]['sex']}, Възраст: ${clients[clientName]['age']}`)
        }
    });
}

function printClients() {
    for (let key in clients) {
        console.log(`Име: ${key}, Пол: ${clients[key]['sex']}, Възраст: ${clients[key]['age']}`)
    }
}

/*
 * Adds a client to the list of clients
 * @param {string} name
 * @param {char} sex
 *   'м' or 'ж'
 * @param {int} age
 */
function addClient(name, sex, age) {
    if (blockAdding) {
        console.log("Добавянето на събития и клиенти е блокирано");
        return;
    }
    if ((sex != 'м') && (sex != 'ж')){
        console.log("Невалиден пол!");
        return;
    }
    if (isNaN(age)) {
        console.log("Невалидна възраст");
        return;
    }

    clients[name] = {'sex': sex,
                        'age': age};
    writeDataToJSON();
}

function addClientToEvent(eventId, clientName) {
    if ((clients[clientName]['age'] < 18) && events[eventId]['accessFlag']) {
        console.log("Потребителя няма нужната възраст за това събитие!");
        return;
    }
    events[eventId]['participants'].push(clientName);
    writeDataToJSON();
}

function removeClientFromEvent(eventId, clientName) {
    events[eventId]['participants'].forEach((client, idx) => {
        if (client == clientName) {
            events[eventId]['participants'].splice(idx, 1);
            console.log(`Потребител: ${client} е успешно премахнат от "${events[eventId]['name']}"`);
        }
    });
    writeDataToJSON();
}

function readDataFromJSON() {
    let data = fs.readFileSync('./data.json', {'encoding': "utf-8"});

    events = JSON.parse(data)['events'];
    clients = JSON.parse(data)['clients'];
    blockAdding = JSON.parse(data)['blockAdding'];
    currentEventId = parseInt(Object.keys(events)[Object.keys(events).length -1]) + 1;
}

function writeDataToJSON() {
    let eventsJSON = JSON.stringify(events);
    let clientsJSON = JSON.stringify(clients);
    let JSONString = `{"blockAdding": ${blockAdding}, "events": ${eventsJSON}, "clients": ${clientsJSON}}`;
    fs.writeFileSync('./data.json', JSONString);
}

//arg0: node, arg1: app.js, arg2: commmand, arg3+: command argument
if (process.argv.length < 3)
    process.exit();

if (fs.existsSync('./data.json')) {
    readDataFromJSON();
}

switch(process.argv[2]) {
    case 'list-events':
        printEvents();
        break;
    case 'add-event':
        //argv[3] - Name, argv[4] - AccessFlag
        if (process.argv.length < 5)
            addEvent(process.argv[3]);
        else
            addEvent(process.argv[3], process.argv[4]);
        break;
    case 'edit-event':
        //node app.js edit-event <id> [<what_to_edit> <new_value>...]
        if (process.argv.length < 6)
            break;
        let validKeys = ["name", "ageRestriction"];
        let newValues = {};
        for (let i = 4; i < process.argv.length; i += 2) {
            if (!validKeys.includes(process.argv[i])) {
                console.log(`Невалиден атрибут: {process.argv[i]}`);
                break;
            }
            newValues[process.argv[i]] = process.argv[i + 1];
        }
        editEvent(process.argv[3], newValues);
        break;
    case 'remove-event':
    case 'delete-event':
        removeEvent(process.argv[3]);
        break;
    case 'list-clients':
        printClients();
        break;
    case 'add-client':
        if (process.argv.length < 5)
            break;
        //argv[3] - Name, argv[4] - Sex, argv[5] - Age
        addClient(process.argv[3], process.argv[4], process.argv[5]);
        break;
    case 'add-client-event':
        //argv[3] - Event ID, argv[4] - Client's Name
        addClientToEvent(process.argv[3], process.argv[4]);
        break;
    case 'list-event-clients':
        //argv[3] - Event ID, argv[4] - sexFilter ('м'/'ф')
        if (process.argv.length < 5) {
            printEventClients(process.argv[3]);
        } else {
            printEventClients(process.argv[3], process.argv[4]);
        }
        break;
    case 'remove-event-client':
        //argv[3] - Event Id, argv[4] - Client's name
        if (process.argv.length < 5) {
            console.log("Недостатъчно аргументи");
            break;
        }
        removeClientFromEvent(process.argv[3], process.argv[4]);
        break;
    case 'lock-system':
        blockAdding = true;
        writeDataToJSON();
        break;
    case 'unlock-system':
        blockAdding = false;
        writeDataToJSON();
        break;
}
