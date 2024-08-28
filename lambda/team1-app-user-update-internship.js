const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
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

  // TODO: リクエストボディの中身をJavaScriptオブジェクトに変換し、1つ、あるいは複数の変数に代入する
  const { userId, userName, hash } = JSON.parse(event.body);
  const token = event.headers.authorization;
  if(!userId || !userName || !hash || !token){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "リクエストボディに必須パラメータがセットされていないか、ヘッダにトークンが設定されていません。",
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
  var salt;

  // DBからデータを取得
  try {
    const result = (await client.send(checkCommand)).Item;
     if (!result) {
      throw new Error("指定されたuserIdを持つユーザは見つかりませんでした。");
    }
    const user = unmarshall(result);
    salt = user.salt;
    // トークンの一致で認証確認をする
    if(user.token !== token) {
      throw new Error("認証に失敗しました。ログインまたは新規登録をしてください。");
    }
  } catch (e) {
    if(e.message == "指定されたuserIdを持つuserは見つかりませんでした。") {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: e.message,
      });
    } else if(e.message == "認証に失敗しました。ログインまたは新規登録をしてください。") {
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
  
  const param = {
    TableName,
    "Item": marshall({
      userId,
      userName,
      hash,
      salt,
      token
    }),
  };
  
  
  // ここから更新処理
  const command = new PutItemCommand(param);

  try {
    await client.send(command);
    // TODO: 更新に成功した場合の処理を記述(response bodyを設定する)
    response.body = JSON.stringify({ userId, userName });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "更新: 予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};