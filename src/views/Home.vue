<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <!-- メッセージコンポーネント -->
      <div class="ui segment" v-if="successMsg">
      <!-- 成功メッセージ表示 -->
        <p class="ui positive">
          <i class="close icon" @click="clearMsg"></i>
          <i class="thumbs up outline icon"></i>
          <span class="header">成功</span>
          {{ successMsg }}
        </p>
      </div>
      <!-- 失敗メッセージ表示-->
      <div class="ui segment" v-if="errorMsg">
        <p class="ui positive">
          <i class="close icon" @click="clearMsg"></i>
          <i class="thumbs down outline icon"></i>
          <span class="header">失敗</span>
          {{ errorMsg }}
        </p>
      </div>
      <div class="ui grid">
      <div class="twelve wide column">
      <div class="ui components divided post list">
        <div class="ui segment">
        <template v-for="(post, index) in posts" :key="index">
          <li class="post">
            <div class="content">
                <div class="metadata">
                  <p class="date">
                    {{ convertToLocaleString(post.timestamp) }}
                  </p>
                </div>
                <p class="text">
                  {{ post.text }}
                </p>
                <div class="inline fields">
                <p v-if="post.category" class="ui label">
                  {{ post.category }}
                </p>
                
                  <button @click="likePost(index)" class="ui red right floated button">いいね {{ post.reactions[0] }}</button>
                  <button @click="greatPost(index)" class="ui red right floated button">すごい {{ post.reactions[1] }}</button>
                  <button @click="goodJobPost(index)" class="ui red right floated button">頑張ったね {{ post.reactions[2] }}</button>
              　</div>
                
              <div class="ui divider"></div>
            </div>
          </li>
        </template>
      </div>
      </div>
      </div>
      
      <div class="four wide column"><p></p>
      <!-- 記事投稿コンポーネント -->
 
        <form class="ui form" @submit.prevent="postPost">
          <div class="field input">
            <textarea v-model="post.text" name="text" placeholder="投稿内容を入力" />
          </div>
          
          <div class="field">
            <label for="category">ジャンル</label>
            <input v-model.number="post.category" class="ui input" type="text" name="category" />
          </div>
          <button class="ui fluid green button" type="submit" v-bind:disabled="isPostabled">
            投稿
          </button>
        </form>
    
      <!-- 検索コンポーネント -->
  
        <form class="ui form" @submit.prevent="getSearchedPosts">
          <div class="field">
            <label>ジャンル</label>
            <i></i>
            <input v-model="search.category" type="text" id="category" name="category" placeholder="カテゴリー" />
          </div>
          <div class="field">
            <label>投稿日時</label>
              <div class="field">
                <input v-model="search.start" type="datetime-local" id="timestampStart" name="timestampStart" />
                <label for="timestampStart">から</label>
              </div>

              <div class="field">
                <input v-model="search.end" type="datetime-local" id="timestampEnd" name="timestampEnd" />
                <label for="timestampEnd">まで</label>
              </div>
          </div>
          <button class="ui fluid green button" type="submit">
            検索
          </button>
        </form>
      
    </div>
    </div>
  </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcと同じ意味です
import { baseUrl } from "@/assets/config.js";
const headers = {'Authorization' : '65uMsSeb4vAFJawtlB1RooSL2Yzjwzyq'};

