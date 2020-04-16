const readline = require('readline');
const fs = require('fs');

class KV_Store {
    constructor(reader) {
        this.reader = reader;
        this.dict = {};
        this.transactionRunning = false;
        this.dictDuringTransaction = {};
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

    validateWrite(args) {
        return args.length === 3;
    }

    store(key, value) {
        if (this.transactionRunning) {
            this.dictDuringTransaction[key] = value;
        } else {
            this.dict[key] = value;
        }
    }

    read(key) {
        if (this.transactionRunning) {
            return this.dictDuringTransaction[key];
        } else {
            return this.dict[key];
        }
    }

    delete(key) {
        if (this.transactionRunning) {
            delete this.dictDuringTransaction[key];
        } else {
            delete this.dict[key];
        }
    }

    startTransaction() {
        this.dictDuringTransaction = this.dict;
    }

    abortTransaction() {
        this.dictDuringTransaction = {};
    }

    commitTransaction() {
        this.dict = this.dictDuringTransaction;
        this.dictDuringTransaction = {};
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

            if (command === 'START') {
                reader.output.write('[INFO] Started transaction');
                kvStore.startTransaction();
            } else if (command === 'ABORT') {
                reader.output.write('[INFO] Aborted transaction');
                kvStore.abortTransaction();
            } else if (command === 'COMMIT') {
                reader.output.write('[INFO] COMMITED transaction');
                kvStore.commitTransaction();
            }

            if (kvStore.getCommandType(args) === 'READ') {
                try {
                    if (!kvStore.validateReadOrDelete(args)) {
                        console.error('Invalid number of arguments. Syntax is [READ <key>]');
                    }
                    reader.output.write(kvStore.read(args[1]));
                } catch (err) {
                    console.error('Key not found: ', args[1], err);
                }
            } else if (kvStore.getCommandType(args) === 'WRITE') {
                if (!kvStore.validateWrite(args)) {
                    console.error('Invalid number of arguments. Syntax is [WRITE <key> <value>].');
                }

                kvStore.store(args[1], args[2]);
            } else if (kvStore.getCommandType(args) === 'DELETE') {
                try {
                    if (!kvStore.validateReadOrDelete(args)) {
                        console.error('Invalid number of arguments. Syntax is [DELETE <key>]');
                    } else {
                        delete kvStore.dict[args[1]];
                    }
                } catch (err) {
                    console.error('Key not found: ', args[1]);
                }
            } else if (kvStore.getCommandType(args) === 'QUIT') {
                reader.close();
            }

            reader.output.write("\n");
            reader.prompt();

        }
    ).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
    });
}

main();

