<template>
  <div class="row balance">
    <div class="col">
      <span
        v-if="type == 'private' && viewingKey == null"
        class="view-balance-button"
        @click="addViewingKey"
      >
        🔍 {{ placeHolder }}
      </span>
      <span v-else-if="infoText != null">
        {{ infoText }}
      </span>

      <span v-else class="info-not-arrived"> </span>
    </div>
  </div>
</template>

<script>
import * as KeplrClient from "@/client";

function formatNumber(number, decimals) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatDollars(number, decimals, currency = "USD") {
  return number.toLocaleString(undefined, {
    currency: currency,
    style: "currency",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatToken(number, decimals, tokenName) {
  return `${formatNumber(number, decimals)} ${tokenName}`;
}

function formatPercent(number, decimals = 2) {
  return number.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default {
  name: "info-field",
  data() {
    return {
      infoText: undefined,
      viewingKey: null,
      contract: undefined,
      type: "public",
      placeHolder:"undefined",
    };
  },
  props: {
    infoId: {
      type: String,
      description: "Promise of the query of the info",
      default: undefined,
    },
    options: {
      type: Object,
      description: "Optional arguments to the query",
      default: undefined,
    },
  },
  mounted() {
    this.updateText();
    if(this.type == "private"){
      // For private info, we test if there is a viewing key stored
      this.contract = KeplrClient.getContractFromName(
        this.options.contractName
      );
      window.keplr
        .getSecret20ViewingKey(this.chainId, this.contract.contractAddress)
        .then(() => (this.viewingKey = true))
        .catch(() => (console.log("Error fetching viewingKey")));
      }
  },
  watch:{
    viewingKey: function(){
      this.updateText();
    },
    options: function(){
      this.updateText();
      console.log("options changed")
    }
  },
  methods: {
    addViewingKey() {
      let contract = KeplrClient.getContractFromName(this.options.contractName);
      this.suggestToken(contract.contractAddress)
      .then(() => {
        this.expressSuccess(this.options.contractName + " successfully addded")
        this.viewingKey = true;
      })
      .catch((error) => this.catchError("creating a ViewingKey for " + this.options.contractName, error));;
    },
    updateText(){
      let infoTextPromise = undefined;
      switch (this.infoId) {
        //General Info
        case "token-price":
          infoTextPromise = KeplrClient.getTokenPriceInUSD(
            this.options.tokenName
          );
          break;
        case "treasury-balance":
          infoTextPromise = KeplrClient.getTotalTreasuryReserves();
          break;
        case "market-cap":
          infoTextPromise = KeplrClient.getTotalSupplyInUSD(this.tokenName);
          break;
        case "circulating-supply-total":
          infoTextPromise = KeplrClient.getStakedCirculatingSupply();
          break;
        case "backing-per-token":
          infoTextPromise = KeplrClient.backingPerToken();
          break;
        case "current-index":
          infoTextPromise = KeplrClient.getCurrentIndex();
          break;

        //Bond Info 
        case "bond-you-will-get":
          infoTextPromise = KeplrClient.bondYouWillGet(
            this.options.bondName,
            this.options.amount
          );
          break;
        /*
          // User specific, Will have to do a special container for that (with secret keys)
          case "pending-rewards":
            infoTextPromise = KeplrClient.getPendingRewards(this.options.bondName);
            break;
          case "claimable-rewards":
            infoTextPromise = this.bondClaimableRewards(this.options.bondName);
            break;
          case "bond-time-remaining":
            infoTextPromise = this.bondTimeRemaining(this.options.bondName);
            break; 
        */
        case "max-you-can-buy-bond":
          infoTextPromise = KeplrClient.bondMaxYouCanBuy(this.options.bondName);
          break;
        case "bond-roi":
          infoTextPromise = KeplrClient.getBondROI(this.options.bondName);
          break;
        case "bond-debt-ratio":
          infoTextPromise = KeplrClient.getBondDebtRatio(this.options.bondName);
          break;

        case "bond-vesting-term":
          infoTextPromise = KeplrClient.getBondVestingTerm(this.options.bondName);
          break;
        case "bond-price":
          infoTextPromise = KeplrClient.getBondPrice(this.options.bondName);
          break;

        //Stake Info
        case "apy":
          infoTextPromise = KeplrClient.getAPY();
          break;
        case "total-value-deposited":
          infoTextPromise = KeplrClient.getTotalValueDeposited();
          break;

        case "time-till-next-rebase":
          infoTextPromise = KeplrClient.timeTillNextRebase();
          break;

        //User Info
        case "token-balance":
          infoTextPromise = KeplrClient.getBalance(this.options.contractName);
          this.type="private"
          this.placeHolder = "View Balance"
          break;
          //User sepcific queries, needs viewing keys
        case "next-reward-amount":
          infoTextPromise = KeplrClient.getNextRewardAmount();
          this.type="private"
          this.placeHolder = "View Staking Info"
          break;

        case "next-reward-yield":
          infoTextPromise = KeplrClient.getRebaseAmount()
          break;

        case "staking-roi":
          infoTextPromise = KeplrClient.getAPY(KeplrClient.rebasesPerDay * 5);
          break;

        //Calculator Info
        case "initial-investment":
          infoTextPromise = this.getInitialInvestment(this.options);
          break;
        case "rewards-estimation":
          infoTextPromise = this.getRewardsEstimation(this.options);
          break;

        case "potential-return":
          infoTextPromise = this.getPotentialReturn(this.options);
          break;
        case "current-wealth":
          infoTextPromise = KeplrClient.getCurrentWealth(this.options);
          break;
        default:
          console.log(this.infoId + " not registered as info");
          break;
      }
      if (infoTextPromise) {
        console.log(this.infoId,infoTextPromise);
        infoTextPromise
        .then((result) => (this.infoText = this.format(result)))
        .catch((error) => console.log("Smooth Error Handling", error));
      } else {
        this.infoText = null;
      }
    },
    format(result) {
      switch (this.infoId) {
        case "token-price":
          return formatDollars(result, 2);
        case "treasury-balance":
          return formatDollars(result, 0);
        case "market-cap":
          return formatDollars(result, 0);
        case "circulating-supply-total":
          return formatToken(result, 2, this.tokenName);
        case "backing-per-token":
          return formatDollars(result, 2);
        case "current-index":
          return formatNumber(result, 2);

        //User Info
        case "token-balance":
          return formatToken(result, 4, this.options.contractName);

        //Bond Indo (to implement)
        case "bond-you-will-get":
          return formatToken(result, 4);
        case "pending-rewards":
          break;
        case "max-you-can-buy-bond":
          break;
        case "bond-roi":
          break;
        case "bond-debt-ratio":
          break;
        case "bond-vesting-term":
          break;
        case "claimable-rewards":
          break;
        case "bond-time-remaining":
          break;
        //stop to-implement

        case "bond-price":
          return formatDollars(result, 2);
        //Stake Info

        case "apy":
          return formatPercent(result);
        case "total-value-deposited":
          return formatDollars(result, 0);

        case "time-till-next-rebase":
          break;
        case "next-reward-amount":
          return formatToken(result,4, `s${this.tokenName}`);
        case "next-reward-yield":
          return formatPercent(result,4);
        case "staking-roi":
          return formatPercent(result,4);

        //Calculator Info
        case "initial-investment":
          return formatDollars(result);
        case "rewards-estimation":
          return formatToken(result, 4, this.tokenName);
        case "potential-return":
          return formatDollars(result);
        case "current-wealth":
          return formatDollars(result);
      }
    },
  },
};
</script>
<style>
@keyframes changeColor {
  0% {
    background-color: rgb(0, 0, 0, 0.1);
  }

  50% {
    background-color: rgb(0, 0, 0, 0.03);
  }

  100% {
    background-color: rgb(0, 0, 0, 0.1);
  }
}
.info-not-arrived {
  animation: changeColor 1.5s ease-in-out 0.5s infinite;
  width: 70px;
  height: 11px;
  display: inline-block;
  border-radius: 11px;
  vertical-align: middle;
}
</style>
