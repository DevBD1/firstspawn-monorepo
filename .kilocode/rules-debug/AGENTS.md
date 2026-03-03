# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Debug Rules (Non-Obvious Only)

### Environment-Specific Behavior
- `robots.ts` blocks all indexing when `VERCEL_ENV !== 'production'`
- Preview deployments are automatically no-index without manual config changes

### AI Captcha Fallback Chain
1. Gemini 2.0 Flash (primary)
2. OpenAI gpt-4o-mini (fallback)
3. Static "ACCESS GRANTED/DENIED" (final fallback)
- Failures are silent - check server logs for API errors

### Missing Test Runner
- **Not yet implemented** - `npm test` exists in turbo config but no test runner installed
- Add Vitest/Jest before attempting to write or run tests

### Mobile Workspace
- Currently placeholder only - Expo not initialized
- Run `npx create-expo-app@latest . --template` before mobile development

### API Placeholder
- `@firstspawn/api` has no real functionality
- TypeScript API is placeholder; production API planned in Python
