const readline = require('readline');
const fs = require('fs');

class KV_Store {
    constructor(reader) {
        this.reader = reader;
        this.dict = {};
    }

    getCommandType(commandArr) {
        return commandArr[0];
    }

    splitIntoArgs(command, separator) {
        return command.split(' ');
    }

    validateReadOrDelete(args) {
        return args.length === 2;

    }

    run() {

    }
}


function main() {

    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        err: process.stderr,
    });


    let kvStore = new KV_Store(reader);

    reader.prompt();

    reader.on('line', (command) => {
        let args = kvStore.splitIntoArgs(command);

        if (kvStore.getCommandType(args) === 'READ') {
            try {
                if (!kvStore.validateReadOrDelete(args)) {
                    console.error('Invalid number of arguments. Syntax is [READ <key>]');
                } else {
                    reader.output.write(kvStore.dict[args[1]]);
                }
            } catch (err) {
                console.error('Key not found: ', args[1]);
            }
        } else if (kvStore.getCommandType(args) === 'WRITE') {
            try {
                kvStore.dict[args[1]] = args[2];
            } catch (err) {
                console.error('Unexpected number of arguments. Syntax is [WRITE <key> <value>].', err);
            }
        }
        else if (kvStore.getCommandType(args) === 'DELETE') {
            try {
                if (!kvStore.validateReadOrDelete(args)) {
                    console.error('Invalid number of arguments. Syntax is [DELETE <key>]');
                } else {
                    delete kvStore.dict[args[1]];
                }
            } catch (err) {
                console.error('Key not found: ', args[1]);
            }
        }
        else if (kvStore.getCommandType(args) === 'QUIT') {
            reader.close();
        }

        //console.log(kvStore.dict);
        reader.output.write("\n");
        reader.prompt();

    }).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
    });
}

main();

