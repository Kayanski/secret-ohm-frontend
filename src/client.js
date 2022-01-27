import { SuggestLocalChain } from "./suggest-local";
import { SigningCosmWasmClient, CosmWasmClient } from "secretjs";
import mitt from "mitt";
const emitter = mitt();
let contracts = require("@/contract_data.json");

let signingClient = undefined;
let client = null;
let restUrl = undefined;
let accounts = undefined;
let chainId = undefined;

const SECONDS_BETWEEN_BLOCKS = 6;

export let rebasesPerDay = 3;

// Rebase Information
let localQueryStore = {
  tokenPrice: {},
  tokenInfo: {},
  contractInfo: {},
  bondPrice: {},
  bondTerms: {},
  debtRatio: {},
  balance: {},
  bondPurchased: {},
  pendingPayout: {},
  percentVestedFor: {},
  bondInfo: {},
};

let customGas = {
  stake: {
    amount: [{ amount: "250000", denom: "uscrt" }],
    gas: "250000",
  },
  unstake: {
    amount: [{ amount: "100000", denom: "uscrt" }],
    gas: "100000",
  },
};

//Utils
export function getAPYfromRebaseROI(roi, rebases = 3 * 365) {
  return (1 + roi) ** rebases - 1;
}

export function getContractFromName(contractName) {
  if (contractName in contracts) {
    return contracts[contractName][1];
  } else {
    console.log("Contract not found : ", contractName, contracts);
  }
}

export function getCodeHashFromName(contractName) {
  if (contractName in contracts) {
    return contracts[contractName][0];
  } else {
    console.log("Contract not found : ", contractName, contracts);
  }
}

//Rebase Information
export async function getRebaseHistory(page_size, page = null) {
  let tokenContract = contracts["sOHM"][1];
  let queryMsg = {
    rebase_history: { page_size: page_size, page: page },
  };
  let response = await client.queryContractSmart(
    tokenContract.contractAddress,
    queryMsg
  );
  return response;
}

export async function getIndex() {
  if (typeof localQueryStore.index === "undefined") {
    let tokenContract = contracts["sOHM"][1];
    let response = client.queryContractSmart(tokenContract.contractAddress, {
      index: {},
    });
    localQueryStore.index = response;
  }
  return (await localQueryStore.index).index.index;
}

export async function getCurrentIndex() {
  const index = await getIndex();
  let total_nb_rebase = await getRebaseHistory(0);
  total_nb_rebase = total_nb_rebase.rebase_history.total;
  let response = await getRebaseHistory(1, total_nb_rebase - 1);
  let first_rebase = response.rebase_history.rebases[0];

  if (first_rebase.id == 1) {
    return parseInt(index) / parseInt(first_rebase.index);
  }
  return null;
}

export async function getEpoch() {
  if (typeof localQueryStore.epoch === "undefined") {
    let stakingContract = contracts["staking"][1];
    let response = client.queryContractSmart(stakingContract.contractAddress, {
      epoch: {},
    });
    localQueryStore.epoch = response;
  }
  return await localQueryStore.epoch;
}

export async function getStakedCirculatingSupply() {
  let sOHMContract = contracts["sOHM"][1];
  if (typeof localQueryStore.circulatingSupply === "undefined") {
    let response = client.queryContractSmart(sOHMContract.contractAddress, {
      circulating_supply: {},
    });
    localQueryStore.circulatingSupply = response;
  }
  let decimals = await getDecimals("sOHM");
  return (
    parseInt(
      (await localQueryStore.circulatingSupply).circulating_supply
        .circulating_supply
    ) / Math.pow(10, decimals)
  );
}

export async function getRebaseAmount() {
  let epoch = await getEpoch();
  let circulating_supply = await getStakedCirculatingSupply();
  let decimals = await getDecimals("sOHM");
  return epoch.distribute / circulating_supply / Math.pow(10, decimals);
}

