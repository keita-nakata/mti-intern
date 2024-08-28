const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
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

  // Parse the request body
  const { userId, hash } = event.body ? JSON.parse(event.body) : null;

  // Validate the input
  if (!userId || !hash) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "リクエストボディに必須パラメータがセットされていません。",
    });
    return response;
  }

  // Prepare the query parameters
  const param = {
    TableName,
    Key: marshall({
        userId
    })
  };

  const command = new GetItemCommand(param);

  try {
    // Execute the query
    const res = (await client.send(command)).Item;

    // Check if any items were found
    if (!res) {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: "userIdかhashが違います",
      });
      return response;
    }

    // Unmarshall the first item (assuming you expect only one)
    const data = unmarshall(res);
    
    if(data.hash === hash){
        response.body = JSON.stringify({ token: data.token });
    }else{
        response.statuscode = 500;
        response.body = JSON.stringify({
          message: "パスワードが違います"
        });
    }
    
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "デバッグ：予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};