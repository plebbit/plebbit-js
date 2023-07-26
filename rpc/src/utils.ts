import {randomInt} from 'crypto'

// don't pass stateful objects to JSON RPC
export const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

const maxRandomInt = 281474976710655
export const generateSubscriptionId = () => randomInt(1, maxRandomInt)
