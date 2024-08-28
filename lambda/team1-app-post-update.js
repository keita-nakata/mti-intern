const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Team1_Post"; //後で変更

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

  // 投稿を特定するパラメータ（userId, timestamp）と任意の変更したいパラメータを受け取る
  const body = event.body ? JSON.parse(event.body) : null;
  const { userId, timestamp, ...updateParams } = body;

  if (!body || !userId || !timestamp) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。パラメータがセットされていません。",
    });
    return response;
  }

  // 更新する属性の準備
  let updateExpression = "set";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updateParams).forEach((key, index) => {
    const attributeKey = `#attr${index}`;
    const attributeValue = `:val${index}`;
    updateExpression += ` ${attributeKey} = ${attributeValue},`;
    expressionAttributeNames[attributeKey] = key;
    expressionAttributeValues[attributeValue] = updateParams[key];
  });

  updateExpression = updateExpression.slice(0, -1); // 最後のカンマを削除

  // UpdateItemCommandの設定
  const updateParamsCommand = {
    TableName,
    Key: marshall({
      userId,
      timestamp,
    }),
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "ALL_NEW",
  };

  const updateItemCommand = new UpdateItemCommand(updateParamsCommand);

  try {
    const result = await client.send(updateItemCommand);
    response.statusCode = 200;
    response.body = JSON.stringify({
      message: "更新が成功しました。",
      updatedAttributes: unmarshall(result.Attributes),
    });
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
