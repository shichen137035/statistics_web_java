# Manuscript for Cooperate Coding by Multi branches

## Reason for Multi-branches Coding

Normally, we could do cooperate coding just by the function of push and pull in Github. We push our work after finished, and pull before we update. But sometimes contradiction could exist, especially when we are revising the same file very frequently. It's like two painters are drawing on the same canvas and they keep drawing on the other's painted place over and over.

Multi-branch coding can reduce such problem, it allows the contributor to first in their own branch and then merge them together. Fundamentally, it let us to deal with the confliction in once. To use a metaphorical painting approach, it is like two painters painting on their own canvases, then agreeing on how to deal with the conflicting parts and painting the combined results on the main canvas.

## Mechanism of Git

In order to use git better, we need to have a certain understanding of its principles. It explains how Git fundamentally works — **without deep computer jargon**, but with enough precision for anyone using GitHub for collaborative programming. 
We’ll cover five essentials: working areas, branches, commits, switching branches, and remote actions (fetch, push, merge).

### 1. The Core Idea: Three Areas and One Pointer

Git organizes your work into three layers:

| Area                     | Description                                      | Example                                                      |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------ |
| **Working Directory**    | Your real files on disk — where you edit code.   | Editing `main.py` or deleting a line.                        |
| **Staging Area (Index)** | A “waiting room” for changes you plan to commit. | After `git add main.py`, Git prepares that file for the next snapshot. |
| **Local Repository**     | The saved history of all commits (snapshots).    | After `git commit`, your changes are recorded permanently.   |

The **HEAD** pointer shows *where you currently are* — it points to the latest commit of your current branch.

💡 *Think of Git as a camera:*
- You **edit the scene** in the working directory.
- You **choose which parts to capture** using `git add`.
- You **take the snapshot** using `git commit`.

---

### 2. What a Branch Really Is

A **branch** in Git is not a copy of files — it’s simply a **pointer to a commit**.

When you create a new branch:
```bash
git branch feature-login
git switch feature-login
```

You’re saying:

> “Start a new line of development from this point.”

Every time you commit, this branch pointer moves forward.
 Multiple branches are just multiple “timelines” sharing a common past.

💡 *Imagine branches as parallel storylines in a novel — they diverge from the same chapter but can later merge back into the main plot.*

### 3. Editing and Committing: What Happens Internally

**Step1:** You change code in the **working directory**. Git quietly marks these files as “modified.”

**Step2:** You choose which modifications to include:

```
git add main.py
```

Now Git saves the *exact content* of `main.py` into the staging area — a precise snapshot, not just a “diff.”

**Step3:** You record the staged changes as a permanent snapshot:

```
git commit -m "Add user login function"
```

Each commit:

- References its parent commit.
- Stores the full snapshot of all tracked files (internally compressed).
- Moves your branch pointer (e.g., `main`) to this new snapshot.

💡 *In simple terms:*
 A **commit** is like a save point in a game — you can always come back, see what changed, and branch from there.

------

### 4. Switching Branches: What Actually Happens to Your Files

When you switch branches:

```
git switch main
```

Git performs a **checkout** operation:

1. It looks at the snapshot of the target branch.
2. It replaces your working directory files with the contents of that snapshot.
3. It updates the HEAD pointer to this branch.

If you have uncommitted changes that **conflict** with the files on the target branch, Git stops you — it won’t risk losing your edits.

💡 *It’s like changing rooms in a museum:*
 Each branch is a different exhibit of your project’s state.
 When you “switch branches,” Git rearranges the paintings (files) to match that exhibit’s version.

------

### 5. How Git Communicates: Fetch, Push, and Merge

When you collaborate using GitHub, your local repository has a **remote twin** — the shared version everyone uses.

#### 🛰️ `git fetch`

Downloads the latest commits from the remote repository,
 but **does not** change your local files or branches.

```
git fetch origin
```

You simply get updated “news” from the remote world.
 You’ll now have a reference like `origin/main` showing the remote’s latest state.

💡 *Think of it as checking your mailbox — you receive updates but don’t yet act on them.*

------

#### 📤 `git push`

Sends your new commits to the remote repository:

```
git push origin main
```

Git checks whether the remote has new commits you don’t have.
 If yes, push is rejected — you must pull first, to avoid overwriting others’ work.

💡 *You can only add to the story if your version includes everyone else’s latest chapters.*

------

#### 🔀 `git merge`

Combines two development lines into one:

```
git merge feature-login
```

Git looks for the **common ancestor** commit and merges changes from both branches.

- If the changes don’t overlap → merge happens automatically.
- If both sides changed the same lines → Git pauses and asks you to resolve conflicts manually.

💡 *A merge is like combining two edited manuscripts — if both authors rewrote the same paragraph, someone must decide the final wording.*

------

## Common situations and solutions in actual use

Git works best when everyone follows the right **push–pull order**.
 Most issues come from skipping a step or modifying the same lines as someone else.
 Here are the key cases — short, clear, and practical.

### 🚦 Push / Pull Order (Most Important)

1. **Before editing:**

   ```
   git pull --rebase origin main
   ```

   → Make sure you start from the latest version.

2. **After editing and committing:**

   ```
   git push origin main
   ```

   → Upload your work once your local version includes everyone else’s updates.

💡 *Rule:* **Always pull (or fetch + rebase) before push.**
 If you skip this, your push will be rejected.

------

### ⚔️ Merge Conflicts (Most Common)

#### When It Happens

Two people edit the same line or section of a file.

Git will show:

```
CONFLICT (content): Merge conflict in file.txt
```

#### How to Fix

