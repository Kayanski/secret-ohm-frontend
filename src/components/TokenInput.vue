<template>
  <form @submit="submitTokenInput" class="container token-input">
    <div class="row balance">
      <div class="col">
        <span> Balance: </span>

        <info-field
          infoId="token-balance"
          :options="{
            contractName: contractName,
            specialTextClass: 'font-weight-bold',
          }"
          @valueAvailable="updateBalance"
        />
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
          <span :class="{ 'd-none': submitting }">{{ buttonText }}</span>
          <easy-spinner
            :class="[{ 'd-none': !submitting }, 'spinner']"
            type="circular"
            size="20"
          />
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { getContractFromName } from "@/client";
export default {
  name: "token-input",
  data() {
    let token = getContractFromName(this.contractName);
    return {
      token: token,
      viewingKey: null,
      tokenBalance: null,
      tokenEntered: null,
      submitting: false,
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
    buttonText: {
      type: String,
      description: "read the name pls",
      default: undefined,
    },
    contractName: {
      type: String,
      description: "read the name pls",
      default: "OHM",
    },
  },
  computed: {
    tokenText() {
      return this.contractName + " Amount";
    },
    percentage() {
      if (this.tokenBalance && this.tokenEntered) {
        return this.tokenEntered / Number(this.tokenBalance);
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
      console.log(newVal, this.tokenBalance);
      if (this.tokenBalance) {
        if (!(newVal <= this.tokenBalance)) {
          this.tokenEntered = this.tokenBalance;
        }
        console.log(typeof Number(this.tokenBalance), typeof this.tokenEntered);
        let percentage = this.tokenEntered / Number(this.tokenBalance);
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
    submitTokenInput() {
      if(!this.submitting){
        this.submitting = true;
        this.$emit("submitTokenInput", this.tokenEntered);
      }else{
        this.catchError("clicking a button","You can't click an action button twice, please finish what you are doing first","",2000);
      }
    },
    submitted() {
      this.submitting = false;
      console.log("FINISEHD");
    },
    updateBalance(event) {
      this.tokenBalance = event.value;
    },
    addViewingKey() {
      this.suggestToken(this.token.contractAddress, this.contractName);
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
.btn-submit:hover {
  color: white !important;
}
.spinner {
  margin-left: 0px !important;
}
</style>