export async function getAPY(rebases = 3 * 365) {
  let rebaseAmount = await getRebaseAmount();
  return getAPYfromRebaseROI(rebaseAmount, rebases);
}

export async function getNextRewardAmount() {
  let tokenBalance = await getBalance("sOHM");
  let rebaseAPI = await getRebaseAmount();
  return tokenBalance * rebaseAPI;
}

// General
export async function getTotalValueDeposited() {
  if (typeof localQueryStore.totalValueDeposited === "undefined") {
    let stakingContract = contracts["staking"][1];
    let response = client.queryContractSmart(stakingContract.contractAddress, {
      contract_balance: {},
    });
    localQueryStore.totalValueDeposited = response;
  }
  let token_info = await getTokenInfo("sOHM");
  return (
    parseInt(
      (await localQueryStore.totalValueDeposited).contract_balance.amount
    ) / Math.pow(10, token_info.decimals)
  );
}

export async function getTotalValueDepositedInUSD() {
  let totalValueDeposited = await getTotalValueDeposited();
  let tokenPrice = await getTokenPriceInUSD("OHM");
  return totalValueDeposited * tokenPrice;
}

export async function getContractInfo(contractAddress) {
  if (typeof localQueryStore.contractInfo[contractAddress] === "undefined") {
    let response = await client.queryContractSmart(contractAddress, {
      contract_info: {},
    });
    localQueryStore.contractInfo[contractAddress] = response;
  }
  return (await localQueryStore.contractInfo[contractAddress]).contract_info;
}

export async function getDecimals(tokenName) {
  let token_info = await getTokenInfo(tokenName);
  return token_info.decimals;
}

export async function getTokenInfo(contractName) {
  let contractAddress = contracts[contractName][1].contractAddress;
  if (typeof localQueryStore.tokenInfo[contractAddress] === "undefined") {
    let response = await client.queryContractSmart(contractAddress, {
      token_info: {},
    });
    localQueryStore.tokenInfo[contractAddress] = response;
  }
  return (await localQueryStore.tokenInfo[contractAddress]).token_info;
}

export async function getTreasuryExcessReserves() {
  let contract = contracts["treasury"][1];
  let contract_info = await getContractInfo(contract.contractAddress);
  let decimals = await getDecimals("OHM");
  return contract_info.total_reserves / Math.pow(10, decimals);
}

export async function getTotalTreasuryReserves() {
  let contract = contracts["treasury"][1];
  let contract_info = await getContractInfo(contract.contractAddress);
  let decimals = await getDecimals("OHM");
  return contract_info.total_reserves / Math.pow(10, decimals);
}

export async function getTotalSupplyInUSD(contractName) {
  let total_supply = await getTotalSupply(contractName);
  let token_price = await getTokenPriceInUSD(contractName);
  return total_supply * token_price;
}

export async function getTotalSupply(contractName) {
  let token_info = await getTokenInfo(contractName);
  return token_info.total_supply / Math.pow(10, token_info.decimals);
}

export async function backingPerToken() {
  let treasury_reserves = await getTotalTreasuryReserves();
  let OHM_total_supply = await getTotalSupply("OHM");
  return treasury_reserves / OHM_total_supply;
}

export async function getCurrentBlockHeight() {
  if (typeof localQueryStore.currentBlockHeight === "undefined") {
    let response = await client.restClient.blocksLatest();
    localQueryStore.currentBlockHeight = response;
  }
  return parseInt(
    (await localQueryStore.currentBlockHeight).block.last_commit.height
  );
}

// Usual token interactions
export async function getTokenPrice(contractName, baseContractName) {
  let market_name = contractName + "-" + baseContractName;
  if (typeof localQueryStore.tokenPrice[market_name] === "undefined") {
    let contract = contracts[contractName][1];
    let baseContract = contracts[baseContractName][1];
    contract, baseContract;
    //let response = await client.queryContractSmart(contracts["secret-swap"], { "price": {contractAddress, baseContractAddress}});
    //return response.price;
    let price = 583.5;
    localQueryStore.tokenPrice[market_name] = parseFloat(price);
  }
  return localQueryStore.tokenPrice[market_name];
}

