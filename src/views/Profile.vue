<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <div class="ui segment">
        <!-- ここにセグメントの中身記述 -->
          <!-- 更新情報入力用フォーム -->
        <form class="ui large form" @submit.prevent="submit" >
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ID"/>
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="Password"/>
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="mail icon"></i>
              <input v-model="user.email" type="email" placeholder="email"/>
            </div>
          </div>

          <div class="inline fields">
          <div class="field">
            <label for="fontSize">ダークモード:</label>
            <button @click="toggleMode()" class="ui green button" type="submit">
              {{ ModeSwich }}
            </button>
          </div>
          </div>
          
          <div class="inline fields">
          <div class="field">
            <label for="fontSize">文字サイズ:</label>
            <select id="fontSize" v-model="fontSize">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          </div>
          
          <button class="ui huge fluid green button" type="submit">
            更新
          </button>
        </form>
      </div>
      <div>
        <button @click="deleteUser" class="ui huge grey fluid button" type="submit">
          退会
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from "@/assets/config.js";

export default {
  name: 'Profile',

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      user: {
        userId: window.localStorage.getItem('userId'),
        password: null,
        nickname: null,
        age: null,
      },
    };
  },

  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    ModeSwich() {
      return this.dark ? 'on' : 'off';
    },
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    ModeSwich() {
      this.dark = !this.dark
    },
    
    async deleteUser() {
      const headers = {'Authorization': 'mtiToken'};
      try {
        /* global fetch */
        const res = await fetch(baseUrl + `/user?userId=${this.user.userId}`, {
          method: "DELETE",
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        console.log("delete成功");
        this.$router.push({name: 'Login'});
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
    
    async submit() {
      const headers = {'Authorization': 'mtiToken'};
      const { userId, password, nickname, age } = this.user;
      const requestBody = {
        userId,
        password,
        nickname,
        age
      };
      
      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/user", {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers,
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage =
            jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        console.log(jsonData);
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    }
  },
  
  created: async function() {
    const headers = {'Authorization': 'mtiToken'};
    try {
      /* global fetch */
      const res = await fetch(baseUrl + `/user?userId=${this.user.userId}`,  {
        method: 'GET',
        headers
      });

      const text = await res.text();
      const jsonData = text ? JSON.parse(text) : {}

      // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
      if (!res.ok) {
        const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
        throw new Error(errorMessage);
      }

      this.user.nickname = jsonData.nickname;
      this.user.age = jsonData.age;
    } catch (e) {
      this.errorMsg = `ユーザー情報取得時にエラーが発生しました: ${e}`;
    }
  }
  
}
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
@media (prefers-color-scheme: dark) {
  a {
    color: #4e9bff;
  }

  button {
    background-color: #4e9bff;
    color: #fff;
  }
}
</style>
