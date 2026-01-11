export enum ChatErrorType {
  NETWORK = "network",
  API = "api",
  RATE_LIMIT = "rate_limit",
  API_KEY = "api_key",
  MODEL_UNAVAILABLE = "model_unavailable",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ChatError {
  type: ChatErrorType;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: Date;
}

export class ChatErrorFactory {
  static fromException(error: unknown): ChatError {
    // Network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        type: ChatErrorType.NETWORK,
        message: "Network connection failed",
        details: "Please check your internet connection",
        retryable: true,
        timestamp: new Date(),
      };
    }

    // API errors from OpenRouter
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("rate limit") || message.includes("429")) {
        return {
          type: ChatErrorType.RATE_LIMIT,
          message: "Rate limit exceeded",
          details: "Please wait a moment before trying again",
          retryable: true,
          timestamp: new Date(),
        };
      }

      if (
        message.includes("api key") ||
        message.includes("401") ||
        message.includes("unauthorized")
      ) {
        return {
          type: ChatErrorType.API_KEY,
          message: "API key is invalid or missing",
          details: "Please check your API key in settings",
          retryable: false,
          timestamp: new Date(),
        };
      }

      if (
        message.includes("model") &&
        (message.includes("not found") || message.includes("unavailable"))
      ) {
        return {
          type: ChatErrorType.MODEL_UNAVAILABLE,
          message: "Selected model is unavailable",
          details: "Please try a different model",
          retryable: false,
          timestamp: new Date(),
        };
      }

      if (message.includes("timeout")) {
        return {
          type: ChatErrorType.TIMEOUT,
          message: "Request timed out",
          details: "The model took too long to respond",
          retryable: true,
          timestamp: new Date(),
        };
      }

      // Generic API error
      return {
        type: ChatErrorType.API,
        message: error.message,
        retryable: true,
        timestamp: new Date(),
      };
    }

    // Unknown error
    return {
      type: ChatErrorType.UNKNOWN,
      message: "An unexpected error occurred",
      retryable: true,
      timestamp: new Date(),
    };
  }
}
