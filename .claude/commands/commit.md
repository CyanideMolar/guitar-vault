Commit all local changes in ~/guitarvault to GitHub.

1. Run `git -C ~/guitarvault status` and `git -C ~/guitarvault diff` in parallel to see what has changed.
2. Run `git -C ~/guitarvault log --oneline -5` to check the recent commit style.
3. Stage only relevant source files (never `.env*`, `*.db`, `*.pem`, or `node_modules`).
4. Write a concise commit message that describes what changed and why, following the existing commit style. End the message with:
   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
5. Commit and then push to origin main.
6. Report the commit hash and message when done.
