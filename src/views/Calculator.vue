<template>
  <div>
    <base-header type="gradient-success" class="pb-6 pb-8 pt-5 pt-lg-8">
      <!-- Card stats -->
      <div class="row">
        <div class="col-xs-12 col-md-6 col-xl-4 col-lg-4">
          <stats-card
            :title="tokenPriceText()"
            type="gradient-orange"
            sub-title="true"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field
                infoId="token-price"
                :options="{ address: tokenContractAddress }"
              />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-md-6 col-xl-4 col-lg-4">
          <stats-card
            title="APY"
            type="gradient-red"
            sub-title="350,897"
            class="mb-4 mb-xl-0"
          >
            <template v-slot:valueSlot>
              <info-field infoId="apy" />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-xl-4 col-lg-4">
          <stats-card
            :title="'Your ' + tokenName + ' Balance'"
            type="gradient-orange"
            sub-title="2,356"
            class="mb-4 mb-xl-0"
          >
            <template v-slot:valueSlot>
              <info-field
                infoId="token-balance"
                :options="{
                  name: tokenName,
                }"
              />
            </template>
          </stats-card>
        </div>
      </div>
    </base-header>
    <div class="container-fluid mt--7">
      <div class="row">
        <div class="col">
          <div class="card shadow d-flex">
            <div class="card-header bg-transparent">
              <h3 class="mb-0">Calculator</h3>
              Helps you compute your returns
            </div>
            <div class="card-body">
              <div class="row calc-input-container">
                <div class="form-group col-xs-12 col-md-6">
                  <label class="calc-input-label" for="token-amount"
                    >s{{ tokenName }} Amount</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.000001"
                      class="form-control"
                      :placeholder="'s' + tokenName + ' Amount'"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      v-model="tokenAmount"
                      name="token-amount"
                    />
                    <div class="input-group-append">
                      <span
                        class="input-group-text"
                        id="max-button"
                        @click="calcMaxTokenAmount"
                        >Max</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group col-xs-12 col-md-6">
                  <label class="calc-input-label" for="token-amount"
                    >APY (%)</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.000001"
                      class="form-control"
                      placeholder="APY"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      v-model="apy"
                    />
                    <div class="input-group-append">
                      <span
                        class="input-group-text"
                        id="max-button"
                        @click="calcCurrentAPY"
                        >Current</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group col-xs-12 col-md-6">
                  <label class="calc-input-label" for="token-amount"
                    >{{ tokenName }} Price at Purchase</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.000001"
                      class="form-control"
                      :placeholder="tokenName + ' Price at Purchase'"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      v-model="purchasePrice"
                    />
                    <div class="input-group-append">
                      <span
                        class="input-group-text"
                        id="max-button"
                        @click="calcCurrentPricePurchase"
                        >Current</span
                      >
                    </div>
                  </div>
                </div>
                <div class="form-group col-xs-12 col-md-6">
                  <label class="calc-input-label" for="token-amount"
                    >Future {{ tokenName }} Price</label
                  >
                  <div class="input-group">
                    <input
                      type="number"
                      step="0.000001"
                      class="form-control"
                      :placeholder="'Future ' + tokenName + ' Price'"
                      aria-label="Recipient's username"
                      aria-describedby="basic-addon2"
                      v-model="futurePrice"
                    />
                    <div class="input-group-append">
                      <span
                        class="input-group-text"
                        id="max-button"
                        @click="calcCurrentPriceFuture"
                        >Current</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group col-xs-12 col-md-6">
                <label for="stakingDuration" class="form-label days-label">{{
                  nDaysText
                }}</label>
                <input
                  type="range"
                  v-model="nbDays"
                  class="calc-days-range form-range col-12"
                  min="1"
                  max="365"
                />
              </div>
              <div class="row calc-info-container">
                <div
                  v-for="calcInfo in calcInfoToDisplay"
                  :key="calcInfo.title"
                  class="calc-info"
                >
                  <div class="calc-info-title">
                    {{ calcInfo.title }}
                  </div>
                  <div class="calc-info-value">
                    <info-field
                      :infoId="calcInfo.id"
                      :options="{
                        amount: tokenAmount,
                        purchasePrice: purchasePrice,
                        balance: tokenBalance,
                        futurePrice: futurePrice,
                        nbDays: nbDays,
                        apy: apy,
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tokenAmount: null,
      apy: null,
      purchasePrice: null,
      futurePrice: null,
      tokenBalance: null,
      nbDays: 1,
      calcInfoToDisplay: [
        {
          title: "Your Initial Investment",
          id: "initial-investment",
        },
        {
          title: "Current Wealth",
          id: "current-wealth",
          options: {},
        },
        {
          title: this.tokenName + " rewards estimation",
          id: "rewards-estimation",
          options: {},
        },
        {
          title: "Potential return",
          id: "potential-return",
          options: {},
        },
      ],
    };
  },
  computed: {
    nDaysText() {
      if (this.nbDays == 1) {
        return "1 day";
      } else {
        return this.nbDays + " days";
      }
    },
  },
  methods: {
    calcMaxTokenAmount() {
      this.tokenAmount = this.getUserBalance(this.sTokenContractAddress);
    },
    calcCurrentAPY() {
      this.apy = this.getAPY().toFixed(1);
    },
    calcCurrentPricePurchase() {
      this.purchasePrice = this.getTokenPriceInUSDValue(
        this.tokenContractAddress
      );
    },
    calcCurrentPriceFuture() {
      this.futurePrice = this.getTokenPriceInUSDValue(
        this.tokenContractAddress
      );
    },
  },
  created() {
    this.calcMaxTokenAmount();
    this.calcCurrentPricePurchase();
    this.calcCurrentPriceFuture();
    this.calcCurrentAPY();
  },
};
</script>
<style>
.stake-info {
  display: flex;
  justify-content: space-between;
  padding: 0.2em 1em;
  width: 100%;
  font-weight: 560;
  font-size: 0.9em;
}
.calc-input-container {
  row-gap: 10px;
}
.calc-input-label {
  margin-bottom: 0px !important;
  padding-left: 10px;
  font-weight: bold;
}
.days-label {
  font-weight: bold;
}
.calc-info {
  display: flex;
  justify-content: space-between;
  padding: 0.2em 1em;
  width: 100%;
  font-weight: 560;
  font-size: 0.9em;
}
.calc-days-range {
  padding: 0px !important;
}
</style>