export async function getTokenPriceInUSD(contractName) {
  let token_price = await getTokenPrice(contractName, "sUST");
  return token_price;
}

//Bonds
export async function getBondPrice(bondName) {
  let bondContract = contracts[bondName][1];
  if (typeof localQueryStore.bondPrice[bondName] === "undefined") {
    let block_height = await getCurrentBlockHeight(client);
    const query = {
      bond_price: {
        block_height: block_height + 1,
      },
    };
    let bondAddress = bondContract.contractAddress;
    let response = client.queryContractSmart(bondAddress, query);
    localQueryStore.bondPrice[bondName] = response;
  }
  return (await localQueryStore.bondPrice[bondName]).bond_price.price / 100;
}

export async function getBondPriceInUSD(bondName) {
  let bondPrice = await getBondPrice(bondName);
  return bondPrice;
}

export async function bondYouWillGet(bondName, sendAmount) {
  let bondPrice = await getBondPriceInUSD(bondName);
  if (sendAmount == undefined) {
    sendAmount = 0;
  }
  return sendAmount / bondPrice;
}

export async function getBondTerms(bondName) {
  if (typeof localQueryStore.bondTerms[bondName] === "undefined") {
    const query = {
      bond_terms: {},
    };
    let bondAddress = contracts[bondName][1].contractAddress;
    let response = client.queryContractSmart(bondAddress, query);
    localQueryStore.bondTerms[bondName] = response;
  }
  return await localQueryStore.bondTerms[bondName];
}

export async function getBondPurchased(bondName) {
  if (typeof localQueryStore.bondPurchased[bondName] === "undefined") {
    let treasury = getContractFromName("treasury").contractAddress;
    let bondAddress = getContractFromName(bondName).contractAddress;
    const query = {
      total_bond_deposited: {
        token: bondAddress,
      },
    };
    let response = client.queryContractSmart(treasury, query);
    localQueryStore.bondPurchased[bondName] = response;
  }
  return (await localQueryStore.bondPurchased[bondName]).total_bond_deposited
    .amount;
}

export async function bondMaxYouCanBuy(bondName) {
  let bondTerms = await getBondTerms(bondName);
  return parseInt(bondTerms.max_payout);
}

export async function getBondROI(bondName) {
  let bondPrice = await getBondPriceInUSD(bondName);
  let tokenPrice = await getTokenPriceInUSD("OHM");
  return tokenPrice / bondPrice - 1;
}

export async function getBondVestingTerm(bondName) {
  let bondTerms = await getBondTerms(bondName);
  return bondTerms.vesting_term * SECONDS_BETWEEN_BLOCKS;
}

export async function getBondDebtRatio(bondName) {
  if (typeof localQueryStore.debtRatio[bondName] === "undefined") {
    let block_height = await getCurrentBlockHeight(client);
    const query = {
      standardized_debt_ratio: {
        block_height: block_height + 1,
      },
    };
    let bondAddress = contracts[bondName][1].contractAddress;
    let response = client.queryContractSmart(bondAddress, query);
    localQueryStore.debtRatio[bondName] = response;
  }
  return (await localQueryStore.debtRatio[bondName]).standardized_debt_ratio
    .ratio;
}
// User bond balances

export async function getPercentVestedFor(bondName) {
  if (typeof localQueryStore.percentVestedFor[bondName] === "undefined") {
    let bondAddress = getContractFromName(bondName).contractAddress;
    let block_height = await getCurrentBlockHeight(client);
    let keplr = await getKeplr();
    let apiKey = await keplr.getSecret20ViewingKey(chainId, bondAddress);
    const query = {
      percent_vested_for: {
        address: await getUserAddress(),
        block_height: block_height,
        key: apiKey,
      },
    };
    let response = client.queryContractSmart(bondAddress, query);
    localQueryStore.percentVestedFor[bondName] = response.catch(
      (localQueryStore.percentVestedFor[bondName] = undefined)
    );
  }
  return (await localQueryStore.percentVestedFor[bondName]).percent_vested_for
    .percent;
}

