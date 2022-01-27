/*!

=========================================================
* Vue Argon Dashboard - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/vue-argon-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/vue-argon-dashboard/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ArgonDashboard from "./plugins/argon-dashboard";
import "element-plus/lib/theme-chalk/index.css";
import "@popperjs/core";
import Notifications from "@kyvg/vue3-notification";
import KeplrClient from "./client";
import { getContractFromName, getUserAddressSync } from "./client";
const appInstance = createApp(App);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.use(Notifications);

const keplrOptions = {
  //restUrl: "http://testnet.securesecrets.org:1317/",
  restUrl: "https://api.ovaldao.space/rest/",
  chainId: "pulsar-2",
};

/*
const keplrOptions = {
  restUrl: "http://localhost:1337",
  chainId: "enigma-pub-testnet-3",
};
*/

appInstance.use(KeplrClient, keplrOptions);
/* Global variables */

appInstance.config.globalProperties.catchError = function (
  actionTaken,
  error,
  additional_info = "",
  duration=-1
) {
  let readableText = "Error when " + actionTaken;
  console.log(readableText + " : \n" + error);
  this.$notify({
    title: readableText,
    text: `${error}<br/>
            ${additional_info}`,
    type: "error",
    duration: duration,
    speed: 1000,
  });
  //errorMessage(actionTaken);
};

appInstance.config.globalProperties.expressSuccess = function (message) {
  this.$notify({
    title: "Transaction succeeded",
    text: message,
    type: "success",
    duration: -1,
    speed: 500,
  });
};
let tokenName = "OHM";
let tokenProperties = {
  tokenName: tokenName,
  sTokenName: "sOHM",
  chainId: "pulsar-2",
  bonds: [
    {
      icons: ["img/theme/token-img.jpg", "img/theme/token-img.jpg"],
      name: "sUST-bond",
      principle: "sUST",
      id: "sust",
      contractAddress: "secretnothing189765",
    },
    {
      icons: ["img/theme/token-img.jpg"],
      name: "sUST-bond",
      principle: "sUST",
      id: "sustohmLP",
      contractAddress: "secretnothing189765",
    },
  ],
  secretswapTokenLink() {
    let tokenAddress = getContractFromName(tokenName).contractAddress;
    let sUSTAddress = getContractFromName("sUST").contractAddress;
    return `https://app.secretswap.io/swap?inputCurrency=${tokenAddress}&outputCurrency=${sUSTAddress}`;
  },

  async suggestToken(contractAddress) {
    return window.keplr.suggestToken(this.chainId, contractAddress);
  },
  async suggestMainToken() {
    let contractAddress = getContractFromName(tokenName).contractAddress;
    await this.suggestToken(contractAddress).catch();
  },
  async suggestSToken() {
    let contractAddress = getContractFromName("sOHM").contractAddress;
    await this.suggestToken(contractAddress).catch();
  },

  getBondById(id) {
    return this.bonds.find((element) => element.id === id);
  },
  getBondByName(name) {
    return this.bonds.find((element) => element.name === name);
  },

  //Computations for the Calculator view
  getRebaseROIfromAPY(apy) {
    return Math.exp(Math.log(1 + apy / 100) / 365 / 3) - 1;
  },
  getAPYfromRebaseROI(roi, rebases) {
    return (1 + roi) ** rebases;
  },
  async getInitialInvestment(options) {
    return options.amount * options.purchasePrice;
  },
  async getRewardsEstimation(options) {
    var rebaseROI = this.getRebaseROIfromAPY(options.apy);
    return (
      options.amount * this.getAPYfromRebaseROI(rebaseROI, 3 * options.nbDays)
    );
  },
  async getPotentialReturn(options) {
    let reward_estimations = await this.getRewardsEstimation(options);
    return (
      reward_estimations * options.futurePrice -
      options.amount * options.purchasePrice
    );
  },
  async getCurrentWealth(options) {
    return options.balance * options.purchasePrice;
  },
  hrefToTxHash(hash) {
    return `https://secretnodes.com/secret/chains/${keplrOptions.chainId}/transactions/${hash}`;
  },
  hrefToAddress(address) {
    return `https://secretnodes.com/secret/chains/${keplrOptions.chainId}/accounts/${address}`;
  },
  linkToTxHash(hash, text = "Check out the transaction here") {
    let link = `<a href="${this.hrefToTxHash(hash)}" target="_blank">
          ${text} <i class="fas fa-external-link-alt"></i>
      </a>`;
    return link;
  },
  linkToAddress(address, text = "More info on your secretnodes page") {
    if(address==undefined){
      address = getUserAddressSync();
    }
    let link = `<a target="_blank" href="${this.hrefToAddress(address)}">
    ${text} <i class="fas fa-external-link-alt"></i>
    </a>`;
    return link;
  },
};
Object.assign(appInstance.config.globalProperties, tokenProperties);

appInstance.mount("#app");
