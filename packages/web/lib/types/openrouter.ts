export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  context_length: number | null;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  per_request_limits: {
    prompt_tokens: number | string | null;
    completion_tokens: number | string | null;
  } | null;
}

export interface ModelsListResponse {
  data: OpenRouterModel[];
}

export interface SelectedModel {
  id: string;
  name: string;
}
