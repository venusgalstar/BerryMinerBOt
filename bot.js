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

const IDL = {
  "version": "0.1.0",
  "name": "baked_beans",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "buyOranges",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sellOranges",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "hatchOranges",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "referral",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "referralState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setConfig",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startMine",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setTreasury",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setAdmin",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "key",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "marketOranges",
            "type": "u64"
          },
          {
            "name": "devFee",
            "type": "u64"
          },
          {
            "name": "psn",
            "type": "u64"
          },
          {
            "name": "psnh",
            "type": "u64"
          },
          {
            "name": "orangesPerMiner",
            "type": "u64"
          },
          {
            "name": "isStarted",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "lastHatchTime",
            "type": "u64"
          },
          {
            "name": "claimedOranges",
            "type": "u64"
          },
          {
            "name": "miners",
            "type": "u64"
          },
          {
            "name": "referral",
            "type": "publicKey"
          },
          {
            "name": "referralSet",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotAllowedAuthority",
      "msg": "Not allowed authority"
    },
    {
      "code": 6001,
      "name": "NotStarted",
      "msg": "Not yet started"
    },
    {
      "code": 6002,
      "name": "InsufficientAmount",
      "msg": "Should be over minimum amount"
    },
    {
      "code": 6003,
      "name": "IncorrectUserState",
      "msg": "Incorrect User State"
    },
    {
      "code": 6004,
      "name": "IncorrectReferral",
      "msg": "Incorrect Referral Pubkey"
    }
  ]
};

const getProgram = (wallet) => {
  let provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  );
  const program = new anchor.Program(IDL, Constants.PROGRAM_ID, provider);
  return program;
};

const getGlobalStateData = async (wallet) => {
  const program = getProgram(wallet);
  const globalStateKey = await keys.getGlobalStateKey();
  console.log("globalStateKey =", globalStateKey.toString());
  const stateData = await program.account.globalState.fetchNullable(
    globalStateKey
  );
  if (stateData === null) return null;
  return stateData;
};

function calculateTrade(rt, rs, bs, PSN, PSNH) {
  if (rt.toNumber() === 0) return new BN(0);
  console.log('calcTrade');
  console.log(rt.toNumber());
  console.log(rs.toNumber());
  console.log(bs.toNumber());
  console.log(PSN.toNumber());
  console.log(PSNH.toNumber());
  let x = PSN.mul(bs);
  let y = PSNH.add(PSN.mul(rs).add(PSNH.mul(rt)).div(rt));
  console.log('calcTrade');
  console.log(x.toNumber());
  console.log(y.toNumber());
  return x.div(y);
}

const getUserData = async (wallet) => {
  if (wallet.publicKey === null || wallet.publicKey === undefined) return null;
  console.log("getUserData");
  const program = getProgram(wallet);
  
  const vaultKey = await keys.getVaultKey();
  const vaultBal = await connection.getBalance(vaultKey);

  let userStateKey = await keys.getUserStateKey(wallet.publicKey);
  
  const stateData = await program.account.userState.fetchNullable(
    userStateKey
  );
  if (stateData === null) return null;

  const globalStateKey = await keys.getGlobalStateKey();
  const globalData = await program.account.globalState.fetchNullable(
    globalStateKey
  );
  if (globalData === null) return null;
  // getOrangesSinceLastHatch
  let secondsPassed = Math.min(globalData.orangesPerMiner.toNumber(), Date.now()/1000 - stateData.lastHatchTime.toNumber());
  console.log('stateData.claimedOranges.toNumber() =', stateData.claimedOranges.toNumber());
  console.log('secondsPassed =', secondsPassed);
  console.log("userStateKey =", userStateKey.toBase58());
  console.log('stateData =', stateData);
  console.log('stateData.user =', stateData.user.toBase58());
  console.log('stateData.miners =', stateData.miners.toNumber());
  let myOranges = stateData.claimedOranges.add(new BN(secondsPassed).mul(stateData.miners));
  console.log('myOranges =', myOranges.toNumber());
  console.log('globalData.marketOranges =', globalData.marketOranges.toNumber());
  console.log('new BN(vaultBal) =', new BN(vaultBal).toNumber());
  let beanRewards = calculateTrade(myOranges, globalData.marketOranges, new BN(vaultBal), globalData.psn, globalData.psnh);

  return {
    miners: stateData.miners.toString(),
    beanRewards: new BigNumber(beanRewards.toString()).div(
      LAMPORTS_PER_SOL
    ).toString()
  }
};

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
          let prefix = "Program log: calculate_trade x ";
          while (events[idx + 1].indexOf(prefix) == -1)
            idx++;
          amount = events[idx + 1].substring(prefix.length);

        } else if (events[idx].indexOf("HatchOranges") != -1) {
          command = "HatchOranges";
          let prefix = "Program log: hatch ctx.accounts.user_state.claimed_oranges : ";
          while (events[idx + 1].indexOf(prefix) == -1)
            idx++;
          amount = events[idx + 1].substring(prefix.length);

        } else {
          idx++;
          continue;
        }

        msgCount++;
        console.log("msgCount", msgCount);

        let msg = "🍓🍓 Berry Buy! 🍓🍓" +
          "\n\n";

        if( command == "BuyOranges" ){
          msg+= "New Buy!"+"\n\n";
        }else{
          msg+= "Compounded !"+"\n\n";
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

        await sleep(1000);
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
}, 5000);

// ExecuteFunction();

await bot.startPolling();

