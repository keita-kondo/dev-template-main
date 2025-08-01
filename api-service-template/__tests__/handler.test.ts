// handler.test.ts
import { handler } from '../src/handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

const createEvent = (query: Record<string, string>): APIGatewayProxyEvent => ({
  queryStringParameters: query,
  body: null,
  headers: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "/sample-calc",
  pathParameters: null,
  requestContext: {} as any,
  resource: "",
  stageVariables: null,
  multiValueHeaders: {},
  multiValueQueryStringParameters: null,
});

describe('handler', () => {
  it('should return 200 with correct sum', async () => {
    const event = createEvent({ num1: "10", num2: "20" });
    const res = await handler(event);
    
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body["calc-result"]).toBe(30);
    expect(body.date).toBeDefined();
  });

  it('should return 400 for missing params', async () => {
    const event = createEvent({ num1: "10" });
    const res = await handler(event);
    
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.code).toBe("INVALID_QUERY_PARAMS");
  });

  it('should return 400 for non-numeric values', async () => {
    const event = createEvent({ num1: "abc", num2: "123" });
    const res = await handler(event);

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.code).toBe("INVALID_QUERY_PARAMS");
  });
});
