const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "User";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // TODO: リクエストボディの中身をJavaScriptオブジェクトに変換し、1つ、あるいは複数の変数に代入する
  const { userId, password } = event.body ? JSON.parse(event.body) : null;

  // TODO: query()に渡すパラムを宣言
  const param = {
    TableName,
    //キー、インデックスによる検索の定義
    KeyConditionExpression: "userId = :uid",
    //プライマリーキー以外の属性でのフィルタ
    FilterExpression: "password = :pass",
    //検索値のプレースホルダの定義
    ExpressionAttributeValues: marshall({
      ":uid": userId,
      ":pass": password,
    }),
  };

  // userIdとpasswordが一致するデータを検索するコマンドを用意
  const command = new QueryCommand(param);
  try {
    // client.send()の実行でuserIdとpasswordが一致するデータの検索
    const res = await client.send(command);

    //TODO: 該当するデータが見つからない場合の処理を記述(ヒント：resの中には個数のプロパティが入っています。)
    const foundCount = res.Count;
    if(foundCount == 0){
      throw new Error("userIdまたはpasswordが一致しません");
    }

    //TODO: 認証が成功した場合のレスポンスボディを設定する。
    response.body = JSON.stringify({ token: "mtiToken" });
    
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
