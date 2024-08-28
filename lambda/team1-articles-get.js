const { DynamoDBClient, ScanCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "Article";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };
  
  // tokenを持っているか確認
  if (event.headers.authorization !== "mtiToken") {
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: "認証されていません。HeaderにTokenを指定してください",
    });
    
    return response;
  }
  

  //TODO: 取得対象のテーブル名をparamに宣言
  const { hasValidQs, param } = createParam(event.queryStringParameters);

  const queryCommnad = new QueryCommand(param);
  const scanCommand = new ScanCommand(param);
  try {
    const articles = hasValidQs
      ? (await client.send(queryCommnad)).Items
      : (await client.send(scanCommand)).Items;

    if (articles.length == 0) {
      response.body = JSON.stringify({ articles: [] });
    } else {
      const unmarshalledArticles = articles.map((item) => unmarshall(item));
      unmarshalledArticles.sort((a, b) => b.timestamp - a.timestamp);
      response.body = JSON.stringify({ articles: unmarshalledArticles });
    }
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};

// qsの内容に応じて、Paramを作成する。
const createParam = (qs) => {
  // Query操作には、パーティションキーは必須であり、他は任意となる。
  // そのためuserIdさえあれば、有効となる。
  const hasValidQs = qs?.userId;
  if (!hasValidQs) {
    return {
      hasValidQs,
      param: {
        // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
        TableName, // TableName: TableNameと同じ意味
        Limit: 100,
      },
    };
  }

  const { userId, start, end, category } = qs;

  const queryParam = {
    TableName, // TableName: TableNameと同じ意味
    Limit: 100,

    // 一つのキーに複数の条件をつけることはできないため、BETWEEN演算を利用する
    KeyConditionExpression: "userId = :uid and #ts BETWEEN :start AND :end",
    // timestampは予約後であるため、プレースホルダ経由じゃないと指定できない。
    ExpressionAttributeNames: {
      "#ts": "timestamp",
    },
    ExpressionAttributeValues: {
      ":uid": userId,
      // startが無効な場合は、0以上という条件にすることで、実質フィルタリング無効化
      ":start": Number.isNaN(parseInt(start)) ? 0 : parseInt(start),
      // endが無効な場合は、現在時刻以下という条件にすることで、実質フィルタリング無効化
      ":end": Number.isNaN(parseInt(end)) ? Date.now() : parseInt(end),
    },
  };

  // categoryが存在する場合は別途該当のプロパティを追加する。
  if (category) {
    queryParam.FilterExpression = "category = :category";
    queryParam.ExpressionAttributeValues[":category"] = category;
  }

  queryParam.ExpressionAttributeValues = marshall(queryParam.ExpressionAttributeValues)

  return {
    hasValidQs,
    param: queryParam,
  };
};