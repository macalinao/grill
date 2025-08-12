---
allowed-tools:
  - Bash
  - Edit
  - MultiEdit
  - Read
description: Run TypeScript checks and fix all errors
---

Run the following commands in sequence and fix all TypeScript and linting errors:

1. First, run `bun run build` to identify all TypeScript errors
2. Fix each TypeScript error found by:
   - Reading the affected files
   - Understanding the error context
   - Making the necessary code changes to resolve the errors
3. After fixing TypeScript errors, run `bun run lint:fix` to automatically fix linting issues
4. If there are any remaining linting errors that can't be auto-fixed, manually fix them
5. Run both commands again to verify all errors are resolved. IF THE ERRORS ARE NOT RESOLVED, REPEAT THE ENTIRE PROCESS.
6. Provide a summary of what was fixed

Be thorough and ensure all errors are resolved before completing the task.
