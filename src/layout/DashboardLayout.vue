<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <side-bar
      :background-color="sidebarBackground"
      short-title="OvalDAO"
      title="OvalDAO"
    >
      <template v-slot:links>
        <sidebar-item
          :link="{
            name: 'Dashboard',
            icon: 'ni ni-tv-2 text-primary',
            path: '/dashboard',
          }"
        />

        <sidebar-item
          :link="{
            name: 'Bond',
            icon: 'ni ni-planet text-blue',
            path: '/bonds',
          }"
        />
        <sidebar-item
          :link="{
            name: 'Stake',
            icon: 'ni ni-pin-3 text-orange',
            path: '/stake',
          }"
        />
        <sidebar-item
          :link="{
            name: 'Calculator',
            icon: 'ni ni-single-02 text-yellow',
            path: '/calculator',
          }"
        />
        <sidebar-item
          :link="{
            name: 'Meet the Team',
            icon: 'ni ni-bullet-list-67 text-red',
            path: '/stake',
          }"
        />
        <sidebar-item
          :link="{
            name: 'Docs',
            icon: 'ni ni-key-25 text-info',
            path: '/stake',
          }"
        />
        <sidebar-item
          :link="{
            name: 'Github',
            icon: 'ni ni-circle-08 text-pink',
            path: '/stake',
          }"
        />
      </template>
    </side-bar>
    <div class="main-content" :data="sidebarBackground">
      <dashboard-navbar></dashboard-navbar>

      <div @click="toggleSidebar">
        <!-- your content here -->
        <router-view></router-view>
        <content-footer v-if="!$route.meta.hideFooter"></content-footer>
      </div>
    </div>
  </div>
</template>
<script>
import DashboardNavbar from "./DashboardNavbar.vue";
import ContentFooter from "./ContentFooter.vue";

export default {
  components: {
    DashboardNavbar,
    ContentFooter,
  },
  data() {
    return {
      sidebarBackground: "vue", //vue|blue|orange|green|red|primary
    };
  },
  methods: {
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
  },
};
</script>
<style lang="scss"></style>
