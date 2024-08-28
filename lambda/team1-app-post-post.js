const { DynamoDBClient, PutItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
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

  try {
    const token = event.headers?.authorization;
    const queryUserId = event.queryStringParameters?.userId;

    if (!token || !queryUserId) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: "無効なリクエストです。トークンまたはuserIdがありません。",
      });
      return response;
    }

    // トークンの検証フェーズ
    const checkParam = {
      TableName: "Team1_User",
      Key: marshall({
        userId: queryUserId,
      }),
    };

    const checkCommand = new GetItemCommand(checkParam);

    // DBからデータを取得
    const result = (await client.send(checkCommand)).Item;
    if (!result) {
      throw new Error("指定されたuserIdを持つユーザは見つかりませんでした。");
    }
    const user = unmarshall(result);

    // トークンの一致で認証確認をする
    if (user.token !== token) {
      throw new Error("認証に失敗しました。ログインまたは新規登録をしてください。");
    }

    // 投稿フェーズ
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body || !body.userId || !body.text || !body.formGenre || !body.category) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: "無効なリクエストです。必須パラメータがセットされていません。",
      });
      return response;
    }

    const { userId, text, formGenre, category } = body;
    const timestamp = Date.now();
    // リアクションの数ぶん枠を用意
    const reactions = [0, 0, 0];
    const param = {
      TableName,
      Item: marshall({
        userId,
        timestamp,
        text,
        formGenre,
        category,
        reactions,
      }),
    };

    const command = new PutItemCommand(param);

    await client.send(command);
    response.statusCode = 200;
    response.body = JSON.stringify({ userId, text, formGenre, category, timestamp, reactions });
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
