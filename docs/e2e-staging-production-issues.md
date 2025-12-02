# E2E Test Execution Issues: Staging & Production Environments

## Critical Issues Identified

### 🔴 CRITICAL: Database Architecture Issues

#### Issue 1.1: SQLite File System Dependencies
**Problem**: SQLite requires persistent file system access, which may not be available in:
- Serverless environments (Vercel, AWS Lambda, Cloudflare Workers)
- Ephemeral containers (Kubernetes pods, Docker containers without volumes)
- Read-only file systems

**Impact**: 
- Tests may fail if database file cannot be created/written
- Database locks in concurrent test execution
- Data persistence issues across test runs

**Current Code Location**: `src/lib/db/index.ts:10`
```typescript
sqlite = new BetterSqlite3(process.env.DATABASE_URL || "sqlite.db");
```

**Questions Needed**:
- What hosting platform are you using? (Vercel, AWS, GCP, self-hosted?)
- Is the file system writable in staging/production?
- Are you using persistent volumes or ephemeral storage?

---

#### Issue 1.2: Database File Path Resolution
**Problem**: Relative paths (`sqlite.db`) may resolve differently in CI/CD vs production
- CI/CD: May resolve to workspace root
- Production: May resolve to different directory
- Tests: May create database in wrong location

**Impact**: Tests may not connect to the same database as the application

**Questions Needed**:
- How is `DATABASE_URL` configured in staging/production?
- Is it an absolute path or relative path?
- Where is the database file located in production?

---

#### Issue 1.3: Database Concurrency & Isolation
**Problem**: 
- SQLite WAL mode helps but doesn't eliminate concurrency issues
- Multiple test workers may conflict accessing same database file
- No database isolation between test runs

**Impact**:
- Test flakiness due to database locks
- Data contamination between tests
- Race conditions in parallel test execution

**Current Code Location**: `src/lib/db/index.ts:12-14`
```typescript
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
```

**Questions Needed**:
- Will tests run in parallel? How many workers?
- Do you need database isolation per test worker?
- Can you use separate database files per test run?

---

### 🔴 CRITICAL: Authentication & Security Issues

#### Issue 2.1: Hardcoded Test Credentials in Production Code
**Problem**: Test users are hardcoded in production codebase
```typescript
// src/lib/auth/index.ts:4-7
export const users = [
  { id: "1", username: "user", password: "user", role: "USER" },
  { id: "2", username: "admin", password: "admin", role: "ADMIN" },
];
```

**Impact**:
- Security risk: Test credentials exposed in production
- Tests may fail if credentials are changed/removed in production
- Cannot use different test users per environment

**Questions Needed**:
- Are these credentials actually used in production?
- Should test users be environment-specific?
- Do you need separate test accounts for staging vs production?

---

#### Issue 2.2: Cookie Security Settings
**Problem**: Cookie security depends on `NODE_ENV`
```typescript
// src/lib/auth/index.ts:21
secure: process.env.NODE_ENV === "production",
```

**Impact**:
- Tests may fail if cookies aren't set correctly
- HTTPS vs HTTP cookie handling differences
- Cross-domain cookie issues in CI/CD

**Questions Needed**:
- Is staging using HTTPS or HTTP?
- Are tests running against HTTPS endpoints?
- Do you need to handle cookie domain/path differences?

---

#### Issue 2.3: Session Cookie Parsing
**Problem**: JSON parsing without validation
```typescript
// src/lib/auth/index.ts:40
const data = JSON.parse(session.value);
```

**Impact**:
- Tests may fail if cookie format changes
- No validation of cookie structure
- Potential security vulnerabilities

**Questions Needed**:
- Should cookie format be validated?
- Are there any cookie size limits to consider?

---

### 🟡 HIGH: Environment Configuration Issues

#### Issue 3.1: Missing Environment Variable Management
**Problem**: No `.env` files or environment variable documentation
- `DATABASE_URL` defaults to `sqlite.db` if not set
- No clear environment-specific configuration
- Tests may use wrong environment settings

**Impact**:
- Tests may connect to wrong database
- Configuration drift between environments
- Difficult to debug environment-specific issues

**Questions Needed**:
- How are environment variables managed? (Vercel, AWS Secrets Manager, etc.)
- Are there different configs for staging vs production?
- Should tests use separate environment variables?

---

#### Issue 3.2: Base URL Configuration
**Problem**: Tests need to know staging/production URLs
- Hardcoded `localhost:3000` in test examples
- No environment-based URL configuration
- Different domains for staging/production

**Impact**:
- Tests won't work against staging/production without code changes
- Need different test configs per environment

**Questions Needed**:
- What are the staging and production URLs?
- Should tests run against both environments?
- Do you need environment-specific test configurations?

---

