<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <div class="ui segment">
        <!-- ここにセグメントの中身記述 -->
        
        <form class="ui large form" @submit.prevent="submit">
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input type="text" placeholder="ID" v-model="user.userId"/>
            </div>
          </div>
          
          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input type="password" placeholder="Password" @input="generateHash" v-model="user.password"/>
            </div>
          </div>
          <div class="field" v-if="!isLogin">
              <div class="ui left icon input">
                <i class="tag icon"></i>
                <input v-model="user.userName" type="text" placeholder="Nickname">
              </div>
            </div>
          <button class="ui huge fluid yellow button" type="submit">
            {{ submitText }}
          </button>
        </form>
      </div>
      <div>
        <button @click="toggleMode()" class="ui huge grey fluid button" type="submit">
          {{ toggleText }}
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
  name: 'Login',

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      isLogin: true,
      user: {
        userId: null,
        userName: null,
        hash: null,
        salt: null,
        
      },
    };
  },

  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    submitText() {
      return this.isLogin ? 'ログイン' : '新規登録';
    },
    toggleText() {
      return this.isLogin ? '新規登録へ' : 'ログインへ';
    },
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    toggleMode() {
      this.isLogin = !this.isLogin
    },
    
    async generateHash() {
	    // パスワードとソルトを結合
      const passwordSalt = this.password + this.salt;

      // SHA-512ハッシュを計算
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordSalt);
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this.user.hash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    async getSalt() {
      // 該当ユーザのソルトを取得する
      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/user/salt?userId=${this.user.userId}`, {
          method: "GET",
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.user.salt = jsonData.salt;
        
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
    
    async submit() {
      if(this.isLogin){
        // ログイン時の処理
        // ソルトの取得
        await this.getSalt();
        // パスワードをハッシュ化
        await this.generateHash();
        const requestBody = {
          "userId": this.user.userId,
          "hash": this.user.hash,
        };
        
        try {
          /* global fetch */
          const res = await fetch(baseUrl + "/user", {
            method: "POST",
            body: JSON.stringify(requestBody),
          });
  
          const text = await res.text();
          const jsonData = text ? JSON.parse(text) : {};
  
          // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
          if (!res.ok) {
            const errorMessage =
              jsonData.message ?? "エラーメッセージがありません";
            throw new Error(errorMessage);
          }
          console.log(jsonData);
          
          
          window.localStorage.setItem('token', jsonData.token);
          window.localStorage.setItem('userId', this.user.userId);
  
          // 成功時の処理
          console.log("ログインに成功しました");
          // 追加
          this.$router.push({name: "Home"});
        } catch (e) {
          console.error(e);
          // エラー時の処理
        }
        return;
      }
      
      // 新規登録時の処理
      // const headers = { Authorization: "mtiToken" };
      // リクエストボディを指定する
      // ソルトを生成
	    const saltArray = new Uint8Array(32);
	    window.crypto.getRandomValues(saltArray);
	    this.user.salt = Array.from(saltArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
	    await this.generateHash();
      const requestBody = {
        userId: this.user.userId,
        hash: this.user.password,
        userName: this.user.userName,
        salt: this.user.salt,
      };

      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/user/create", {
          method: "POST",
          body: JSON.stringify(requestBody),
          //headers,
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
        window.localStorage.setItem('token', jsonData.token);
        window.localStorage.setItem('userId', this.user.userId);
  
        // 成功時の処理
        console.log("ログインに成功しました");
        // 追加
        this.$router.push({name: "Toppage"});
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
  },
}
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
