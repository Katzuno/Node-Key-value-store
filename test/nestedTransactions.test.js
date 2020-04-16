// Henning Erik
const KVstore = require('../kv-store-main');


jest.unmock('../kv-store-main');
jest.unmock('mock-stdin');

describe('test different inputs example', () => {
    let store = new KVstore();

    test('READ a WRITE a t READ a', ()   => {
        let result1 = store.executeCommand('READ a');
        let result2 = store.executeCommand('WRITE a t');
        let result3 = store.executeCommand('READ a');
        let result4 = store.executeCommand('DELETE a');
        let result5 = store.executeCommand('READ a');
        expect(result1).toBe('Key not found: a');
        expect(result2).toBe('');
        expect(result3).toBe('t');
        expect(result4).toBe('');
        expect(result5).toBe('Key not found: a');
    });

    test('PDF Example input', ()   => {
        let result = store.executeCommand('WRITE a v1');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('v1');
        result = store.executeCommand('START');
        expect(result).toBe('');
        result = store.executeCommand('WRITE a v2');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('v2');
        result = store.executeCommand('START');
        expect(result).toBe('');
        result = store.executeCommand('DELETE a');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('Key not found: a');
        result = store.executeCommand('COMMIT');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('Key not found: a');
        result = store.executeCommand('WRITE a v3');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('v3');
        result = store.executeCommand('ABORT');
        expect(result).toBe('');
        result = store.executeCommand('READ a');
        expect(result).toBe('v1');
        result = store.executeCommand('QUIT');
        expect(result).toBe('');

    });
});