#### Issue 3.3: NODE_ENV Detection
**Problem**: Multiple places check `NODE_ENV`:
- Cookie security settings
- Potentially other conditional logic

**Impact**:
- Tests may behave differently based on `NODE_ENV`
- Staging might use production settings if misconfigured

**Questions Needed**:
- What `NODE_ENV` values are used in staging/production?
- Should tests set a specific `NODE_ENV`?

---

### 🟡 HIGH: Test Data Management Issues

#### Issue 4.1: No Test Data Isolation Strategy
**Problem**: 
- No clear strategy for seeding test data
- No cleanup mechanism for test data
- Tests may interfere with each other

**Impact**:
- Test flakiness due to data conflicts
- Tests may fail if previous test data exists
- Cannot run tests in parallel safely

**Questions Needed**:
- Should tests use a separate test database?
- Do you need to seed data before each test run?
- Should tests clean up after themselves?

---

#### Issue 4.2: Test Data Contamination Risk
**Problem**: Tests may create/modify data that affects:
- Other concurrent tests
- Production/staging data (if using same database)
- Future test runs

**Impact**:
- Unpredictable test failures
- Data corruption in staging/production
- Tests not idempotent

**Questions Needed**:
- Will tests run against production database? (Should be NO)
- Should tests use unique identifiers to avoid conflicts?
- Do you need database snapshots/rollbacks?

---

#### Issue 4.3: Database Migration State
**Problem**: Tests assume database schema is up-to-date
- No migration verification in tests
- Schema drift between environments
- Tests may fail if migrations haven't run

**Impact**:
- Tests fail if database schema is outdated
- Inconsistent behavior across environments

**Questions Needed**:
- Are migrations run automatically in staging/production?
- Should tests verify schema before running?
- Do you need to run migrations as part of test setup?

---

### 🟡 HIGH: Network & Connectivity Issues

#### Issue 5.1: Network Timeouts & Retries
**Problem**: 
- No timeout configuration for API calls
- Network latency in staging/production may differ
- No retry logic for flaky network conditions

**Impact**:
- Tests may timeout unexpectedly
- Flaky tests due to network issues
- Different behavior in CI/CD vs local

**Questions Needed**:
- What are typical response times in staging/production?
- Should tests have longer timeouts for staging/production?
- Do you need retry logic for network requests?

---

#### Issue 5.2: DNS Resolution
**Problem**: Tests may fail if:
- DNS not configured in CI/CD environment
- Staging/production URLs not resolvable from test environment
- Different DNS settings per environment

**Impact**:
- Tests cannot connect to staging/production
- Connection failures

**Questions Needed**:
- Can CI/CD resolve staging/production DNS?
- Are there firewall/network restrictions?
- Do you need VPN/proxy configuration?

---

#### Issue 5.3: CORS & Cross-Origin Issues
**Problem**: 
- Tests running from different origin than application
- CORS headers may block test requests
- Cookie domain/path restrictions

**Impact**:
- Tests may fail due to CORS errors
- Cookies may not be set correctly

**Questions Needed**:
- Are there CORS restrictions in staging/production?
- Should tests run from same origin?
- Do you need CORS configuration for test origins?

---

### 🟠 MEDIUM: CI/CD Specific Issues

#### Issue 6.1: Build & Deployment Timing
**Problem**: 
- Tests may run before deployment completes
- Race conditions between deployment and test execution
- Staging may not be ready when tests start

**Impact**:
- Tests fail due to application not being ready
- False negatives

**Questions Needed**:
- When do tests run? (Before/after deployment?)
- Do you need health checks before running tests?
- Should tests wait for deployment to complete?

---

#### Issue 6.2: Resource Constraints
**Problem**: 
- CI/CD environments may have limited resources
- Memory/CPU constraints affect test execution
- Browser automation is resource-intensive

**Impact**:
- Tests may timeout or fail due to resource limits
- Slower test execution
- OOM (Out of Memory) errors

**Questions Needed**:
- What are CI/CD resource limits?
- How many parallel test workers can run?
- Do you need to optimize test execution?

---

#### Issue 6.3: Artifact Management
**Problem**: 
- Test reports, screenshots, videos need storage
- Artifacts may not be accessible after test run
- Large artifacts may exceed storage limits

**Impact**:
- Cannot debug test failures
- Storage costs
- Missing test evidence

**Questions Needed**:
- Where should test artifacts be stored?
- How long should artifacts be retained?
- What's the storage limit?

---

### 🟠 MEDIUM: Test Execution Flakiness

#### Issue 7.1: Timing & Race Conditions
**Problem**: 
- Server Components may load asynchronously
- Suspense boundaries may cause timing issues
- Network requests may complete in different order

**Impact**:
- Flaky tests due to timing
- Tests pass locally but fail in CI/CD

