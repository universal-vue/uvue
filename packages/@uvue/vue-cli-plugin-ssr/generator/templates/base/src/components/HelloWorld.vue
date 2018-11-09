<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <h3>Documentations</h3>
    <ul>
      <li><a href="https://vuejs.org/" target="_blank">Vue</a></li>
      <li><a href="https://universal-vue.github.io/docs/" target="_blank">UVue</a></li>
      <li><a href="https://cli.vuejs.org//" target="_blank">Vue CLI</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      default: '',
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@import url('https://fonts.googleapis.com/css?family=Nunito:300,400');

body {
  font-family: 'Nunito', sans-serif;
}

h1 {
  font-weight: 300;
  margin: 40px 0 0;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
