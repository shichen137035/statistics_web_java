# 🧭 Contribution Guideline (Internal Version)

> **Project Type:** Private Front-End Project  
> **Language / Runtime:** Java 1.8  
> **Repository Type:** Closed-source (team collaboration only)  
> **Main Branch Access:** Restricted to Owner

---

## 1. Purpose

This document defines the internal contribution workflow for the project.  
It aims to ensure **clean branching, safe merging, and controlled version management** among fixed team members.  
This is a **closed-source internal project** — contributions are limited to authorized developers only.

---

## 2. Branching Strategy

### 🔹 Main Branch (`main`)
- Maintained **only by the Owner**.  
- Contains stable, deployable code.  
- **Do not push directly** to `main`.  
- All merges must go through Pull Requests (PRs) or be executed by the Owner.

### 🔹 Personal Development Branches
- Each member works on an individual branch.
- When the task is complete, submit a **Pull Request** or **contact the Owner** for integration.

## 3. Collaboration Workflow

1. Pull the latest version of `main`:

   ```
   git checkout main
   git pull origin main
   ```

2. Create a personal branch:

   ```
   git checkout -b feature/username-new-module
   ```

3. Implement and test your changes locally (Java 1.8 environment).

4. Push your branch:

   ```
   git push origin feature/username-new-module
   ```

5. After completion:

   - **Option 1:** Open a Pull Request to merge into `main`;
   - **Option 2:** Contact the **Owner** to perform the merge directly.

## 4. Large-Scale Changes & Conflict Risk Management

If your work involves modifying **core functions** or **files that will cause massive diffs**,
 please **contact the Owner before committing**.

- Large-scale changes may trigger extensive merge conflicts.
- The Owner will perform the modification **directly on `main`** after version synchronization.
- All developers should rebase afterward to align with the new version.

## 5. Commit Convention

Each commit must include a **clear and concise description** of what has been changed and why.  
The goal is to make the commit history easy to read and trace.

- Write meaningful commit messages that summarize the modification.  
  Example:
  - fix(api): corrected JSON parsing error in response handler
  - feat(ui): added dropdown component for navigation bar

## 6. Code & Documentation Style

- All files must pass the project’s formatter/linter.

- Use **Java 1.8 syntax only** (avoid newer language features).

- Do **not** commit environment or build artifacts:

  ```
  .idea/
  target/
  *.class
  node_modules/
  ```

- Documentation must be written in **English**, with short bilingual notes if necessary.

------

## 7. Testing & Validation

- Ensure code compiles and runs properly before committing.
- Front-end modules should pass build and browser verification.
- The Owner will perform a full project build before merging.

------

## 8. Merge & Release Policy

- Once approved, requests will be merged into `main`.

- For combined feature releases, the Owner will **synchronize all active branches**.

- After each release:

  ```
  git checkout main
  git pull origin main
  git rebase main
  ```

------

## 9. Confidentiality & Access Restriction

> This is a **closed internal project**.
>  Do not share, publish, or upload code, screenshots, or documentation outside the team.
>  All project materials (code, design, build outputs) are **strictly internal**.
>  External disclosure or reuse requires **explicit Owner approval**.
