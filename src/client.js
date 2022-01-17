import { SuggestLocalChain } from "./suggest-local";
import { SigningCosmWasmClient, CosmWasmClient } from "secretjs";
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
};

//Utils

export function getAPYfromRebaseROI(roi, rebases = 3 * 365) {
  return (1 + roi) ** rebases;
}

export function getContractFromName(contractName) {
  if (contractName in contracts) {
    return contracts[contractName][1];
  } else {
    console.log(contractName, contracts);
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

export async function getNextRewardAmount(){
  let tokenBalance = await getBalance("sOHM");
  let rebaseAPI = await getRebaseAmount();
  return tokenBalance*rebaseAPI;
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
    let price = 583;
    localQueryStore.tokenPrice[market_name] = parseInt(price);
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
  let principleInfo = await getTokenInfo(bondContract.principle);
  return (
    (await localQueryStore.bondPrice[bondName]).bond_price.price /
    Math.pow(10, principleInfo.decimals)
  );
}

export async function getBondPriceInUSD(bondName) {
  let bondPrice = await getBondPrice(bondName);
  let bondContract = contracts[bondName][1];
  let tokenPrice = await getTokenPriceInUSD(bondContract.principle);
  return bondPrice * tokenPrice;
}

export async function bondYouWillGet(bondName, sendAmount) {
  let bondPrice = await getBondPriceInUSD(bondName);
  if (sendAmount == undefined) {
    sendAmount = 0;
  }
  return bondPrice * sendAmount;
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
  return bondTerms;
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
  return parseInt(
    (await localQueryStore.debtRatio[bondName]).standardized_debt_ratio.ratio
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
  return (epoch.end_block - current_block) * SECONDS_BETWEEN_BLOCKS;
}

// General functions

export function keplrConnected() {
  console.log("updated keplrConncted");
  return signingClient != undefined;
}

export function getUserAddress() {
  return accounts[0].address;
}

export function getUserAddressText() {
  let address = getUserAddress();
  return (
    address.substring(0, 9) + "..." + address.substring(address.length - 3)
  );
}

export async function getBalance(contractName) {
  // Query balance with the api key
  if (typeof localQueryStore.balance[contractName] === "undefined") {
    let contract = getContractFromName(contractName);
    let apiKey = await window.keplr.getSecret20ViewingKey(
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
  return raw_balance.balance.amount / Math.pow(10, token_info.decimals);
}

export async function getBalanceInUSD(contractName){
  let balance = await getBalance(contractName);
  let price = await getTokenPriceInUSD(contractName);
  return balance*price;
}

export async function getCurrentWealth(options){
  let price = await getTokenPriceInUSD("OHM");
  return options.amount*price;
}

export function getSigningClient() {
  return signingClient;
}

export function getClient() {
  return client;
}

export async function initSigningClient() {
  SuggestLocalChain();

  //We need to enable Keplr to be sure the client is connecte (as per the docs)
  window.keplr.enable(chainId);

  const offlineSigner = window.keplr.getOfflineSigner(chainId);

  // XXX: This line is needed to set the sender address for SigningCosmosClient.
  accounts = await offlineSigner.getAccounts().catch(console.log);

  signingClient = new SigningCosmWasmClient(
    restUrl,
    accounts[0].address,
    offlineSigner
  );
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
