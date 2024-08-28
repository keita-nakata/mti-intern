const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team1_User"; //後で変更

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };
  
  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。userIdがありません。",
    });
    return response;
  }
  
  //TODO: 取得対象のテーブル名と検索に使うキーをparamに宣言
  const param = {
    TableName,
    "Key": marshall({
      userId,
    }),
  };
  
  const checkCommand = new GetItemCommand(param);

  // DBからデータを取得
  try {
    const result = (await client.send(checkCommand)).Item;
     if (!result) {
      throw new Error("salt取得エラー: 指定されたuserIdを持つユーザは見つかりませんでした。");
    }
    const user = unmarshall(result);
    
    delete user?.token;
    delete user?.hash;
    delete user?.userName;
    
    response.body = JSON.stringify(user);
    
  } catch (e) {
    if(e.message == "salt取得エラー: 指定されたuserIdを持つuserは見つかりませんでした。") {
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
        message: "salt取得エラー: 予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
    return response;
  }

  return response;
};