**Questions Needed**:
- Are there known timing-sensitive areas?
- Should tests use explicit waits instead of fixed timeouts?
- Do you need to handle async operations differently?

---

#### Issue 7.2: Browser/Environment Differences
**Problem**: 
- Different browser versions in CI/CD vs local
- Different OS environments
- Headless vs headed browser differences

**Impact**:
- Tests pass locally but fail in CI/CD
- Inconsistent behavior

**Questions Needed**:
- What browsers/versions are used in CI/CD?
- Should tests run in headless mode?
- Do you need to match local and CI/CD environments?

---

#### Issue 7.3: External Dependencies
**Problem**: 
- Tests may depend on external services
- External services may be unavailable
- Rate limiting on external APIs

**Impact**:
- Tests fail due to external service issues
- Not true E2E if external services are down

**Questions Needed**:
- Are there external dependencies?
- Should external services be mocked?
- Do you need to handle rate limiting?

---

### 🟠 MEDIUM: Monitoring & Observability

#### Issue 8.1: Test Failure Debugging
**Problem**: 
- Limited visibility into test failures
- No logging/tracing in test environment
- Difficult to reproduce failures

**Impact**:
- Hard to debug test failures
- Long feedback loops

**Questions Needed**:
- Do you need test logging/tracing?
- Should tests capture network requests?
- Do you need video/screenshot on failure?

---

#### Issue 8.2: Test Metrics & Reporting
**Problem**: 
- No visibility into test performance
- Cannot track test flakiness trends
- No alerting on test failures

**Impact**:
- Cannot identify problematic tests
- No data-driven test optimization

**Questions Needed**:
- Do you need test metrics dashboard?
- Should test failures trigger alerts?
- Do you need historical test data?

---

## Summary of Critical Questions

### Infrastructure & Deployment
1. **What hosting platform are you using?** (Vercel, AWS, GCP, self-hosted, etc.)
Self hosted
2. **Is the file system writable in staging/production?** (Critical for SQLite)
   ✅ **ANSWERED**: No, we will use a different database
   📋 **RECOMMENDATION**: See Database Migration Recommendations section below
3. **What are the staging and production URLs?**
   ⏳ **PENDING**: To be provided later
4. **How are environment variables managed?** (Vercel, AWS Secrets Manager, etc.)
   ✅ **ANSWERED**: Keycloak (Note: Keycloak is typically for authentication - please clarify if you meant a secrets manager like HashiCorp Vault, AWS Secrets Manager, or if Keycloak is being used for secrets storage)
5. **When do tests run?** (Before/after deployment, on schedule, on-demand?)
   ✅ **ANSWERED**: After deployment

### Database
6. **How is `DATABASE_URL` configured in staging/production?** (Absolute/relative path?)
7. **Will tests run in parallel?** How many workers?
8. **Should tests use a separate test database?**
9. **Are migrations run automatically in staging/production?**

### Authentication & Security
10. **Are test credentials actually used in production?**
11. **Should test users be environment-specific?**
12. **Is staging using HTTPS or HTTP?**
13. **Are there CORS restrictions in staging/production?**

### Test Execution
14. **What browsers/versions are used in CI/CD?**
15. **Should tests run in headless mode?**
16. **What are typical response times in staging/production?**
17. **Can CI/CD resolve staging/production DNS?**
18. **What are CI/CD resource limits?** (Memory, CPU, storage)

### Test Data & Isolation
19. **Do you need to seed data before each test run?**
20. **Should tests clean up after themselves?**
21. **Will tests run against production database?** (Should be NO)

### Monitoring & Debugging
22. **Do you need test logging/tracing?**
23. **Should test failures trigger alerts?**
24. **Where should test artifacts be stored?**

---

## Recommended Next Steps

1. **Answer the critical questions above** to identify specific issues for your setup
2. **Create environment-specific test configurations** based on your answers
3. **Implement database isolation strategy** (separate test database or cleanup)
4. **Set up proper authentication for tests** (environment-specific test users)
5. **Configure CI/CD pipeline** with proper test execution timing
6. **Add monitoring and debugging** capabilities for test failures

---

## Quick Wins to Address Immediately

1. ✅ **Use environment-specific base URLs** in test configuration
2. ✅ **Separate test database** or implement cleanup strategy
3. ✅ **Environment-specific test credentials** (not hardcoded)
4. ✅ **Add health checks** before running tests
5. ✅ **Configure proper timeouts** for staging/production environments

---

## Database Migration Recommendations

Since you're moving away from SQLite for staging/production, here are the recommended database options compatible with Drizzle ORM:

### Recommended Options (in order of preference)

