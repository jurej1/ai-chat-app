import {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

export type ApiGwRequest<
  T extends {
    body?: unknown;
    queryStringParameters?: unknown;
    pathParameters?: unknown;
    extras?: Record<string, unknown>;
  } = {}
> = Omit<
  APIGatewayProxyEventV2WithLambdaAuthorizer<{
    userId: string;
    emailVerified: boolean;
  }>,
  "body" | "queryStringParameters" | "pathParameters"
> & {
  body: T["body"];
  queryStringParameters: T["queryStringParameters"];
  pathParameters: T["pathParameters"];
  extras: T["extras"];
};

export type ApiGwResponse = Omit<APIGatewayProxyStructuredResultV2, "body"> & {
  body?: Record<string, any> | Array<Record<string, any>>;
};
