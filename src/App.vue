<template>
  <div id="app">
    <notifications classes="vue-notification" />
    <router-view />
  </div>
</template>
<style>
.vue-notification {
  margin-top: 10px !important;
}
.notification-content a {
  color: white;
  font-weight: bold;
}
.notification-content a:hover {
  color: white;
  text-decoration: underline;
}
</style>
