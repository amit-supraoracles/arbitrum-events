const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const abi = require('./contract-abi.json');

const eventName2 = 'NonceProcessed';

const contractAddress = process.env.ROUTER_CONTRACT;
const web3 = new Web3(process.env.RPC_ARBIITRUM);
const contract = new web3.eth.Contract(abi, contractAddress);

async function response() {
  try {
    const outputFileName = 'response_25_nov_to_13_March.json';
    let output = {};
   
    // ########## 5:30 PM ####### 11222624 

    for (let fromBlock = 1732742; fromBlock <= 11222624; fromBlock += 10000) {
      
      let toBlock = fromBlock + 9999;
      
      if (toBlock > 11222624) {
        toBlock = 'latest';
      }

      const events = await contract.getPastEvents(eventName2, {
        fromBlock,
        toBlock
      });

      const result = await events;
      console.log("\nNo. of transactions", result.length);

      for (let loop = 0; loop < result.length; loop++) {
        let txHash = result[loop].transactionHash
        const tx = await web3.eth.getTransaction(txHash);
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const fee = web3.utils.fromWei((tx.gasPrice * receipt.gasUsed).toString(), 'ether');
        const block = await web3.eth.getBlock(receipt.blockNumber);
        const timestamp = block.timestamp;

        const nonce = result[loop].returnValues.nonce;

        console.log('\n')
        console.log("###### NONCE :::", nonce);
        // console.log("###### TX HASH :::", txHash);
        // console.log("###### GAS USED IN TX:::", receipt.gasUsed);
        // console.log("###### TX FEE :::", fee);
        // console.log("###### BLOCK NUMBER :::", result[loop].blockNumber);
        // console.log("###### TIMESTAMP :::", timestamp);
        // console.log("############################################");

        if (!output[nonce]) {
          output[nonce] = [];
        }

        output[nonce].push({
          "transactionHash":txHash,
          "gasUsed": receipt.gasUsed,
          "txFee": fee,
          "blockNumber": result[loop].blockNumber,
          "timestamp": timestamp
        });

        
      }
    }

    const outputFile = path.join(__dirname, outputFileName);
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`Output written to ${outputFile}`);

  } catch (error) {
    console.log(error);
  }
}

response();