#### 1. **PostgreSQL** (Highly Recommended)
**Why**: 
- ✅ Excellent Drizzle ORM support
- ✅ Production-ready, battle-tested
- ✅ Great concurrency support (perfect for parallel tests)
- ✅ Supports connection pooling
- ✅ Works well in self-hosted environments

**Migration Path**:
```bash
# Install PostgreSQL driver
pnpm add postgres
pnpm add -D @types/pg

# Update drizzle.config.ts
dialect: 'postgresql'
dbCredentials: {
  url: process.env.DATABASE_URL
}

# Update src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
```

**For E2E Tests**:
- Use separate test database per environment
- Connection string: `postgresql://user:pass@host:5432/test_db`
- Easy to create/drop test databases

---

#### 2. **MySQL/MariaDB** (Good Alternative)
**Why**:
- ✅ Good Drizzle ORM support
- ✅ Widely used in self-hosted environments
- ✅ Good performance

**Migration Path**:
```bash
pnpm add mysql2
dialect: 'mysql'
```

---

#### 3. **SQLite (in-memory for tests only)**
**Why**:
- ✅ Keep SQLite for local development
- ✅ Use in-memory SQLite for E2E tests (fast, isolated)
- ✅ Use PostgreSQL/MySQL for staging/production

**Hybrid Approach**:
- Development: SQLite file
- E2E Tests: SQLite in-memory (`:memory:`)
- Staging/Production: PostgreSQL/MySQL

---

### Test Database Strategy

**Recommended**: Separate test database per environment
```
- staging-test-db (for staging E2E tests)
- production-test-db (for production E2E tests - read-only or separate)
```

**Questions Needed**:
- Which database do you prefer? (PostgreSQL recommended)
- Do you have database infrastructure already set up?
- Can you create separate test databases?

---

## Clarification Needed: Keycloak

You mentioned **Keycloak** for environment variable management. Keycloak is typically an **Identity and Access Management (IAM)** solution, not a secrets manager.

**Please clarify**:
- Are you using Keycloak for **authentication** (replacing the current cookie-based auth)?
- Or did you mean a different tool for **environment variables/secrets**? (e.g., HashiCorp Vault, AWS Secrets Manager, Kubernetes Secrets, etc.)
- Or is Keycloak being used to store configuration/secrets in your setup?

This is important because:
- If Keycloak is for auth: Tests need to authenticate via Keycloak instead of hardcoded users
- If it's for secrets: Tests need to retrieve credentials from that system
- Different approaches require different test setup strategies

---

## Remaining Critical Questions

Based on your answers, here are the **remaining critical questions** needed to finalize the E2E testing strategy:

### Database (HIGH PRIORITY)
6. **Which database will you use for staging/production?** (PostgreSQL, MySQL, other?)
7. **How is `DATABASE_URL` configured?** (Connection string format, where stored?)
8. **Will tests run in parallel?** How many workers?
9. **Should tests use a separate test database?** (Recommended: YES)
10. **Are migrations run automatically in staging/production?** (As part of deployment?)

### Authentication & Security (HIGH PRIORITY)
11. **Clarification on Keycloak**: Is Keycloak for authentication or secrets management?
12. **Are the hardcoded test credentials (`user`/`admin`) actually used in production?**
13. **Should test users be environment-specific?** (Different credentials per environment?)
14. **Is staging using HTTPS or HTTP?**
15. **Are there CORS restrictions in staging/production?**
16. **Will authentication be migrated to Keycloak?** (If yes, tests need OAuth/OIDC flow)

### Test Execution (MEDIUM PRIORITY)
17. **What browsers/versions are used in CI/CD?** (Chrome, Firefox, Safari versions?)
18. **Should tests run in headless mode?** (Recommended: YES for CI/CD)
19. **What are typical response times in staging/production?** (To set appropriate timeouts)
20. **Can CI/CD resolve staging/production DNS?** (Network connectivity)
21. **What are CI/CD resource limits?** (Memory, CPU, storage - affects parallelization)

### Test Data & Isolation (MEDIUM PRIORITY)
22. **Do you need to seed data before each test run?** (Or use existing data?)
23. **Should tests clean up after themselves?** (Recommended: YES)
24. **Will tests run against production database?** (Should be NO - use separate test DB)

### Monitoring & Debugging (LOWER PRIORITY)
25. **Do you need test logging/tracing?** (For debugging failures)
26. **Should test failures trigger alerts?** (Slack, email, etc.)
27. **Where should test artifacts be stored?** (Screenshots, videos, reports)

---

## Next Steps Based on Answers

Once you answer the **Database** and **Authentication** questions (6-16), I can provide:
1. ✅ **Database migration guide** (if needed)
2. ✅ **Test database setup strategy**
3. ✅ **Authentication test fixtures** (Keycloak or current system)
4. ✅ **Environment-specific test configuration**
5. ✅ **Health check implementation** (since tests run after deployment)

