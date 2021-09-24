// The following is a translation of the TypeScript async awaiter which uses generators and yields.
// For Lua we use coroutines instead.
//
// Source:
//
// var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
//     function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
//     return new (P || (P = Promise))(function (resolve, reject) {
//         function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
//         function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
//         function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
//         step((generator = generator.apply(thisArg, _arguments || [])).next());
//     });
// };
//

// eslint-disable-next-line @typescript-eslint/promise-function-async
function __TS__AsyncAwaiter(this: void, generator: (this: void) => void) {
    return new Promise((resolve, reject) => {
        const asyncCoroutine = coroutine.create(generator);

        // eslint-disable-next-line @typescript-eslint/promise-function-async
        function adopt(value: unknown) {
            return value instanceof __TS__Promise ? value : Promise.resolve(value);
        }
        function fulfilled(value) {
            const [success, resultOrError] = coroutine.resume(asyncCoroutine, value);
            if (success) {
                step(resultOrError);
            } else {
                reject(resultOrError);
            }
        }
        function step(result: unknown) {
            if (coroutine.status(asyncCoroutine) === "dead") {
                resolve(result);
            } else {
                adopt(result).then(fulfilled, reason => reject(reason));
            }
        }
        const [success, resultOrError] = coroutine.resume(asyncCoroutine);
        if (success) {
            step(resultOrError);
        } else {
            reject(resultOrError);
        }
    });
}

function __TS__Await(this: void, thing: unknown) {
    return coroutine.yield(thing);
}
