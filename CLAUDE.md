# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Chat App is a modern full-stack application built with SST v3 for infrastructure-as-code, Next.js 16 for the frontend, and OpenRouter SDK for AI chat capabilities. It uses an npm monorepo structure with clear package separation.

**Architecture Approach**: Client-centric - chat functionality runs entirely in the browser via direct OpenRouter API calls. The API Gateway exists as infrastructure placeholder but is not currently used for chat endpoints.

## Development Commands

### Project Setup
```bash
npm install                              # Install all workspace dependencies
```

### Deployment
```bash
npx sst deploy                           # Deploy to AWS (dev stage)
npx sst deploy --stage production       # Deploy to production
sst shell                                # Enter SST environment (needed for scripts/tests)
```

### Frontend Development (packages/web)
```bash
cd packages/web
npm run dev                              # Start Next.js dev server (localhost:3000)
npm run build                            # Build for production
npm start                                # Start production server
npm run lint                             # Run ESLint
```

### Testing
```bash
cd packages/core
npm test                                 # Run Vitest via sst shell
```

### Running Scripts
```bash
npm run shell tsx <file>                 # Run utility scripts in SST environment
```

## Monorepo Package Structure

### packages/core
Shared business logic and type definitions exported as ES modules.

**Key Exports**:
- `@ai-chat-app/core/types/types`: MessageRole, Message, ChatRequest, ChatStreamChunk
- `@ai-chat-app/core/types/aws`: AWS Lambda type definitions

**Testing**: Vitest configured to run via `sst shell vitest`

### packages/functions
AWS Lambda functions (currently minimal - chat moved to client-side).
Uses Middy middleware for CORS, JSON body parsing.

### packages/web
Next.js 16 + React 19 frontend application.

**Key Dependencies**:
- Radix UI for accessible components
- Tailwind CSS v4 for styling
- OpenRouter SDK for AI chat
- react-markdown + react-syntax-highlighter for message rendering
- Sonner for toast notifications
- Zod for environment validation

**Component Architecture**:
```
components/
├── chat/              # Chat UI components (ChatUI, ChatHeader, ChatInput, ChatMessage, ChatMessages)
├── model-selector/    # Model selection modal with tabs for available/saved models
├── settings/          # ApiKeyDialog for custom API key management
├── ui/                # shadcn/radix-ui base components
└── AppSidebar.tsx     # Main sidebar navigation
```

**Library Architecture**:
```
lib/
├── api.ts             # OpenRouter SDK integration, streaming logic
├── env.ts             # Zod environment validation
├── models.ts          # Model fetching with 1-hour localStorage cache
├── hooks/
│   ├── useChat.ts             # Message state, streaming, abort control
│   ├── useModels.ts           # Model list fetching
│   ├── useModelSelection.ts   # Selected model state
│   └── useSavedModels.ts      # localStorage saved model management
```

### packages/scripts
Utility scripts that run via `sst shell` and `tsx`. Use for database migrations, seed scripts, or administrative tasks.

## Infrastructure (infra/)

SST infrastructure split into logical modules, all imported via `infra/index.ts`:

### infra/api/
- ApiGatewayV2 with CORS enabled
- Currently placeholder (chat route removed)

### infra/web/
- StaticSite for Next.js deployment
- Builds from `packages/web/out`
- Injects NEXT_PUBLIC_OPENROUTER_API_KEY from secrets

### infra/secrets/
- SST Secret for OPENROUTER_API_KEY storage

## Architecture Patterns

### State Management
- **React Hooks**: Custom hooks in lib/hooks/ manage all application state
- **localStorage**:
  - Caches OpenRouter models list (1-hour TTL)
  - Stores user's custom API key (if provided)
  - Persists saved models list

### Streaming Chat
- Uses OpenRouter SDK's async generator pattern
- AbortController for cancellable streams
- Chunk-by-chunk message state updates
- Error handling for aborted/failed streams

### Model Management
- Two-tab modal: "Available Models" (from API) + "Saved Models" (localStorage)
- Free-only filter toggle
- Search functionality across model names
- 1-hour cache expiration for model list

### Environment & Secrets
- SST Secrets for OPENROUTER_API_KEY (injected at build time)
- Zod validation in lib/env.ts
- Support for user-provided API keys via ApiKeyDialog

## TypeScript Configuration

- **Root**: Node 22 compatible (@tsconfig/node22)
- **core**: ESNext module, bundler resolution
- **functions**: ES2022 target, strict mode, includes sst-env.d.ts
- **web**: ES2017 target, Next.js plugin enabled, path alias @ -> ./

## Important Notes

- Web package is **excluded from workspaces** in root package.json (handled separately by Next.js)
- Chat functionality is entirely client-side - no backend Lambda for chat currently
- Model list caching reduces API calls to OpenRouter
- Next.js uses React 19 (latest)
- Tailwind CSS v4 with PostCSS integration
