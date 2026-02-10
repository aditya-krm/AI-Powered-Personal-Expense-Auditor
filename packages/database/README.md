# @repo/database

Shared database package for the monorepo. Provides a centralized Prisma client and database types.

## Usage

```typescript
import { prisma } from "@repo/database";

const transactions = await prisma.transaction.findMany();
```

## Architecture

This package exports TypeScript source files directly (`main` and `types` point to `.ts` files). This works because:

1. This is a **private** monorepo package (not published to npm)
2. All consumers (apps/bot and apps/web) use Bun or Next.js which can transpile TypeScript
3. The Prisma client is pre-generated via the `postinstall` hook

## Note for External Consumers

If this package needs to be consumed by standard Node.js applications or published to npm:

1. Add a build script to compile TypeScript to JavaScript
2. Update `main` to point to `./dist/index.js`
3. Update `types` to point to `./dist/index.d.ts`
4. Add `dist/` to the files array in package.json
