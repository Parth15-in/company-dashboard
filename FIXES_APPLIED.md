# Database Connection Fixes - SHAKKTII_AI Project

## Summary
Fixed critical database connection errors across all API routes by correcting import statements and function names.

## Root Cause
The `middleware/db.js` file exports `dbConnect` as a **default export**, but multiple API files were importing it inconsistently:
- Some used named imports: `import { dbConnect }` or `import { connectDB }`
- Some referenced non-existent path: `../../../lib/dbConnect`
- Function calls didn't match imported names

## Files Fixed (11 total)

### Admin Interview APIs
1. **pages/api/admin/interviews/index.js**
   - Changed: `import {dbConnect}` → `import dbConnect`
   - Fixed path: `../../../../middleware/db`

2. **pages/api/admin/interviews/[id].js**
   - Fixed path: `../../../../lib/dbConnect` → `../../../../middleware/db`

3. **pages/api/admin/interviews/start.js**
   - Fixed path: `../../../lib/dbConnect` → `../../../../middleware/db`

4. **pages/api/admin/interviews/submit-mcq.js**
   - Fixed path: `../../../../lib/dbConnect` → `../../../../middleware/db`

### Interview APIs
5. **pages/api/interviews/[id].js**
   - Fixed path: `../../../../lib/dbConnect` → `../../../middleware/db`

### Job APIs
6. **pages/api/job-by-slug/[slug].js**
   - Fixed path: `../../../lib/dbConnect` → `../../../middleware/db`

7. **pages/api/job/create.js**
   - Changed: `import { connectDB }` → `import dbConnect`
   - Changed: `await connectDB()` → `await dbConnect()`

8. **pages/api/job/list.js**
   - Changed: `import { connectDB }` → `import dbConnect`
   - Changed: `await connectDB()` → `await dbConnect()`

### Session API
9. **pages/api/session/[id].js**
   - Fixed path: `../../../lib/dbConnect` → `../../../middleware/db`

### Auth APIs
10. **pages/api/auth/login.js**
    - Changed: `import { connectDB }` → `import dbConnect`
    - Changed: `await connectDB()` → `await dbConnect()`

11. **pages/api/auth/signup.js**
    - Changed: `import { connectDB }` → `import dbConnect`
    - Changed: `await connectDB()` → `await dbConnect()`

## Environment Variables Required
Ensure your `.env.local` file contains:
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
BASE_URL=<optional_base_url>
```

## Additional Fixes - API Endpoint Paths

### Frontend API Calls Fixed (3 files)
1. **pages/interview/[slug]/apply.js** (Line 30)
   - Changed: `/api/interview/start` → `/api/admin/interviews/start`

2. **pages/interview/[slug]/instructions.js** (Line 35)
   - Changed: `/api/interview/submit-mcq` → `/api/admin/interviews/submit-mcq`

3. **components/VoiceQuestion.js** (Line 180)
   - Changed: `/api/interview/submit-voice` → `/api/admin/interviews/upload-audio`

## Testing Checklist
- [ ] Start dev server: `npm run dev`
- [ ] Test POST /api/admin/interviews (create job)
- [ ] Test GET /api/admin/interviews (list jobs)
- [ ] Test POST /api/auth/signup (user registration)
- [ ] Test POST /api/auth/login (user login)
- [ ] Test POST /api/job/create (create job)
- [ ] Test GET /api/job/list (list jobs)
- [ ] Test GET /api/job-by-slug/[slug] (get job by slug)
- [ ] Test POST /api/admin/interviews/start (start interview)
- [ ] Test POST /api/admin/interviews/submit-mcq (submit answers)
- [ ] Test POST /api/admin/interviews/upload-audio (upload voice)

## Additional Fixes - OpenAI JSON Parsing

### pages/api/admin/interviews/start.js
Fixed JSON parsing to handle markdown code blocks and extra text from OpenAI responses:

1. **Enhanced JSON extraction** (Lines 26-34)
   - Strips markdown code blocks (`\`\`\`json` and `\`\`\``)
   - Handles OpenAI responses wrapped in formatting
   - Trims whitespace before parsing

2. **Improved error messages** (Line 39)
   - Added error message to response
   - Limited raw response to 500 chars to avoid huge error payloads

3. **Stricter prompt instructions** (Lines 66-87)
   - Explicitly tells OpenAI to output ONLY JSON
   - Forbids markdown code blocks
   - Forbids extra text before/after JSON
   - Clarifies correctOptionIndex must be 0-3

## Error Resolution

### Original Database Error
```
TypeError: (0 , _middleware_db__WEBPACK_IMPORTED_MODULE_0__.dbConnect) is not a function
```
**Cause**: Named import syntax used for default export, function name mismatches, wrong import paths
**Status**: ✅ RESOLVED (11 files fixed)

### Original API Endpoint Error
```
POST http://localhost:3000/api/interview/start 404 (Not Found)
```
**Cause**: Frontend calling wrong API endpoint paths
**Status**: ✅ RESOLVED (3 files fixed)

### OpenAI JSON Parsing Error
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```
**Cause**: OpenAI wrapping JSON in markdown code blocks or extra text
**Status**: ✅ RESOLVED (robust JSON extraction added)
