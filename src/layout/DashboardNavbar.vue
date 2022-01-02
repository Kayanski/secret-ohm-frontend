<template>
  <base-nav
    class="navbar-top navbar-dark"
    id="navbar-main"
    :show-toggle-button="false"
    expand
  >
    <ul class="navbar-nav align-items-right d-none d-lg-flex">
      <li class="nav-item dropdown">
        <base-dropdown class="nav-link pr-0">
          <template v-slot:title>
            <div class="media align-items-center pointed">
              <span class="avatar avatar-sm rounded-circle">
                <img alt="Image placeholder" src="img/theme/token-img.jpg" />
              </span>
              <div class="media-body ml-2 d-block">
                <span class="mb-0 text-sm font-weight-bold">Token</span>
              </div>
            </div>
          </template>
          <a class="dropdown-item" :href="secretswapTokenLink()">
            <i class="ni ni-money-coins"></i>
            <span>Buy on SecretSwap</span>
          </a>
          <div class="dropdown-divider"></div>
          <div class="dropdown-header noti-title">
            <h6 class="text-overflow m-0">Register Tokens in Keplr</h6>
          </div>
          <div class="dropdown-divider"></div>

          <div class="dropdown-item pointed" @click="suggestMainToken">
            <i class="ni ni-single-02"></i>
            <span>{{ tokenName }}</span>
          </div>

          <div class="dropdown-item pointed" @click="suggestSToken">
            <i class="ni ni-single-02"></i>
            <span>s{{ tokenName }}</span>
          </div>
        </base-dropdown>
      </li>
    </ul>
    <ul class="navbar-nav align-items-center d-none d-lg-flex connect-keplr">
      <li class="nav-item nav-link pr-0" @click="connectKeplr">
        <div class="media align-items-center pointed">
          <span class="">
            <img
              alt="Image placeholder"
              src="https://res.cloudinary.com/hv5cxagki/image/upload/ar_1,c_scale,dpr_2,f_auto,h_14,q_auto/v1/logos/b8thbiihwftyjolgjjz2_dhy5mr"
            />
          </span>
          <div class="media-body ml-2 d-block">
            <span v-if="!keplrConnected" class="mb-0 text-sm font-weight-bold"
              >Connect Keplr</span
            >
            <span v-else class="mb-0 text-sm font-weight-bold"
              >{{ displayAddress }} | <strong>{{ tokenBalance }}</strong>
              {{ tokenName }}</span
            >
          </div>
        </div>
      </li>
    </ul>
  </base-nav>
</template>
<script>
//import SigningCosmWasmClient from "secretjs";
import TokenStore from "@/token-store";

export default {
  data() {
    return {
      activeNotifications: false,
      showMenu: false,
      searchQuery: "",
    };
  },
  computed: {
    displayAddress() {
      return this.addressText(TokenStore.userAddress);
    },
    keplrConnected() {
      return TokenStore.keplrConnected;
    },
    tokenBalance() {
      return TokenStore.tokenBalance;
    },
  },
  methods: {
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    hideSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
};
</script>
<style>
.pointed {
  cursor: pointer;
}
.connect-keplr {
  border: 2px solid black;
  padding: 0px 10px;
  border-radius: 5px;
  margin-left: 5em;
  background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%) !important;
}
.token-info-bar {
  justify-content: end;
}
.view-notification-group {
  margin-top: 5px;
}
</style>
