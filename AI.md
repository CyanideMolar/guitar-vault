# AI Transparency

This project was built collaboratively with [Claude Code](https://claude.ai/code) (Anthropic), an AI coding assistant, using the `claude-sonnet-4-6` model.

## How it was used

Nearly all of the code in this repository was written by Claude Code in response to conversational prompts. The human developer directed the work — describing features, reviewing results, catching mistakes, and steering design decisions — while Claude handled the implementation.

This includes:

- Initial project scaffolding (Next.js, Prisma, NextAuth)
- All UI components and page layouts
- API routes and database schema
- Dark mode implementation
- The view toggle (grid / compact / list) in My Collection
- This file

## What this means for the code

The code reflects Claude's defaults and idioms unless specifically redirected. It has been reviewed and tested by the developer, but it was not written line-by-line by a human. Treat it accordingly when auditing for security or making architectural changes.

## Commit history

Every commit includes a `Co-Authored-By: Claude Sonnet 4.6` trailer to make AI involvement visible at the git level.

## Why share this

Transparency about AI involvement helps other developers calibrate their trust in the code, understand the development process, and make informed decisions about contributing or forking.
