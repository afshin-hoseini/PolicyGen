import { input } from './input.js';

const premitiveTypes = ['string', 'number', 'boolean'];
const functions = {
    isOlderThan18: (params, incomingValue) => {
        return "BL";
    },
    fetchDbValue: async (params, incomingValue) => {
        return 'DB Value';
    },
    isThatThing: (params, incomingValue) => {

        console.log("isThatThing ---> ", incomingValue);
        return incomingValue === 'BLA';
    }
}

async function generateDocument(input, runResultStack = []) {

    const incomingValue = runResultStack[runResultStack.length - 1];

    async function runCommand() {
        const functionName = input.$run.$;
        const params = input.$run.$params;
        const result = await functions[functionName](params, incomingValue);
        if (input.$run.$then) {
            runResultStack.push(result);
            const doc = await generateDocument(input.$run.$then, runResultStack);
            runResultStack.pop();
            return doc;
        }
        return result;
    }

    async function caseCommand() {

        const caseFunctionMap = {
            $e: (value, incomingValue) => {
                return value === incomingValue;
            },
            $gt: (value, incomingValue) => {
                return value < incomingValue;
            },
            $lt: (value, incomingValue) => {
                return value > incomingValue;
            },
            $eval: async (value, incomingValue) => {
                return await functions[value]({}, incomingValue);
            },
            $else: () => {
                return true;
            }
        }

        const cases = input.$case;
        for (let i = 0; i < cases.length; i++) {
            const caseItem = cases[i];
            const caseKey = Object.keys(caseItem)[0];
            const caseValue = caseItem[caseKey];

            if (await (caseFunctionMap[caseKey](caseValue, incomingValue))) {

                console.log("Case Command ---> ", caseKey, caseValue);

                const value = caseItem.$v || caseItem.$else;
                if (premitiveTypes.includes(typeof value)) return value;

                return await generateDocument(value, runResultStack);
            }
        }

    }

    if (input === null || input === undefined) {
        return input;
    }

    if (input.$run) {
        return await runCommand();
    }

    if (input.$case) {
        return await caseCommand();
    }

    const output = {}

    for (const key in input) {

        const value = input[key];
        if (premitiveTypes.includes(typeof value)) {
            output[key] = value;
            continue;
        }

        if (Array.isArray(value)) {
            output[key] = await Promise.all(value.map(v => generateDocument(v, runResultStack)));
            continue;
        }

        if (typeof value === 'object') {
            output[key] = await generateDocument(value, runResultStack);
            continue;
        }
    }

    return output;
}

const doc = await generateDocument(input);

console.log("\n\n", JSON.stringify(doc, null, 2), "\n\n");