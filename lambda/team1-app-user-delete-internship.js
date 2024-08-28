const { DynamoDBClient, GetItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const crypto = require('crypto'); // ハッシュ化に使用する
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team1_User";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };
  
  // 値の取得
  const { userId, hash } = event?.queryStringParameters;
  const token = event.headers?.authorization;
  if(!userId || !hash || !token) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "クエリストリングに必須パラメータがセットされていないか、ヘッダにトークンが設定されていません。",
    });
    
    return response;
  }
  // トークンの検証フェーズ
  const checkParam = {
    TableName,
    Key: marshall({
      userId,
    }),
  };
  
  const checkCommand = new GetItemCommand(checkParam);

  // DBからデータを取得
  try {
    const result = (await client.send(checkCommand)).Item;
     if (!result) {
      throw new Error("指定されたuserIdを持つユーザは見つかりませんでした。");
    }
    const user = unmarshall(result);
    
    // トークンの一致で認証確認をする
    if(user.token !== token) {
      throw new Error("認証に失敗しました。ログインまたは新規登録をしてください。");
    }
    if(hash !== user.hash) {
      throw new Error("パスワード検証に失敗しました。正しいパスワードを入力してください。");
    }
  } catch (e) {
    if(e.message == "指定されたuserIdを持つuserは見つかりませんでした。") {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: e.message,
      });
    } else if(e.message == "認証に失敗しました。ログインまたは新規登録をしてください。" || e.message == "パスワード検証に失敗しました。正しいパスワードを入力してください。") {
	    response.statusCode = 401;
      response.body = JSON.stringify({
        message: e.message,
      });
      
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "取得: 予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
    return response;
  }

  // TODO: 削除対象のテーブル名と削除したいデータのkeyをparamに設定
  const param = {
    TableName,
    Key: marshall({
      userId,
    }),
  };

  // データを削除するコマンドを用意
  const command = new DeleteItemCommand(param);

  try {
    // client.send()を用いてデータを削除するコマンドを実行
    await client.send(command);
    // TODO: 成功後の処理を記載(status codeを指定する。)
    response.statusCode = 204;
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "削除: 予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
