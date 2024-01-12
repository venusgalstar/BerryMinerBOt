import { createRequire } from 'module';
import * as anchor from "@project-serum/anchor";
const require = createRequire(import.meta.url);
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fs = require('fs');
const axios = require("axios");
const web3 = require('@solana/web3.js');

import fetch from "cross-fetch";
import { setMaxIdleHTTPParsers } from 'http';

dotenv.config()
const token = "6780323540:AAGbOQ0nwrcoFbq0WSieCwCXSnsveKxj1BU"
const bot = new TelegramBot(token, { polling: true })
const gifPath = './berry.png';
let chatId = '-1001995381972';
let nPrevSequenceNumber = 0;
let bBotStart = false;
let lastSignature = null;

const connection = new web3.Connection(
  web3.clusterApiUrl('devnet'),
  'confirmed',
);

const VAULT_SEED = "VAULT_SEED";

// The public key of the account you're interested in
const programId = new web3.PublicKey('4VUZQ2Tbx3BM9iq6DBH5fTk4oQ3iNZcC9qoUJUBhyyRs');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const asyncGetPda = async (
  seeds,
  programId
) => {
  const [pubKey, bump] = await web3.PublicKey.findProgramAddress(seeds, programId);
  return [pubKey, bump];
};

const getVaultKey = async () => {
  const [vaultKey] = await asyncGetPda(
    [Buffer.from(VAULT_SEED)],
    programId
  );
  return vaultKey;
};

bot.onText(/\/berry/, (msg) => {
  chatId = msg.chat.id;
  console.log("received!", chatId);
});

let msgCount = 0;

const ExecuteFunction = async () => {

  if (chatId == '') {
    return;
  }

  const signatures = await connection.getConfirmedSignaturesForAddress2(
    programId,
    {
      until: lastSignature,
      limit: 10,
    },
    'confirmed',
  );

  // console.log(signatures);
  let contractBalance;

  const vaultKey = await getVaultKey();
  contractBalance = await connection.getBalance(vaultKey)
  contractBalance = contractBalance / web3.LAMPORTS_PER_SOL;

  if (signatures) {
    const oldestToLatest = signatures.reverse();

    if (signatures.length == 0)
      return;
    try {
      lastSignature = oldestToLatest[oldestToLatest.length - 1].signature;
    } catch (e) {
      console.log("oldestToLatest[oldestToLatest.length - 1]", oldestToLatest);
    }

    console.log("lastSignature", lastSignature);


    for (let i = 0; i < oldestToLatest.length; i++) {
      const signature = oldestToLatest[i];
      const tx = await connection.getParsedTransaction(signature.signature, {
        commitment: "confirmed",
      });
      // console.log("tx", tx);
      // console.log("txffff", tx.transaction.message.accountKeys);
      let events;
      let accounts;

      try {
        events = tx.meta.logMessages;
        accounts = tx.transaction.message.accountKeys;
      } catch (e) {
        console.log(e);
        console.log(tx);
        continue;
      }

      let accountSigner = "";
      let command = "";
      let amount = "";
      let solAmount = (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / web3.LAMPORTS_PER_SOL;
      let idx = 0;

      for (idx = 0; idx < accounts.length; idx++) {
        if (accounts[idx].signer == true) {
          accountSigner = accounts[idx].pubkey.toString();
          break;
        }
      }

      idx = 0;

      while (idx < events.length) {

        if (events[idx].indexOf("BuyOranges") != -1) {
          
          command = "BuyOranges";
          let prefixAmount = "Program log: hatch new_miners: ";
          let idxj = idx+1;
          while (events[idxj].indexOf(prefixAmount) == -1 && idxj - 1 < events.length) {
            idxj++;
          }
          console.log("events[idxj + 1]", idxj, events[idxj]);
          amount = events[idxj ].substring(prefixAmount.length);

        } else if (events[idx].indexOf("HatchOranges") != -1) {

          command = "HatchOranges";
          let prefixAmount = "Program log: hatch new_miners: ";
          while (events[idx + 1].indexOf(prefixAmount) == -1 && idx - 1 < events.length) {
            idx++;
          }
          amount = events[idx + 1].substring(prefixAmount.length);
        } else {
          idx++;
          continue;
        }

        msgCount++;
        console.log("msgCount", msgCount);
        console.log("amount", amount);

        let msg = "🍓🍓 Berry Buy! 🍓🍓" +
          "\n\n";

        if (command == "BuyOranges") {
          msg += "New Buy!" + "\n\n";
        } else {
          msg += "Compounded !" + "\n\n";
        }

        // console.log("amount", amount);

        for (let j = 0; j < (amount / 100000000000000); j++) {
          msg += "🍓";
        }

        msg += "\n\n" +
          "<b>Buy:</b>" + " " + solAmount + " SOL for " + amount + " Berries\n" +
          "<b>TVL:</b>" + " " + contractBalance + " SOL\n" +
          "\n\n" +
          "<a href=\"https://solscan.io/tx/" + signature.signature + "?cluster=devnet\">Tx</a>" + " | " + "<a href=\"https://berryminer.xyz\">DAPP</a>" + " | " + "<a href=\"https://solscan.io/address/" + accountSigner + "?cluster=devnet\">Buyer</a>";

        // console.log("msg", msg);

        bot.sendVideo(chatId, gifPath, {
          caption: msg,
          parse_mode: 'HTML'
        });

        await sleep(2000);
        // console.log("signature", signature);
        idx++;
      }

    }
  }
}

if (bot.isPolling()) {
  await bot.stopPolling();
}

var interval = setInterval(function () {
  ExecuteFunction();
}, 3000);

// ExecuteFunction();

await bot.startPolling();

