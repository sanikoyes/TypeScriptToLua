// https://tc39.github.io/ecma262/#sec-object.assign
// eslint-disable-next-line @typescript-eslint/ban-types
function __TS__ObjectAssign<T extends object>(this: void, to: T, ...sources: object[]): T {
    if (to === undefined) {
        return to;
    }

    for (const source of sources) {
        for (const key in source) {
            to[key] = source[key];
        }
    }

    return to;
}