export async function getBondInfo(bondName) {
  if (typeof localQueryStore.bondInfo[bondName] === "undefined") {
    let bondAddress = getContractFromName(bondName).contractAddress;
    let keplr = await getKeplr();
    let apiKey = await keplr.getSecret20ViewingKey(chainId, bondAddress);
    const query = {
      bond_info: {
        address: await getUserAddress(),
        key: apiKey,
      },
    };
    let response = client.queryContractSmart(bondAddress, query);
    localQueryStore.bondInfo[bondName] = response;
  }
  return (await localQueryStore.bondInfo[bondName]).bond;
}

export async function getPendingPayout(bondName) {
  let bondInfo = await getBondInfo(bondName);
  let decimals = await getDecimals("OHM");
  let payout = bondInfo.payout / Math.pow(10, decimals);
  return payout;
}

export async function getClaimablePayout(bondName) {
  let payout = await getPendingPayout(bondName);
  let percent_vested = await getPercentVestedFor(bondName);
  let claimable_payout = (payout * percent_vested) / 10_000;
  return claimable_payout;
}

export async function getBondTimeRemaining(bondName) {
  let bondInfo = await getBondInfo(bondName);
  let percent_vested = await getPercentVestedFor(bondName);
  return (
    bondInfo.vesting * (1 - percent_vested / 10_000) * SECONDS_BETWEEN_BLOCKS
  );
}

//Stake
export async function getCurrentEpoch() {
  if (typeof localQueryStore.epoch === "undefined") {
    let response = client.queryContractSmart(
      contracts["staking"][1].contractAddress,
      { epoch: {} }
    );
    localQueryStore.epoch = response;
  }
  return await localQueryStore.epoch;
}

export async function timeTillNextRebase() {
  let epoch = await getCurrentEpoch();
  let current_block = await getCurrentBlockHeight(client);
  let timestamp = (epoch.end_block - current_block) * SECONDS_BETWEEN_BLOCKS;
  return timestamp;
}

// Executes
export async function stake(amount) {
  let stakingHelper = getContractFromName("staking-helper");
  let stakingHelperCodeHash = getCodeHashFromName("staking-helper");
  let OHMContract = getContractFromName("OHM");
  let decimals = await getDecimals("OHM");
  let send_amount = parseFloat(amount) * Math.pow(10, decimals);
  if (isNaN(send_amount)) {
    throw "Staking amount is nan";
  }
  let handleMsg = {
    send: {
      recipient: stakingHelper.contractAddress,
      recipient_code_hash: stakingHelperCodeHash,
      amount: String(send_amount),
      msg: Buffer.from(
        JSON.stringify({ stake: { recipient: await getUserAddress() } })
      ).toString("base64"),
    },
  };
  let response = await signingClient.execute(
    OHMContract.contractAddress,
    handleMsg,
    "",
    [],
    customGas.stake
  );
  console.log("Staked some OHM", response);
  return response;
}

export async function unstake(amount) {
  let staking = getContractFromName("staking");
  let stakingCodeHash = getCodeHashFromName("staking");
  let sOHMContract = getContractFromName("sOHM");
  let decimals = await getDecimals("sOHM");
  let send_amount = parseFloat(amount) * Math.pow(10, decimals);
  if (isNaN(send_amount)) {
    throw "Unstaking amount is nan";
  }
  // Stake
  let handleMsg = {
    send: {
      recipient: staking.contractAddress,
      recipient_code_hash: stakingCodeHash,
      amount: String(send_amount),
      msg: Buffer.from(
        JSON.stringify({
          unstake: {
            trigger: false,
          },
        })
      ).toString("base64"),
    },
  };
  let response = await signingClient.execute(
    sOHMContract.contractAddress,
    handleMsg,
    "",
    [],
    customGas.unstake
  );
  console.log("Unstaked some sOHM", response);
  return response;
}

