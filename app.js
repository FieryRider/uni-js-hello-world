var events = {};
var clients = {};

var currentEventId=0

function addEvent(eventName, ageRestriction) {
    if (eventName.match(/^\\s*$/)) {
        console.log("Невалидно име");
        return;
    }

    let accessFlag = false;
    if (arguments.length == 2) {
        console.log(ageRestriction);
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
}

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
        events[id]['accessFlag'] = newValues['ageRestriction'];

    ageRestriction = events[id]['accessFlag'] ? "18+" : "18-";
    console.log(`${id}. Име на събитие: ${events[id]['name']}, Възрастово ограничение: ${ageRestriction}`);
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
}

function printEvents() {
    for (let eventId in events) {
        let ageRestriction = events[eventId]['accessFlag'] ? "18+" : "18-";
        console.log(`${eventId}. Име на събитие: ${events[eventId]['name']}, Възрастово ограничение: ${ageRestriction}`);
    }
}

//arg0: node, arg1: app.js, arg2: commmand, arg3+: command argument
if (process.argv.length < 3)
    process.exit();

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
}

