#!/usr/bin/env bash
# advisor list — show all 11 canonical questions.
cat <<'EOF'
# Canonical Questions (Q1–Q11)

Per CANONICAL-QUESTIONS-v0.8.0.md:

| Q#  | Question                                              | Implemented in advisor |
|-----|-------------------------------------------------------|------------------------|
| Q1  | What is in this workspace?                            | ✓ |
| Q2  | What is the always-read tier?                         | ✓ |
| Q3  | What is the architecture (canonical homes)?           | ✓ |
| Q4  | What changed since <ref>?                             | (use context-builder diff) |
| Q5  | What is the drift state?                              | ✓ |
| Q6  | Which principles apply here?                          | (see methodology/01) |
| Q7  | What's the structural health?                         | ✓ |
| Q8  | What missions have been run?                          | (use mission-runner list) |
| Q9  | Who is the engineer?                                  | (read IDENTITY.md) |
| Q10 | What is the engineer's current focus?                 | (read IDENTITY.md §4) |
| Q11 | How would an AI cold-read this workspace?             | (use inspect) |

Use `operatoros run advisor ask <Q#>` for implemented questions.
EOF