export default {
  name: 'Home',

  components: {
   // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      post: {
        text: null,
        category: null,
        formGenre: 0, //仮置き
      },
      search: {
        userId: null,
        category: null,
        start: null,
        end: null,
      },
      posts: [],
      //iam: window.localStorage.getItem('userId'),
      isPostabled: false,
      isCallingApi: false,
      successMsg: null,
      errorMsg: null,
    };
  },
  computed: {
  // 計算した結果を変数として利用したいときはここに記述する
    isPostabled() {
      return !this.post.text;
    },
  },

  created: async function() {
    // Vue.jsの読み込みが完了したときに実行する処理はここに記述する
    // apiからpostを取得する
    await this.getPosts();
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    
    // clearMsg() {}, // 成功・エラーメッセージをクリアする
    clearMsg() {
      this.successMsg = null;
      this.errorMsg = null;
    },
    
    // isMypost(id) {}, // 自分の記事かどうかを判定する
    // isMypost(id) {
      // return this.iam === id;
    // },
    
    // ポストを全件取得する関数
    async getPosts() {
      this.isCallingApi = true;
      
      try {
        /* global fetch */
        const res = await fetch(baseUrl + '/post', {
          method: 'GET'
        });

        const text = await res.text();
        console.log(text);
        const jsonData = text ? JSON.parse(text) : {}

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
          throw new Error(errorMessage);
        }

        this.posts = jsonData.posts ?? [];
      } catch (e){
        this.errorMsg = `記事一覧取得にエラーが発生しました: ${e}`;
      } finally {
        this.isCallingApi = false;
      }
    },
    
    // async postPost() {}, // 記事を作成する
    async postPost() {
      if(this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;
      const { text, category } = this.post;
      
      // リクエストボディを指定する
      const requestBody = {
        //userId: window.localStorage.getItem('userId'),
        userId: "ryorec26@gmail.com",
        text,
        category,
        formGenre: "0",
      };

      try {
        /* global fetch */
        const res = await fetch(baseUrl + "/post?userId=" + "ryorec26@gmail.com", {
          method: "POST",
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
        this.successMsg = "記事の投稿に成功しました！";
        this.post.text = null;
        this.post.category = null;
        
        await this.getPosts();
      } catch (e) {
        console.error(e);
        // エラー時の処理
        this.errorMsg = "記事の投稿に失敗しました......";
      } finally {
        this.isCallingApi = false;
      }
    },
    // async getSearchedposts() {}, // 記事を検索する
    async getSearchedposts() {
      if(this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;
      const { userId, category, start, end } = this.search;
      const startTime = start ? new Date(start).getTime() : "";
      const endTime = end ? new Date(end).getTime() : "";
      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/posts?userId=${userId}&category=${category ?? ""}&start=${startTime}&end=${endTime}`, {
          method: "GET",
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
        // 検索に成功した場合
        this.posts = jsonData.posts;
        this.successMsg = "記事情報の検索に成功しました！";
      } catch (e) {
        console.error(e);
        this.errorMsg = "記事の取得に失敗しました......";
      } finally {
        this.isCallingApi = false;
      }
    },
    
    
    
    // async deletepost(post) {}, // 記事を削除する
    async deletepost(post) {
      if(this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;
      const { userId, timestamp } = post;

      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/post?userId=${userId}&timestamp=${timestamp}`, {
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

        // 成功時の処理(削除しました表示が欲しい)
        this.successMsg = "記事の削除に成功しました！";
        await this.getposts();
      } catch (e) {
        console.error(e);
        errorMsg = "エラーが発生しました......"
        // エラー時の処理
      } finally {
        this.isCallingApi = false;
      }
    },
    
    async getLikes(postId) {
    try {
      const res = await fetch(`${baseUrl}/post/${postId}/likes`, {
        method: 'GET',
        headers,
      });

      const text = await res.text();
      //console.log(text);
      const jsonData = text ? JSON.parse(text) : {}

      if (!res.ok) {
        const errorMessage = jsonData.message ?? 'エラーメッセージがありません';
        throw new Error(errorMessage);
      }

      return jsonData.likes ?? 0;
    } catch (e) {
      console.error(`いいねの取得にエラーが発生しました: ${e}`);
      return 0;
      }
    },
    
    async likePost(index) {
      this.posts[index].reactions[0]++;
      const tempUserId = "ryorec26@gmail.com";
      const requestBody = {
        userId: this.posts[index].userId,
        timestamp: this.posts[index].timestamp,
        reactions: this.posts[index].reactions,
      };
      
      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/post?userId=${tempUserId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(requestBody),
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.successMsg = "いいねが反映されました";
      } catch (e) {
        console.error(e);
        const errorMsg = "エラーが発生しました......"
        // エラー時の処理
      } finally {
        this.isCallingApi = false;
      }
      
    },
    async greatPost(index) {
      // わかるのカウントを増やす
      this.posts[index].reactions[1]++;
      const tempUserId = "ryorec26@gmail.com";
      const requestBody = {
        userId: this.posts[index].userId,
        timestamp: this.posts[index].timestamp,
        reactions: this.posts[index].reactions,
      };
      
      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/post?userId=${tempUserId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(requestBody),
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.successMsg = "すごいが反映されました";
      } catch (e) {
        console.error(e);
        const errorMsg = "エラーが発生しました......"
        // エラー時の処理
      } finally {
        this.isCallingApi = false;
      }
    },
    async goodJobPost(index) {
      // わかるのカウントを増やす
      this.posts[index].reactions[2]++;
      const tempUserId = "ryorec26@gmail.com";
      const requestBody = {
        userId: this.posts[index].userId,
        timestamp: this.posts[index].timestamp,
        reactions: this.posts[index].reactions,
      };
      
      try {
        /* global fetch */
        const res = await fetch(`${baseUrl}/post?userId=${tempUserId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(requestBody),
        });

        const text = await res.text();
        const jsonData = text ? JSON.parse(text) : {};

        // fetchではネットワークエラー以外のエラーはthrowされないため、明示的にthrowする
        if (!res.ok) {
          const errorMessage = jsonData.message ?? "エラーメッセージがありません";
          throw new Error(errorMessage);
        }

        // 成功時の処理
        this.successMsg = "頑張ったねが反映されました";
      } catch (e) {
        console.error(e);
        const errorMsg = "エラーが発生しました......"
        // エラー時の処理
      } finally {
        this.isCallingApi = false;
      }
    },
    // convertToLocaleString(timestamp) {} // timestampをLocaleDateStringに変換する
    convertToLocaleString(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  },
};
</script>
<!-- どうしても削除ボタンを右揃えにしたかったため用意 -->
<style scoped>
  .right {
    text-align: right;
  }
</style>
