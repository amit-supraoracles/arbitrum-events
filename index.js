const Web3 = require('web3');
require('dotenv').config()
const abi = require('./contract-abi.json');

const eventName = 'RequestGenerated';
const contractAddress = process.env.ROUTER_CONTRACT;
const web3 = new Web3(process.env.RPC_ARBIITRUM);
const contract = new web3.eth.Contract(abi, contractAddress);

async function test() {
  try {
    const events = await contract.getPastEvents(eventName, {
      fromBlock: 11078738,
      toBlock: 'latest'
    });

    const result = await events;
    console.log("\nNo. of transactions",result.length);
    
    for(let loop=0; loop < result.length; loop++){
      let txHash = result[loop].transactionHash
      const tx = await web3.eth.getTransaction(txHash);
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      const fee = web3.utils.fromWei((tx.gasPrice * receipt.gasUsed).toString(), 'ether');
      const block = await web3.eth.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;
      console.log("\n");
      console.log("###### NONCE :::", result[loop].returnValues.nonce);
      console.log("###### TX HASH :::", txHash);
      console.log("###### BLOCK NUMBER :::", result[loop].blockNumber);
      console.log("###### RNG COUNT :::", result[loop].returnValues.rngCount);
      console.log("###### CALLER CONTRACT :::", result[loop].returnValues.callerContract);
      console.log("###### GAS USED IN TX:::", receipt.gasUsed);
      console.log("###### TX FEE :::", fee);
      console.log("###### TIMESTAMP :::",timestamp);
      console.log("############################################");
    }
  } catch (error) {
    console.log(error);
  }

}

test();



/**
    Fetch each 10K block
    Create DB schema and push entries


*/



// REQUEST :   nonce, tx_hash, request_block, count, caller_contract, request_timestamp, tx_fee, gas_used
// RESPONSE : tx_hash, response_block, fullfill timestamp, client_contract, tx_fee, gas_used


// condition