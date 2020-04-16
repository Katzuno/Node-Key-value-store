// Henning Erik

const readline = require('readline');

/**
 * Pentru nested transactions am ales sa construiesc o stiva (ultimul venit, primul iesit) pentru muta commit-urile dintr-o tranzactie in alta.
 */
class KV_Store {
    constructor() {
        this.dict = {};
        this.transactions = [];
    }

    getCommandType(commandArr) {
        return commandArr[0];
    }

    splitIntoArgs(command, separator = ' ') {
        return command.split(' ');
    }

    validateReadOrDelete(args) {
        return args.length === 2;
    }

    validateWrite(args) {
        return args.length === 3;
    }

    transactionRunning() {
        if (this.transactions.length > 0) {
            return true;
        }
        return false;
    }

    store(key, value) {
        if (this.transactionRunning()) {
            this.transactions[this.transactions.length - 1].dictDuringTransaction[key] = value;
        } else {
            this.dict[key] = value;
        }
    }

    read(key) {
        if (this.transactionRunning()) {
            if (!(key in this.transactions[this.transactions.length - 1].dictDuringTransaction)) {
                return 'Key not found: ' + key;
            }
            return this.transactions[this.transactions.length - 1].dictDuringTransaction[key];
        } else {
            if (!(key in this.dict)) {
                return 'Key not found: ' + key;
            }
            return this.dict[key];
        }
    }

    delete(key) {
        if (this.transactionRunning()) {
            if (!(key in this.transactions[this.transactions.length - 1].dictDuringTransaction)) {
                return 'Key not found: ' + key;
            }
            delete this.transactions[this.transactions.length - 1].dictDuringTransaction[key];
        } else {
            if (!(key in this.dict)) {
                return 'Key not found: ' + key;
            }
            delete this.dict[key];
        }
    }

    startTransaction() {
        let newTransaction = {
            'running': true,
            'dictDuringTransaction': this.dict
        };
        this.transactions.push(newTransaction);
    }

    abortTransaction() {
        this.transactions.pop();
    }

    commitTransaction() {
        if (this.transactions.length === 0)
        {
            console.warn('[WARNING] Nothing to commit');
            return 0;
        }
        // Daca avem mai multe de o tranzactie si dam COMMIT o mutam in tranzactia imediat exterioara
        if (this.transactions.length > 1)
        {
            this.transactions[this.transactions.length - 2].dictDuringTransaction = this.transactions[this.transactions.length - 1].dictDuringTransaction;
        }
        else {
            this.dict = this.transactions[this.transactions.length - 1].dictDuringTransaction;
        }
        this.transactions.pop();
    }

    executeCommand(command) {
        let args = this.splitIntoArgs(command);

        if (command === 'START') {
            console.log('[INFO] Started transaction');
            this.startTransaction();
        } else if (command === 'ABORT') {
            console.log('[INFO] Aborted transaction');
            this.abortTransaction();
        } else if (command === 'COMMIT') {
            console.log('[INFO] COMMITED transaction');
            this.commitTransaction();
        }


        if (this.getCommandType(args) === 'READ') {
            if (!this.validateReadOrDelete(args)) {
                console.error('Invalid number of arguments. Syntax is [READ <key>]');
            }
            return this.read(args[1]);
        } else if (this.getCommandType(args) === 'WRITE') {
            if (!this.validateWrite(args)) {
                console.error('Invalid number of arguments. Syntax is [WRITE <key> <value>].');
            }

            this.store(args[1], args[2]);
        } else if (this.getCommandType(args) === 'DELETE') {
            if (!this.validateReadOrDelete(args)) {
                console.error('Invalid number of arguments. Syntax is [DELETE <key>]');
            } else {
                this.delete(args[1]);
            }
        }

        return '';
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
            console.log(kvStore.executeCommand(command));
            if (command === 'QUIT') {
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

module.exports = KV_Store;

main();
