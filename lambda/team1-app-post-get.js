const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team1_Post";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  //TODO: 取得対象のテーブル名をparamに宣言
  const param = {
    TableName,
    Limit: 100,
  };

  const command = new ScanCommand(param);

  try {
    // client.send()で全件取得するコマンドを実行
    const posts = (await client.send(command)).Items;
    const unmarshalledPosts = posts.map((item) => unmarshall(item));
    unmarshalledPosts.sort((a, b) => b.timestamp - a.timestamp);
    response.body = JSON.stringify({ posts: unmarshalledPosts });
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