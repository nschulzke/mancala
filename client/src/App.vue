<template>
  <div id="app">
    <router-view/>
    <div class="footer"><a href="https://github.com/nschulzke/mancala">Repository</a></div>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