1. Open the file → you’ll see:

   ```
   <<<<<<< HEAD
   your version
   =======
   teammate’s version
   >>>>>>> origin/main
   ```

2. Keep what you want or merge both.

3. Mark as resolved:

   ```
   git add file.txt
   git rebase --continue
   ```

   (or `git commit` if merging)

💡 *Tip:* Conflicts are normal. Pull more often to reduce them.

------

### 📦 Push Rejected

#### Message

```
! [rejected] main -> main (fetch first)
```

#### Reason

The remote branch has new commits you don’t have yet.

#### Fix

```
git pull --rebase origin main
git push origin main
```

------

### 🧱 Uncommitted Changes Prevent Pull

#### Message

```
error: Your local changes would be overwritten by merge.
```

#### Fix Options

- **Commit first**

  ```
  git add .
  git commit -m "WIP"
  git pull --rebase
  ```

- **Or stash temporarily**

  ```
  git stash
  git pull
  git stash pop
  ```

------

### 🪶 Delete or Rename Conflict

#### Message

```
CONFLICT (modify/delete): file.txt deleted in HEAD and modified in origin/main
```

#### Fix

- Keep deletion:

  ```
  git rm file.txt
  git commit
  ```

- Keep remote version:

  ```
  git checkout --theirs file.txt
  git add file.txt
  git commit
  ```

------

### Two-Branch Collaboration Workflow (Two Developers: A & B)

This is the standard workflow for two collaborators working on the same project.
 It keeps the main branch clean and avoids conflicts between teammates.

------

#### 📁 Project Structure

```
main/        ← Main branch (official version)
branch-A/    ← Developer A’s personal branch
branch-B/    ← Developer B’s personal branch
```

------

#### 🔄 1. Initial Setup

- The `main` branch contains the latest, verified version of the project.
- Both A and B create their own branches **from main**:

```
git checkout main
git pull origin main
git checkout -b branch-A
git push origin branch-A
```

B does the same for `branch-B`.

At this point:

> `main`, `branch-A`, and `branch-B` are identical.

------

#### 🧩 2. Independent Work Phase

- A and B **work only on their own branches**.
- **Do not push to `main` or to each other’s branches.**

Typical commands for each developer:

```
# Work normally
git add .
git commit -m "Update feature X"

# Push to your own branch
git push origin branch-A   # for A
git push origin branch-B   # for B
```

Both developers can work in parallel without interference.

------

#### 🕓 3. Merge Timing Agreement

After a planned period (e.g., daily, weekly, or after a major feature is done):

- Both A and B **stop coding temporarily**.
- Time to merge everyone’s progress into `main`.

------

#### ⚙️ 4. Merge Step 1 — Merge A’s Branch into Main

A (or the maintainer) performs:

```
git checkout main
git pull origin main          # ensure up-to-date
git merge origin/branch-A
```

Since `branch-A` originated from `main`,
 this merge usually happens cleanly with **no conflict**.

Then push the updated main:

```
git push origin main
```

------

#### ⚔️ 5. Merge Step 2 — Merge B’s Branch into Main

Next:

```
git merge origin/branch-B
```

If there are **no overlapping edits**, it merges automatically.

If **conflicts appear**, Git will show messages like:

```
CONFLICT (content): Merge conflict in file.txt
```

------

#### 🧠 6. Resolve Conflicts (If Any)

1. Open each conflicting file — Git marks the areas with:

   ```
   <<<<<<< HEAD
   (main version)
   =======
   (branch-B version)
   >>>>>>> origin/branch-B
   ```

2. Manually decide what to keep or combine.

3. Mark resolved:

   ```
   git add file.txt
   git commit
   ```

4. Push the fully merged main branch:

   ```
   git push origin main
   ```

Now `main` represents the newest unified version.

------

#### 🔁 7. Sync Personal Branches with Updated Main

After the merge, both A and B must **synchronize** their own branches with the new `main` to start the next cycle.

Each developer does:

```
# Switch to your branch
git checkout branch-A         # or branch-B

# Fetch latest main
git fetch origin

# Rebase your branch onto the latest main
git rebase origin/main
```

If conflicts appear during rebase, resolve them the same way, then continue:

```
git add file.txt
git rebase --continue
```

Finally push your branch again:

```
git push -f origin branch-A
```

(`-f` may be required because rebase rewrites commit history.)

💡 *After this step, `branch-A` and `branch-B` are perfectly aligned with the updated `main`.*

------

#### 🔄 8. Next Development Cycle

Once both branches are in sync with the new main:

- Resume independent work (step 2).
- Repeat the cycle for the next update.

#### Interface Schematic Tutorial

![image-20251010220443142](C:\Users\shich\AppData\Roaming\Typora\typora-user-images\image-20251010220443142.png)

This is the newly opened interface, when there are no modifications.

![image-20251011101356586](C:\Users\shich\AppData\Roaming\Typora\typora-user-images\image-20251011101356586.png)

This is when there are some modifications.

Please first commit your changes. Commit means record the changes on your local repository. Then, before we push, we should fetch origin first. If there is any changes, then

![image-20251011105036725](C:\Users\shich\AppData\Roaming\Typora\typora-user-images\image-20251011105036725.png)

After do the pull, we push our code

![图片4](C:\Users\shich\Downloads\图片4.png)

Sometimes, the commit may meet confliction with current branch because of the last pull.

![图片5](C:\Users\shich\Downloads\图片5.png)

After we resolve the confliction manually or automatically, we could do the merge.

![image-20251011132423516](C:\Users\shich\AppData\Roaming\Typora\typora-user-images\image-20251011132423516.png)
