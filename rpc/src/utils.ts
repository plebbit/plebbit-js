// don't pass stateful objects to JSON RPC
export const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

export const generateSubscriptionId = () => Math.floor(1000000 * Math.random())
