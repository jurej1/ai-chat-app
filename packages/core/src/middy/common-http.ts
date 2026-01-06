import errorLogger from "@middy/error-logger";
import httpContentEncoding from "@middy/http-content-encoding";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";

export const commonHttp = () => [
  httpCors(),
  errorLogger(),
  httpErrorHandler(),
  httpContentEncoding(),
  httpJsonBodyParser({ disableContentTypeError: true }),
  httpResponseSerializer({
    serializers: [
      {
        regex: /^application\/json$/,
        serializer: ({ body }) => JSON.stringify(body),
      },
    ],
    defaultContentType: "application/json",
  }),
];
