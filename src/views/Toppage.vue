<template>
  <div class="ui main container">
    <!-- 検索ボックス -->
    <div class="ui segment">

      <form class="ui form">
        <!-- ヘッダー -->
        <header>
          <h1 class="ui center aligned header huge">ポジポジ</h1>
        </header>
      </form>
    </div>

    <div class="button-container">
      <button @click="navigateTo('/')" class="ui huge green button" type="submit">
        ほめてあげる
      </button>
      <button @click="navigateTo('/')" class="ui huge blue right floated button" type="submit">
        励ましてあげる
      </button>
    </div>

    <!-- 最新情報セクション -->

    <div class="ui segment">
      <div class="ui two column grid">
        <div class="column">
          <div class="left-fields">
            <div class="field">
              <h4>最新情報</h4>
            </div>

            <!-- 投稿日時とリンク -->
            <div class="field">
              <p>投稿日時: <span class="date">2024-08-08<a href="https://example.com" target="_blank"
                    class="ui blue button">メンテナンスのお知らせ</a></span></p>
              <p>投稿日時: <span class="date">2024-07-15<a href="https://example.com" target="_blank"
                    class="ui blue button">メンテナンスのお知らせ</a></span></p>
              <p>投稿日時: <span class="date">2024-05-02<a href="https://example.com" target="_blank"
                    class="ui blue button">アプリリリースのお知らせ</a></span></p>
            </div>
          </div>
        </div>

        <!-- 使い方セクション -->
        <div class="column">
          <div class="right-fields">
            <div class="field">
              <h4>使い方</h4>
            </div>
            <div class="field">
              <ol class="ui list">
                <li>
                  <p>登録すると、リアクションや投稿ができるようになります。また、有料会員になると、広告を非表示にできます。</p>
                </li>
                <li>
                  <p>共感できる投稿をみてみよう。自分の今の状態にあった投稿を見つけたら、リアクションをしてみましょう。</p>
                </li>
                <li>
                  <p>今の気持ちを共有してみよう。気持ちに合った掲示板に、今の状態を投稿してみましょう。同じ気持ちを持った人が反応してくれるかもしれません。</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from "@/assets/config.js";
const headers = { 'Authorization': 'mtiToken' };

export default {
  name: 'Toppege',

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      news: [],
      iam: window.localStorage.getItem('userId'),
      isPostabled: false,
      isCallingApi: false,
      successMsg: null,
      errorMsg: null,
    };
  },

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
    };
  },

  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    navigateTo(path) {
      this.$router.push(path); // Vue Routerを使ってページ遷移
    },
    async getnews() {
      this.isCallingApi = true;

      try {
        /* global fetch */
        const res = await fetch(baseUrl + '/news', {
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

        this.articles = jsonData.articles ?? [];
      } catch (e) {
        this.errorMsg = `記事一覧取得にエラーが発生しました: ${e}`;
      } finally {
        this.isCallingApi = false;
      }
    },

    convertToLocaleDateString(timestamp) {
      return new Date(timestamp).toLocaleDateString();
    },
  },
}
</script>

<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
.flex-container {
  display: flex;
  flex-direction: column;
}

.left-fields,
.right-fields {
  margin-bottom: 20px;
}

.field {
  margin-bottom: 10px;
}

.date {
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: space-around; /* 水平方向にボタンを均等に配置 */
  align-items: center; /* ボタンを縦方向で中央に揃える */
  margin: 2rem 0; /* 上下の余白を追加 */
}
</style>