export async function bond(bondName, amount, bondPrice) {
  if (!amount) {
    throw "Bonding amount is NaN";
  }
  let bondContract = getContractFromName(bondName);
  let bondCodeHash = getCodeHashFromName(bondName);
  let principleContract = getContractFromName(bondContract.principle);
  let decimals = await getDecimals(bondContract.principle);

  let send_amount = parseFloat(amount) * Math.pow(10, decimals);
  let handleMsg = {
    send: {
      recipient: bondContract.contractAddress,
      recipient_code_hash: bondCodeHash,
      amount: String(send_amount),
      msg: Buffer.from(
        JSON.stringify({
          deposit: {
            max_price: String(bondPrice),
            depositor: await getUserAddress(),
          },
        })
      ).toString("base64"),
    },
  };

  let response = await signingClient.execute(
    principleContract.contractAddress,
    handleMsg
  );
  return response;
}

export async function redeem(bondName, stake) {
  let bondContract = getContractFromName(bondName);

  let handleMsg = {
    redeem: {
      recipient: await getUserAddress(),
      stake: stake,
    },
  };

  let response = await signingClient.execute(
    bondContract.contractAddress,
    handleMsg
  );
  return response;
}

// General functions
export async function getKeplr() {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event) => {
      if (event.target && event.target.readyState === "complete") {
        resolve(window.keplr);

        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
}

export async function getUserAddress() {
  if (accounts == undefined) {
    await initSigningClient();
  }
  return accounts[0].address;
}

export function getUserAddressSync() {
  if (accounts == undefined) {
    return "";
  }
  return accounts[0].address;
}

export async function getUserAddressText() {
  let address = await getUserAddress();
  return (
    address.substring(0, 9) + "..." + address.substring(address.length - 3)
  );
}

export async function getBalance(contractName) {
  // Query balance with the api key
  if (typeof localQueryStore.balance[contractName] === "undefined") {
    let contract = getContractFromName(contractName);
    let keplr = await getKeplr();
    let apiKey = await keplr.getSecret20ViewingKey(
      chainId,
      contract.contractAddress
    );
    const balanceQuery = {
      balance: {
        key: apiKey,
        address: await getUserAddress(),
      },
    };
    let response = client.queryContractSmart(
      contract.contractAddress,
      balanceQuery
    );
    localQueryStore.balance[contractName] = response;
  }
  let token_info = await getTokenInfo(contractName);
  let raw_balance = await localQueryStore.balance[contractName];
  return (
    parseInt(raw_balance.balance.amount) /
    Math.pow(10, parseInt(token_info.decimals))
  );
}

export async function getBalanceInUSD(contractName) {
  let balance = await getBalance(contractName);
  let price = await getTokenPriceInUSD(contractName);
  return balance * price;
}

export async function getCurrentWealth(options) {
  let price = await getTokenPriceInUSD("OHM");
  return options.amount * price;
}

export function getSigningClient() {
  return signingClient;
}

export function getClient() {
  return client;
}

export async function initSigningClient() {
  SuggestLocalChain();

  let keplr = await getKeplr();
  //We need to enable Keplr to be sure the client is connected (as per the docs)
  keplr.enable(chainId);

  const offlineSigner = keplr.getOfflineSigner(chainId);

  const enigmaUtils = window.getEnigmaUtils(chainId);

  // XXX: This line is needed to set the sender address for SigningCosmosClient.
  accounts = await offlineSigner.getAccounts().catch(console.log);

  signingClient = new SigningCosmWasmClient(
    restUrl,
    accounts[0].address,
    offlineSigner,
    enigmaUtils
  );
  emitter.emit("KeplrConnected");
}

export async function initClient() {
  client = new CosmWasmClient(restUrl);
}

export default {
  install(app, options) {
    restUrl = options.restUrl;
    chainId = options.chainId;
    console.log("install");
    initClient();
  },
};
