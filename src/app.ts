// Based on https://www.digitalocean.com/community/tutorials/setting-up-a-node-project-with-typescript

import { createPublicClient, createWalletClient, getContract, http, Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { holesky } from 'viem/chains'

// This is how we tell TypeScript that PRIVATE_KEY will be available,
// and that it will be in the format it expects.
/*
declare var process : {
    env: {
      PRIVATE_KEY: `0x${string}`
    }
}
*/


// This is how we add the definitions in .env to process.env.
import * as dotenv from "dotenv";
dotenv.config()



const greeterAddress : Address = "0xB8f6460Dc30c44401Be26B0d6eD250873d8a50A6" 
const greeterABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_greeting",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "greeting",
                "type": "string"
            }
        ],
        "name": "SetGreeting",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "greet",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_greeting",
                "type": "string"
            }
        ],
        "name": "setGreeting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const


const publicClient = createPublicClient({ 
    chain: holesky, 
    transport: http(), 
}) 

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

const walletClient = createWalletClient({ 
    account,
    chain: holesky, 
    transport: http(), 
}) 


const greeter = getContract({
    address: greeterAddress,
    abi: greeterABI,
    client: { public: publicClient, wallet: walletClient }
})


console.log(`Current greeting:`, await greeter.read.greet())


const setGreeting = async (greeting: string): Promise<any> => {
    const txHash = await greeter.write.setGreeting([greeting]);
    console.log(`Working on a fix, see https://eth-holesky.blockscout.com/tx/${txHash}`)

    return txHash
}

greeter.watchEvent.SetGreeting({
    onLogs: logs => {
        console.log(`Address ${logs[0].args.sender} changed the greeting to ${logs[0].args.greeting}`)
        if (logs[0].args.sender != account.address)
            setGreeting(`${account.address} insists on it being Hello!`)
    }
})
