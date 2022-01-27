<template>
  <nav
    class="navbar navbar-vertical fixed-left navbar-expand-lg navbar-light bg-white"
    id="sidenav-main"
  >
    <div class="container-fluid">
      <!--Toggler-->
      <navbar-toggle-button @click="showSidebar">
        <span class="navbar-toggler-icon"></span>
      </navbar-toggle-button>

      <slot name="mobile-right">
        <ul class="nav align-items-center d-lg-none">
          <base-dropdown class="nav-link pr-0">
            <template v-slot:title>
              <div class="media align-items-center pointed">
                <span
                  class="avatar avatar-sm rounded-circle avatar-token-white"
                >
                  <img alt="Image placeholder" src="img/theme/svg.svg" />
                </span>
                <div class="media-body ml-2 d-block">
                  <span class="mb-0 text-sm font-weight-bold"></span>
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
          <li class="nav-item nav-link pr-0" @click="connectKeplr">
            <div class="media align-items-center pointed">
              <span class="">
                <img
                  alt="Image placeholder"
                  src="https://res.cloudinary.com/hv5cxagki/image/upload/ar_1,c_scale,dpr_2,f_auto,h_14,q_auto/v1/logos/b8thbiihwftyjolgjjz2_dhy5mr"
                />
              </span>
              <div class="media-body ml-2 d-block">
                <span
                  v-if="!keplrConnected"
                  class="mb-0 text-sm font-weight-bold"
                  >Connect Keplr</span
                >
                <span v-else class="mb-0 text-sm font-weight-bold"
                  >{{ displayAddress }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </slot>
      <slot></slot>
      <div
        v-show="$sidebar.showSidebar"
        class="navbar-collapse collapse show"
        id="sidenav-collapse-main"
      >
        <div class="navbar-collapse-header d-lg-none">
          <div class="row">
            <div class="col-6 collapse-brand">
              <router-link to="/">
                <img :src="logo" />
              </router-link>
            </div>
            <div class="col-6 collapse-close">
              <navbar-toggle-button
                @click="closeSidebar"
              ></navbar-toggle-button>
            </div>
          </div>
        </div>

        <ul class="navbar-nav">
          <slot name="links"> </slot>
        </ul>
        <!--Divider-->
        <hr class="my-3" />
        <!--Heading-->
        <h6 class="navbar-heading text-muted">Documentation</h6>
        <!--Navigation-->
        <ul class="navbar-nav mb-md-3">
          <li class="nav-item">
            <sidebar-item
              :link="{
                name: 'Documentation',
                icon: 'ni ni-spaceship',
                path: '/stake',
              }"
            />
          </li>
          <li class="nav-item">
            <sidebar-item
              :link="{
                name: 'Foundation',
                icon: 'ni ni-palette',
                path: '/stake',
              }"
            />
          </li>
          <li class="nav-item">
            <sidebar-item
              :link="{
                name: 'Components',
                icon: 'ni ni-ui-04',
                path: '/stake',
              }"
            />
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import NavbarToggleButton from "@/components/NavbarToggleButton";
import * as KeplrClient from "@/client";

export default {
  name: "sidebar",
  components: {
    NavbarToggleButton,
  },
  props: {
    logo: {
      type: String,
      default: "img/brand/green.png",
      description: "Sidebar app logo",
    },
    autoClose: {
      type: Boolean,
      default: true,
      description:
        "Whether sidebar should autoclose on mobile when clicking an item",
    },
  },
  data() {
    return {
      keplrConnected: false,
      displayAddress: undefined,
    };
  },
  provide() {
    return {
      autoClose: this.autoClose,
    };
  },
  methods: {
    closeSidebar() {
      this.$sidebar.displaySidebar(false);
    },
    showSidebar() {
      this.$sidebar.displaySidebar(true);
    },
  },
  beforeUnmount() {
    if (this.$sidebar.showSidebar) {
      this.$sidebar.showSidebar = false;
    }
  },
  created() {
    KeplrClient.getUserAddressText().then((addressText) => {
      console.log("quid");
      this.keplrConnected = true;
      this.displayAddress = addressText;
    });
  },
};
</script>
<style>
.avatar-token-white {
  background: white;
  border: solid 1px black;
}
</style>
