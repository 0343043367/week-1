# Git Commit Best Practices

## 📝 Conventional Commits

Dự án này nên tuân theo [Conventional Commits](https://www.conventionalcommits.org/) để duy trì lịch sử commit rõ ràng và nhất quán.

## 🎯 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Bắt buộc)

- `feat`: Thêm tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi documentation
- `style`: Thay đổi code style (formatting, không ảnh hưởng logic)
- `refactor`: Refactor code (không thêm feature, không sửa bug)
- `perf`: Cải thiện performance
- `test`: Thêm hoặc sửa tests
- `build`: Thay đổi build system hoặc dependencies
- `ci`: Thay đổi CI/CD configuration
- `chore`: Các thay đổi khác không ảnh hưởng src hoặc test files

### Scope (Optional)

Phạm vi của commit (module/component bị ảnh hưởng):

- `api`: Backend API changes
- `frontend`: Frontend changes
- `auth`: Authentication related
- `k8s`: Kubernetes manifests
- `ci`: CI/CD workflows
- `deps`: Dependencies updates

### Subject (Bắt buộc)

- Sử dụng imperative mood: "add" không phải "added" hay "adds"
- Không viết hoa chữ cái đầu
- Không dấu chấm ở cuối
- Tối đa 50 ký tự
- Mô tả ngắn gọn những gì commit làm

### Body (Optional)

- Giải thích **tại sao** thay đổi này cần thiết
- Giải thích **cách** thay đổi giải quyết vấn đề
- Wrap text ở 72 ký tự
- Có thể có nhiều paragraphs

### Footer (Optional)

- Tham chiếu đến issues: `Fixes #123`, `Closes #456`
- Breaking changes: `BREAKING CHANGE: <description>`

## ✅ Good Examples

### Feature Addition

```bash
git commit -m "feat(auth): add OpenID Connect SSO integration

Implement OpenID Connect flow with MindX ID provider:
- Add /auth/openid/login endpoint to initiate flow
- Add /auth/callback to handle authorization code exchange
- Extract user info from ID token and /me endpoint
- Generate JWT for session management

Closes #5"
```

### Bug Fix

```bash
git commit -m "fix(frontend): correct user info display for OpenID login

Previously, hardcoded user info was shown instead of actual
data from OpenID provider. Now properly extracts email and
name from the ID token and /me endpoint.

Fixes #12"
```

### UI Improvement

```bash
git commit -m "style(frontend): improve dashboard UI with modern design

- Add gradient backgrounds and animations
- Enhance button hover effects
- Improve card shadows and spacing
- Add fadeIn animations for better UX"
```

### Documentation

```bash
git commit -m "docs: add comprehensive authentication flow guide

Create detailed documentation covering:
- JWT authentication flow diagrams
- OpenID Connect integration steps
- Protected route implementation
- Security best practices

Related to #8"
```

### Refactoring

```bash
git commit -m "refactor(auth): extract OpenID callback logic to separate function

Move OpenID callback handling to dedicated function for better
code organization and reusability. No functional changes."
```

### CI/CD Changes

```bash
git commit -m "ci: fix GitHub Actions workflow for deployment

- Update deployment names to match k8s manifests
- Change workflow trigger to manual only
- Fix health check endpoint URL
- Add condition to check for Azure credentials"
```

### Adding Protected Pages

```bash
git commit -m "feat(frontend): add Profile and Settings protected pages

Implement two new protected routes to demonstrate
authentication flow:
- /profile: Display user information
- /settings: Account and security settings
- Add Navigation component with route links

This addresses feedback on AC6 to have multiple protected
pages for better verification."
```

## ❌ Bad Examples

### Too Vague

```bash
# ❌ Bad
git commit -m "update files"
git commit -m "fix bug"
git commit -m "changes"

# ✅ Good
git commit -m "fix(api): handle missing authorization header in JWT middleware"
```

### Too Long Subject

```bash
# ❌ Bad
git commit -m "feat(frontend): add new feature that allows users to login with MindX ID using OpenID Connect protocol"

# ✅ Good
git commit -m "feat(frontend): add OpenID Connect login with MindX ID"
```

### Mixed Changes

```bash
# ❌ Bad - One commit với nhiều unrelated changes
git commit -m "add new feature, fix bugs, update docs, refactor code"

# ✅ Good - Separate commits
git commit -m "feat(api): add user profile endpoint"
git commit -m "fix(auth): correct token expiration validation"
git commit -m "docs: update API documentation"
git commit -m "refactor(auth): simplify JWT middleware"
```

### Wrong Type

```bash
# ❌ Bad
git commit -m "feat(frontend): fix login button style"

# ✅ Good
git commit -m "style(frontend): fix login button style"
```

## 🔄 Commit Workflow

### 1. Make Small, Focused Commits

Mỗi commit nên đại diện cho một thay đổi logic duy nhất:

```bash
# ❌ Bad - Tất cả trong một commit
git add .
git commit -m "implement authentication"

# ✅ Good - Chia nhỏ theo modules
git add api/src/middleware/auth.ts
git commit -m "feat(api): add JWT authentication middleware"

git add api/src/index.ts
git commit -m "feat(api): add login and register endpoints"

git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(frontend): implement AuthContext for state management"

git add frontend/src/components/Login.tsx
git commit -m "feat(frontend): create Login component"
```

### 2. Commit Frequently

```bash
# Work on a feature
git add <files>
git commit -m "feat(api): add base authentication endpoint"

# Continue working
git add <files>
git commit -m "feat(api): add password hashing with bcrypt"

# More work
git add <files>
git commit -m "feat(api): add JWT token generation"
```

### 3. Review Before Committing

```bash
# Check what will be committed
git status
git diff --cached

# Add files selectively
git add -p  # Interactive staging

# Commit
git commit -m "feat(frontend): add dashboard component"
```

### 4. Use Branches for Features

```bash
# Create feature branch
git checkout -b feature/openid-connect

# Make commits
git commit -m "feat(api): add OpenID configuration"
git commit -m "feat(api): implement authorization URL generation"
git commit -m "feat(api): add callback handler"

# Merge to main
git checkout main
git merge feature/openid-connect
```

## 📊 Commit Organization for This Project

### Recommended Commit Structure

#### Phase 1: API Development

```
feat(api): initialize Express TypeScript project
feat(api): add user registration endpoint
feat(api): add user login endpoint
feat(api): implement JWT authentication middleware
feat(api): add protected API endpoints
test(api): add authentication tests
```

#### Phase 2: OpenID Integration

```
feat(api): add OpenID Connect configuration
feat(api): implement OpenID authorization flow
feat(api): add OpenID callback handler
fix(api): handle missing user info from ID token
docs(api): document OpenID Connect setup
```

#### Phase 3: Frontend Development

```
feat(frontend): initialize React TypeScript project
feat(frontend): create AuthContext for state management
feat(frontend): implement Login component
feat(frontend): implement Register component
feat(frontend): add OpenID login button
feat(frontend): create Dashboard component
feat(frontend): implement protected routes
style(frontend): improve UI with modern design
```

#### Phase 4: Infrastructure

```
build(docker): add Dockerfile for API
build(docker): add Dockerfile for frontend
build(k8s): create API deployment manifest
build(k8s): create frontend deployment manifest
build(k8s): add Ingress configuration
build(k8s): add cert-manager issuer
```

#### Phase 5: CI/CD

```
ci: add GitHub Actions workflow for deployment
ci: add build validation workflow
fix(ci): correct deployment names in workflow
docs(ci): document deployment process
```

#### Phase 6: Documentation & Refinement

```
docs: create comprehensive authentication guide
docs: update README with deployment info
docs: add git commit best practices guide
feat(frontend): add Profile and Settings pages
style(frontend): enhance UI with animations
fix(frontend): hide test features in production
```

## 🛠️ Tools

### Commitizen (Recommended)

Cài đặt Commitizen để có interactive commit message:

```bash
npm install -g commitizen cz-conventional-changelog

# Initialize in project
commitizen init cz-conventional-changelog --save-dev --save-exact

# Use
git cz
# hoặc
npm run commit
```

### Commitlint (Recommended)

Validate commit messages automatically:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Create config
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Add to package.json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

## 📈 Benefits of Good Commits

1. **Clear History**: Dễ dàng xem lại lịch sử thay đổi
2. **Easy Debugging**: Nhanh chóng tìm commit gây ra bug
3. **Better Collaboration**: Team members hiểu rõ thay đổi
4. **Automated Changelog**: Tự động generate changelog từ commits
5. **Semantic Versioning**: Dễ dàng determine version bumps
6. **Code Review**: Reviewer dễ hiểu context của changes

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [Commitlint](https://commitlint.js.org/)

---

**Last Updated**: October 7, 2025  
**Author**: Lê Minh Tú
