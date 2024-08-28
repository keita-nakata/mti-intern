<template>
  <div>
    <div class="ui main container">
      <!--<div class="ui segment">
        <div class="inline fields">
          <div class="field">
            <label for="fontSize">文字サイズ:</label>
            <select id="fontSize" v-model="fontSize" :class="{ 'medium-text': fontSize === 'medium', 'large-text': fontSize === 'large' }">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
          <div class="field">
            <label for="fontSize">ダークモード:</label>
            <button @click="toggleMode()" class="ui yellow button" type="button">
              {{ ModeSwich }}
            </button>
          </div>
        </div>
      </div> -->
      <div class="ui segment">
        <form class="ui large form" @submit.prevent="submit" required disabled>
          <div class="field">
            <div class="ui left icon input">
              <i class="mail icon"></i>
              <input v-model="user.userId" type="email" placeholder="ユーザーID(メールアドレス)" />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="パスワード" />
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userName" type="text" placeholder="ユーザー名" />
            </div>
          </div>

          <button class="ui huge fluid yellow button" type="submit">
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
import { baseUrl } from "@/assets/config.js";

export default {
  name: 'Settings',
  data() {
    return {
      user: {
        userId: window.localStorage.getItem('userId'),
        password: null,
        userName: null,
        salt: null,
        hash: null,
      },
      token: window.localStorage.getItem('token'),
      fontSize: 'medium',
      dark: false,
    };
  },
  computed: {
    ModeSwich() {
      return this.dark ? '暗' : '明';
    },
  },
  methods: {
    toggleMode() {
      this.dark = !this.dark;
      window.localStorage.setItem('dark', this.dark);
    },
    async generateHash() {
	    // パスワードとソルトを結合
      const passwordSalt = this.user.password + this.user.salt;

      // SHA-512ハッシュを計算
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordSalt);
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      this.user.hash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      this.user.password = null;
    },

    async deleteUser() {
      // 削除処理を実装
      // ソルトを取得する
      await this.getSalt();
      // パスワードをハッシュ化する
      await this.generateHash();
      const headers = {'Authorization': this.token};

      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/user?userId=${this.user.userId}&hash=${this.user.hash}`, {
          method: "DELETE",
          headers
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.$router.push({name: 'Toppage'});
        
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
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
        console.log(salt);
        
      } catch (e) {
        console.error(e);
        // エラー時の処理
      }
    },
    async submit() {
      // 更新処理を実装
      // ソルトを取得する
      await this.getSalt();
      // パスワードをハッシュ化する
      await this.generateHash();
      // headerを指定する
      const headers = {'Authorization': this.token};
      
      // リクエストボディを指定する
      const { userId, hash, userName } = this.user;
      const reqBody = {
        userId,
        hash,
        userName,
      };
      try {
          /* global fetch */
          const res = await fetch(baseUrl + '/user', {
            method: 'PUT',
            body: JSON.stringify(reqBody),
            headers
          });

          const text = await res.text();
          const jsonData = text ? JSON.parse(text) : {};

          // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
          if (!res.ok) {
            const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
            throw new Error(errorMessage);
          }

          // 成功時の処理
          this.msg = "ユーザー情報の更新に成功しました";
          alert(this.msg);
          console.log(jsonData);
      } catch (e) {
        console.error(e);
        // エラー時の処理
        alert(e);
      }
    },
  },
  created: async function() {
    const headers = { 'Authorization': this.token };
    try {
      const res = await fetch(baseUrl + `/user?userId=${this.user.userId}`, {
        method: 'GET',
        headers
      });

      const jsonData = await res.json();

      if (!res.ok) {
        const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
        throw new Error(errorMessage);
      }

      this.user.userName = jsonData.userName;
    } catch (e) {
      this.errorMsg = `ユーザー情報取得時にエラーが発生しました: ${e}`;
    }
  }
}
</script>

<style scoped>
@media (prefers-color-scheme: dark) {
  .ui,
  .ui.segment,
  .ui.button {
    background-color: #333;
    color: #fff;
  }
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


.medium-text {
  font-size: 1.2em;
}

.large-text {
  font-size: 1.5em;
}
</style>