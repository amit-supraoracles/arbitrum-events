const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const abi = require('./contract-abi.json');

const eventName = 'RequestGenerated';
const eventName2 = 'NonceProcessed';

const contractAddress = process.env.ROUTER_CONTRACT;

const web3 = new Web3(process.env.RPC_ARBIITRUM);
const contract = new web3.eth.Contract(abi, contractAddress);

const outputFileName = 'requestData_5000.json';
let outputData = {};

async function request() {
  try {
    const events = await contract.getPastEvents(eventName, {
      fromBlock: 11201483,
      toBlock: 'latest'
    });

    const result = await events;
    console.log("\nNo. of transactions", result.length);

    for (let loop = 0; loop < result.length; loop++) {
      let txHash = result[loop].transactionHash;
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
      console.log("###### TIMESTAMP :::", timestamp);
      console.log("############################################");

      // Store data in output object
      const nonce = result[loop].returnValues.nonce;
      if (!outputData[nonce]) {
        outputData[nonce] = [];
      }
      outputData[nonce].push({
        txHash,
        blockNumber: result[loop].blockNumber,
        rngCount: result[loop].returnValues.rngCount,
        callerContract: result[loop].returnValues.callerContract,
        gasUsed: receipt.gasUsed,
        fee,
        timestamp,
      });
    }

    // Write output to file
    const outputFilePath = path.join(__dirname, outputFileName);
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2));
    console.log(`Output written to ${outputFilePath}`);

  } catch (error) {
    console.log(error);
  }
}

request();

