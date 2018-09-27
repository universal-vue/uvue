<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/async-data">Async Data</router-link> |
      <router-link to="/vuex">Vuex</router-link> |
      <router-link to="/on-http-request">OnHttpRequest</router-link> |
      <router-link to="/middleware">Middleware</router-link> |
      <router-link to="/redirect">Redirect</router-link> |
      <router-link to="/error-handler">Error handler</router-link> |
      <router-link to="/server-error">Server error</router-link> |
      <router-link to="/all">All</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
