<template>
  <div class="ui inverted menu" >
    <div class="ui container">
   <div class="wrapper" v-if="isNeedVisible">
        <button @click="navigateTo('/toppage')" class="ui button">トップページ</button>
        <button @click="navigateTo('/')" class="ui yellow button">ほめて</button>
        <button @click="navigateTo('/')" class="ui yellow button">はげまして</button>
        <button @click="navigateTo('/settings')" class="ui button">設定</button>
        <button @click="logout" class="ui button">ログアウト</button>
      </div>
    </div>
  </div>
</template>
<script>
    export default {
        name: "Menu",
        computed: {
            isNeedVisible() {
                if(this.$route.name === 'Login') {
                    return false;
                } else {
                    return true;
                }
            },
        },
        methods: {
            navigateTo(path) {
                this.$router.push(path); // Vue Routerを使ってページ遷移
            },
            logout() {
                window.localStorage.clear();
                this.$router.push({name: "Login"});
            }
        },
    };
</script>
<style scoped>
body {
  margin: 1em;
}

button {
  display: inline-flex;
  padding: 0.5em 1em;
  font: inherit;
  color: white;
  text-align: left;
  background-color: dodgerblue;
  border: 0;
  border-radius: 0.25em;
}

.wrapper {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 1rem;
  width: fit-content;
}
</style>