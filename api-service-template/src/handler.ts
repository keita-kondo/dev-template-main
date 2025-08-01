import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { paths } from "./types";
import { addNumbers } from './service';

type SuccessResponse = paths["/sample-calc"]["get"]["responses"]["200"]["content"]["application/json"];
type ErrorResponse = paths["/sample-calc"]["get"]["responses"]["400"]["content"]["application/json"];

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};

    // バリデーション
    if (
      !params.num1 || !params.num2 ||
      isNaN(Number(params.num1)) || isNaN(Number(params.num2))
    ) {
      const errorBody: ErrorResponse = {
        code: "INVALID_QUERY_PARAMS",
        message: "num1 and num2 must be valid numbers",
      };

      return {
        statusCode: 400,
        body: JSON.stringify(errorBody),
      };
    }

    const num1 = parseFloat(params.num1);
    const num2 = parseFloat(params.num2);

    const calcResult = addNumbers(num1, num2);

    const result: SuccessResponse = {
      date: new Date().toISOString(),
      "calc-result": calcResult,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (e) {
    const errorBody: ErrorResponse = {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    };

    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
    };
  }
};