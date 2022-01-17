<template>
  <div class="row balance">
    <div class="col">
      <span
        v-if="viewingKey == null"
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
    placeHolder: {
      type: String,
      description: "placeholder, when a viewing key is not available",
      default: undefined,
    },
  },
  created() {
    // We test if there is a viewing key stored
    this.contract = KeplrClient.getContractFromName(this.options.contractName);
    window.keplr
      .getSecret20ViewingKey(this.chainId, this.contract.contractAddress)
      .then(() => (this.viewingKey = true));

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

      //User Info
      // Will have to do a special container for that (with secret keys)
      case "token-balance":
        infoTextPromise = KeplrClient.getBalance(this.options.contractName);
        break;

      //Bond Info (to implement)
      /*
      case "bond-you-will-get":
        infoTextPromise = KeplrClient.bondYouWillGet(
          this.options.bondName,
          this.options.amount
        );
        break;
        */
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
      /*
        //User sepcific queries, needs viewing keys
      case "next-reward-amount":
        infoTextPromise = this.nextRewardAmount();
        break;

      case "next-reward-yield":
        infoTextPromise = this.nextRewardYield();
        break;
        */
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
        infoTextPromise = this.getCurrentWealth(this.options);
        break;
      default:
        console.log(this.infoId + " not registered as info");
        break;
    }
    if (infoTextPromise) {
      console.log(infoTextPromise);
      infoTextPromise.then((result) => {
        this.infoText = this.format(result);
      });
    } else {
      this.infoText = null;
    }
  },
  methods: {
    addViewingKey() {
      let contract = KeplrClient.getContractFromName(this.options.contractName);
      this.suggestToken(contract.contractAddress, this.options.contractName);
      this.viewingKey = true;
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
          return formatDollars(result, 2, this.tokenName);
        case "backing-per-token":
          return formatDollars(result, 2);
        case "current-index":
          return formatNumber(result, 2);

        //User Info
        case "token-balance":
          return formatDollars(result, 5, "OHM");
        //Bond Indo (to implement)
        case "bond-you-will-get":
          return formatDollars(result, 5, this.tokenName);
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
          break;
        case "next-reward-yield":
          break;
        case "staking-roi":
          break;

        //Calculator Info
        case "initial-investment":
          return formatDollars(result);
        case "rewards-estimation":
          return formatDollars(result);
        case "potentialReturn":
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
