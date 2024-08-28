const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const crypto = require('crypto'); // ハッシュ化に使用する
const { marshall } = require("@aws-sdk/util-dynamodb");
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
  
  // メールアドレスかの検証用正規表現を格納する
  const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
  const { userId, userName, salt, hash } = JSON.parse(event.body);
  // メールアドレスかつ値がある、パスワードが入力されているか検証
  if((!userId && !regex.test(userId)) || !salt|| !userName || !hash){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "リクエストボディに必須パラメータがセットされていないか、メールアドレスの形式が正しくありません。",
    });
    
    return response;
  }
  // トークンの生成
  const token = crypto.randomBytes(32).toString('base64').substring(0, 32);
  const param = {
    TableName,  // Userテーブル
    Item: marshall({
      userId,   // メールアドレス
      userName, // ユーザ名
      hash,     // ハッシュ
      salt,     // ソルト
      token,    // トークン
    }),
  };

  // DBにデータを登録するコマンドを用意
  const command = new PutItemCommand(param);

  try {
    // client.send()でDBにデータを登録するコマンドを実行
    await client.send(command);
    
    // 登録に成功した場合の処理(status codeの設定とresponse bodyの設定)
    response.statusCode = 201;
    response.body = JSON.stringify({ userId, token });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
