# Verify a command-based lesson before publishing

When a course page walks students through shell commands, run the exact sequence yourself first.

- Use a scratch directory and a local bare repo (`git init --bare`) as the "remote", so Git flows
  (branch, push, conflict, merge) run without GitHub.
- Set a throwaway `GIT_CONFIG_GLOBAL` so your real Git config isn't touched.
- Compare the real output with the page's "You should see" blocks and fix the page, not the output.
- Mark anything you couldn't run (other operating systems, authenticated `gh` commands) as untested.
