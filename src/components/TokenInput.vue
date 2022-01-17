<template>
  <form
    @submit="$emit('submitTokenInput', tokenEntered)"
    class="container token-input"
  >
    <div class="row balance">
      <div class="col">
        <span> Balance: </span>
        <span
          v-if="viewingKey == null"
          class="view-balance-button"
          @click="addViewingKey"
        >
          🔍 View Balance
        </span>
        <span v-else-if="tokenBalance != null">
          {{ tokenBalance }} <strong>{{ token.name }} </strong>
        </span>

        <span v-else class="balance-not-arrived"> </span>
      </div>
    </div>
    <div class="form-container">
      <div class="input-group-token col-xl-6 col-lg-7 col-md-8 col-xs-12">
        <div class="input-group">
          <input
            type="number"
            step="0.000000001"
            class="form-control"
            :placeholder="tokenText"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            v-model="tokenEntered"
          />
          <div class="input-group-append">
            <span
              class="input-group-text"
              id="max-button"
              @click="inputIsNow('100')"
              >Max</span
            >
          </div>
        </div>
        <div class="row percentages-container">
          <button
            :class="[
              'input-percentages',
              'btn-outline-primary',
              'col',
              { active: isActive['25'] },
            ]"
            @click="inputIsNow('25')"
            type="button"
          ></button>
          <button
            :class="[
              'input-percentages',
              'btn-outline-primary',
              'col',
              { active: isActive['50'] },
            ]"
            @mouseover="over(['25'])"
            @mouseleave="leave(['25'])"
            @click="inputIsNow('50')"
            type="button"
          ></button>
          <button
            :class="[
              'input-percentages',
              'btn-outline-primary',
              'col',
              { active: isActive['75'] },
            ]"
            @mouseover="over(['25', '50'])"
            @mouseleave="leave(['25', '50'])"
            @click="inputIsNow('75')"
            type="button"
          ></button>
          <button
            :class="[
              'input-percentages',
              'btn-outline-primary',
              'col',
              { active: isActive['100'] },
            ]"
            @mouseover="over(['25', '50', '75'])"
            @mouseleave="leave(['25', '50', '75'])"
            @click="inputIsNow('100')"
            type="button"
          ></button>
          <div class="percentage-text text-primary">
            {{ percentageText }}
          </div>
        </div>
      </div>

      <div class="col-xs-12 col-sm-12 col-md-auto">
        <button class="btn btn-outline-primary btn-submit" type="submit">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: "token-input",
  data() {
    return {
      viewingKey: null,
      tokenBalance: null,
      tokenEntered: null,
      isActiveBefore: {
        25: false,
        50: false,
        75: false,
        100: false,
      },
      isActive: {
        25: false,
        50: false,
        75: false,
        100: false,
      },
    };
  },
  props: {
    token: {
      type: Object,
      description: "Token properties",
      default: undefined,
    },
    buttonText: {
      type: String,
      description: "read the name pls",
      default: undefined,
    },
  },
  computed: {
    tokenText() {
      return this.token.name + " Amount";
    },
    percentage() {
      if (this.tokenBalance) {
        return this.tokenEntered / this.tokenBalance;
      } else {
        return 0;
      }
    },
    percentageText() {
      return this.percentage.toLocaleString(undefined, {
        style: "percent",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
    },
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  watch: {
    tokenEntered(newVal) {
      if (!(this.tokenBalance && newVal <= this.tokenBalance)) {
        this.tokenEntered = this.tokenBalance;
      }
      if (this.tokenBalance) {
        let percentage = this.tokenEntered / this.tokenBalance;
        let closeQuarter = Math.floor(percentage * 4);
        this.resetisActiveBefore();
        this.resetisActive();
        for (let i = 0; i < closeQuarter; i++) {
          this.isActiveBefore[((i + 1) * 25).toString()] = true;
          this.isActive[((i + 1) * 25).toString()] = true;
        }
      }
      this.$emit("tokenInput", this.tokenEntered);
    },
  },
  methods: {
    addViewingKey() {
      this.suggestToken(this.token.address, this.token.name);
    },
    async tokenBalanceFetch() {
      /*
      this.viewingKey = await window.keplr
        .getSecret20ViewingKey(this.chainId, this.token.address)
        .catch(() => {
          console.log("not viewung key");
          return null;
        });
        */
      this.tokenBalance = this.viewingKey;
      //await new Promise(resolve => setTimeout(resolve, 100));
      this.viewingKey = 465;
      //await new Promise(resolve => setTimeout(resolve, 5552500));
      this.tokenBalance = 465.45;
    },
    resetisActive() {
      Object.entries(this.isActive).forEach(function (percent) {
        this.isActive[percent[0]] = false;
      }, this);
    },
    resetisActiveBefore() {
      Object.entries(this.isActiveBefore).forEach(function (percent) {
        this.isActiveBefore[percent[0]] = false;
      }, this);
    },
    over(percents) {
      percents.forEach(function (percent) {
        this.isActive[percent] = true;
      }, this);
    },
    leave() {
      //We reset isActive
      this.resetisActive();
      Object.entries(this.isActiveBefore).forEach(function (percent) {
        this.isActive[percent[0]] = this.isActiveBefore[percent[0]];
      }, this);
    },
    inputIsNow(percent) {
      this.tokenEntered = (parseInt(percent, 10) * this.tokenBalance) / 100;
    },
  },
  async mounted() {
    this.tokenBalanceFetch();
  },
};
</script>
<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
#max-button {
  color: black;
  cursor: pointer;
  font-weight: bold;
}
#max-button:hover {
  color: #ffa300;
}
.input-group-text {
  border-right: 1px solid #cad1d7 !important;
  border-top: 1px solid #cad1d7 !important;
  border-bottom: 1px solid #cad1d7 !important;
}
.input-group-token {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.form-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}
.balance {
  text-align: right;
}
.view-balance-button {
  cursor: pointer;
  padding: 0.1em;
  border-radius: 5px;
}
.view-balance-button:hover {
  background: rgba(0, 0, 0, 0.06);
}
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
.balance-not-arrived {
  animation: changeColor 1.5s ease-in-out 0.5s infinite;
  width: 70px;
  height: 11px;
  margin-left: 12px;
  display: inline-block;
  border-radius: 11px;
  vertical-align: middle;
}
.token-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  vertical-align: bottom;
}
.percentages-container {
  gap: 12px;
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 10px;
  flex-wrap: nowrap !important;
}
.input-percentages {
  height: 10px;
  display: inline;
  border-radius: 0px !important;
  border-style: solid;
}
.percentage-text {
  font-size: 12px;
  width: 6ch;
  font-weight: bold;
}
.btn-submit {
  align-self: flex-start;
  width: 100%;
}
</style>
