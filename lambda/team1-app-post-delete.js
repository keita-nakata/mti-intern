const {
  DynamoDBClient,
  DeleteItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
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

  try {
    const result = (await client.send(checkCommand)).Item;
    if (!result) {
      throw new Error("指定されたuserIdを持つユーザは見つかりませんでした。");
    }
    const user = unmarshall(result);

    // トークンの一致で認証確認をする
    if (user.token !== token) {
      throw new Error("認証に失敗しました。ログインまたは新規登録をしてください。");
    }
  } catch (e) {
    if (e.message === "指定されたuserIdを持つユーザは見つかりませんでした。") {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: e.message,
      });
    } else if (e.message === "認証に失敗しました。ログインまたは新規登録をしてください。") {
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

  const body = event.body ? JSON.parse(event.body) : null;

  const { userId, timestamp } = body;

  if (!userId || !timestamp) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。userIdもしくはtimestampがセットされていません。",
    });
    return response;
  }

  const param = {
    TableName,
    Key: marshall({
      userId,
      timestamp,
    }),
  };

  const command = new DeleteItemCommand(param);

  try {
    await client.send(command);
    response.statusCode = 204;
    delete response.body; // No Contentなので、bodyを削除
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "デリート：予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
