// Test utils

import { TupleType } from "./node_modules/typescript/lib/typescript";

const testBlock = (name: string): void => {
    console.groupEnd();
    console.group(`# ${name}\n`);
};

const areEqual = (a: unknown, b: unknown): boolean => {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((element, index) => areEqual(element, b[index]));
    }
    return a === b;
};

const test = (whatWeTest: string, actualResult: unknown, expectedResult: unknown): void => {
    if (areEqual(actualResult, expectedResult)) {
        console.log(`[OK] ${whatWeTest}\n`);
    } else {
        console.error(`[FAIL] ${whatWeTest}`);
        console.debug('Expected:');
        console.debug(expectedResult);
        console.debug('Actual:');
        console.debug(actualResult);
        console.log('');
    }
};

// Functions

const getType = (value: unknown): string => {
    // Return string with a native JS type of value
    return typeof value;
};

const getTypesOfItems = (arr: unknown[]): string[] => {
    // Return array with types of items of given array
    return arr.map(getType);
};

const allItemsHaveTheSameType = (arr: unknown[]): boolean => {
    // Return true if all items of array have the same type
    if (arr.length > 0) {
        const typesSet: Set<string> = new Set(getTypesOfItems(arr));
        return typesSet.size === 1;
    }
    return true;
};

const getRealType = (value: unknown): string => {
    // Return string with a “real” type of value.
    // For example:
    //     typeof new Date()       // 'object'
    //     getRealType(new Date()) // 'date'
    //     typeof NaN              // 'number'
    //     getRealType(NaN)        // 'NaN'
    // Use typeof, instanceof and some magic. It's enough to have
    // 12-13 unique types but you can find out in JS even more :)
    if (Array.isArray(value)) {
        return 'array';
    } else if (value instanceof Date) {
        return 'date';
    } else if (value instanceof RegExp) {
        return 'regexp';
    } else if (value instanceof Set) {
        return 'set';
    } else if (value instanceof Map) {
        return 'map';
    } else if (value instanceof Error) {
        return 'error';
    } else if (value instanceof ArrayBuffer) {
        return 'buffer';
    } else if (value instanceof Blob) {
        return 'blob';
    } else if (Number.isNaN(value)) {
        return 'NaN';
    } else if (value === null) {
        return 'null';
    } else if (value === Infinity) {
        return 'Infinity';
    } else if (typeof value === 'function' && value.name === 'GeneratorFunction') {
        return 'generator function';
    }
    return typeof value;
};

const getRealTypesOfItems = (arr: unknown[]): string[] => {
    // Return array with real types of items of given array
    const realTypesArr: string[] = [];
    for (const el of arr) {
        realTypesArr.push(getRealType(el));
    }
    return realTypesArr;
};

const everyItemHasAUniqueRealType = (arr: unknown[]): boolean => {
    // Return true if there are no items in array
    // with the same real type
    if (arr.length > 0) {
        const realTypesSet: Set<string> = new Set(getRealTypesOfItems(arr));
        return realTypesSet.size === arr.length;
    }
    return true;
};

interface StringMap<T> {
    [key: string]: T;
}

const countRealTypes = (arr: unknown[]): [string, number][] => {
    // Return an array of arrays with a type and count of items
    // with this type in the input array, sorted by type.
    // Like an Object.entries() result: [['boolean', 3], ['string', 5]]
    if (!arr) {
        return [];
    }

    const realTypesArr: string[] = getRealTypesOfItems(arr);
    realTypesArr.sort();

    const realTypesCounter: StringMap<number> = {};
    for (const realType of realTypesArr) {
        const count = realTypesCounter[realType];
        realTypesCounter[realType] = count !== undefined ? count + 1 : 1;
    }

    return Object.entries(realTypesCounter);
};

// Tests

testBlock('getType');

test('Boolean', getType(true), 'boolean');
test('Number', getType(123), 'number');
test('String', getType('whoo'), 'string');
test('Array', getType([]), 'object');
test('Object', getType({}), 'object');
test(
    'Function',
    getType(() => {}),
    'function'
);
test('Undefined', getType(undefined), 'undefined');
test('Null', getType(null), 'object');

testBlock('allItemsHaveTheSameType');

test('All values are numbers', allItemsHaveTheSameType([11, 12, 13]), true);

test('All values are strings', allItemsHaveTheSameType(['11', '12', '13']), true);

test('All values are strings but wait', allItemsHaveTheSameType(['11', new String('12'), '13']), false);

// @ts-expect-error
test('Values like a number', allItemsHaveTheSameType([123, 123 / 'a', 1 / 0]), true);

test('Values like an object', allItemsHaveTheSameType([{}]), true);

testBlock('getTypesOfItems VS getRealTypesOfItems');

const knownTypes = [
    true,
    123,
    '123',
    [],
    {},
    () => {},
    undefined,
    null,
    NaN,
    Infinity,
    new Date(),
    new RegExp('\\w+'),
    new Set(),
    123n,
    Error(),
    Symbol('foo'),
    new Map(),
    new ArrayBuffer(0),
    new Blob(['<html>…</html>'], { type: 'text/html' }),
    function* () {}.constructor, // eslint-disable-line no-restricted-syntax, no-empty-function
];

test('Check basic types', getTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'object',
    'object',
    'function',
    'undefined',
    'object',
    'number',
    'number',
    'object',
    'object',
    'object',
    'bigint',
    'object',
    'symbol',
    'object',
    'object',
    'object',
    'function',
]);

test('Check real types', getRealTypesOfItems(knownTypes), [
    'boolean',
    'number',
    'string',
    'array',
    'object',
    'function',
    'undefined',
    'null',
    'NaN',
    'Infinity',
    'date',
    'regexp',
    'set',
    'bigint',
    'error',
    'symbol',
    'map',
    'buffer',
    'blob',
    'generator function',
]);

testBlock('everyItemHasAUniqueRealType');

test('All value types in the array are unique', everyItemHasAUniqueRealType([true, 123, '123']), true);

// @ts-expect-error
test('Two values have the same type', everyItemHasAUniqueRealType([true, 123, '123' === 123]), false);

test('There are no repeated types in knownTypes', everyItemHasAUniqueRealType(knownTypes), true);

testBlock('countRealTypes');

test('Count unique types of array items', countRealTypes([true, null, !null, !!null, {}]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

test('Counted unique types are sorted', countRealTypes([{}, null, true, !null, !!null]), [
    ['boolean', 3],
    ['null', 1],
    ['object', 1],
]);

testBlock('string literal VS String()');

test('All values are strings', allItemsHaveTheSameType(['123', String('123')]), true);

testBlock('areEqual');

test('Arrays are not equal', areEqual([1, null, 3], [1, undefined, 3]), false);

testBlock('Arrays');

// eslint-disable-next-line no-array-constructor
test('All values are arrays', allItemsHaveTheSameType([[1, 2, 3], Array(1, 2, 3), new Array(1, 2, 3)]), true);
