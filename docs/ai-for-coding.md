# Prompt Engineering Exercises for AI-Assisted Development

Practice using AI tools (Cursor, Windsurf, Claude Code, ChatGPT) to work with this codebase. Start with reading and analysis, then progress to writing and refactoring.

---

## Exercise 1: Basic Code Explanation

**Goal:** Understand what a piece of code does.

**Prompt:**
```
Explain what this file does: src/lib/db/schema.ts
```

**What to observe:**
- Does the AI identify the Drizzle ORM schema?
- Does it explain the relationship between products and sections?

---

## Exercise 2: Find Specific Functionality

**Goal:** Locate where something is implemented.

**Prompt:**
```
Where is user authentication handled in this project?
```

**What to observe:**
- Does it find `src/lib/auth/session.ts`?
- Does it mention the login API route?
- Does it explain the cookie-based approach?

---

## Exercise 3: Understand the Architecture

**Goal:** Get a high-level view of the project structure.

**Prompt:**
```
Describe the architecture of this Next.js project. What patterns does it follow? How is the code organized?
```

**What to observe:**
- Does it identify the layered architecture (routes → services → repositories)?
- Does it mention the separation of concerns?
- Does it note the use of Zod for validation?

---

## Exercise 4: Code Review Request

**Goal:** Get feedback on existing code quality.

**Prompt:**
```
Review src/lib/services/productService.ts for potential improvements. Focus on error handling and type safety.
```

**What to observe:**
- Are the suggestions actionable?
- Does it respect the existing patterns?
- Does it avoid over-engineering?

---

## Exercise 5: Add Documentation

**Goal:** Generate JSDoc comments for existing code.

**Prompt:**
```
Add JSDoc comments to the exported functions in src/lib/repositories/sectionRepository.ts
```

**What to observe:**
- Are parameter types documented?
- Are return types documented?
- Do descriptions accurately reflect behavior?

---

## Exercise 6: Write a Unit Test

**Goal:** Create tests for existing functionality.

**Prompt:**
```
Write unit tests for src/lib/services/sectionService.ts using Vitest. Mock the repository layer.
```

**What to observe:**
- Does it follow existing test patterns in the project?
- Does it mock dependencies correctly?
- Does it cover success and error cases?

---

## Exercise 7: Simple Refactoring

**Goal:** Improve code without changing behavior.

**Prompt:**
```
Refactor the error handling in src/app/api/v1/product/route.ts to reduce duplication while keeping the same behavior.
```

**What to observe:**
- Is the refactoring minimal and focused?
- Does it preserve existing functionality?
- Does it follow project conventions?

---

## Exercise 8: Add Input Validation

**Goal:** Enhance an endpoint with better validation.

**Prompt:**
```
Add Zod validation to the PUT endpoint in src/app/api/v1/section/[id]/route.ts to validate that the name field is a non-empty string with max 100 characters.
```

**What to observe:**
- Does it use the existing Zod patterns from the project?
- Does it return appropriate error messages?
- Does it integrate cleanly with existing code?

---

## Exercise 9: Implement a New Feature

**Goal:** Add new functionality following existing patterns.

**Prompt:**
```
Add a new GET endpoint at /api/v1/product/section/[sectionId] that returns all products belonging to a specific section. Follow the existing patterns for error handling and response format.
```

**What to observe:**
- Does it follow the repository → service → route pattern?
- Does it handle the case when section doesn't exist?
- Does it match the code style of existing endpoints?

---

## Exercise 10: Complex Feature with Multiple Files

**Goal:** Implement a feature that spans multiple layers.

**Prompt:**
```
Implement a product search feature:
1. Add a repository method to search products by name (partial match)
2. Add a service method that calls the repository
3. Create a GET endpoint at /api/v1/product/search?q=term
4. Include proper validation and error handling
Follow the existing patterns in the codebase.
```

**What to observe:**
- Does it create changes in the correct files?
- Does it maintain consistency across layers?
- Does it handle edge cases (empty query, no results)?

---

## Tips for Effective Prompting

1. **Be specific** - Reference exact file paths when possible
2. **Set constraints** - "Follow existing patterns" prevents over-engineering
3. **One task at a time** - Complex prompts can lead to errors
4. **Review output** - Always verify AI suggestions before applying
5. **Iterate** - Refine your prompt if the result isn't right
