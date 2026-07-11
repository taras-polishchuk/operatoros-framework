# OperatorOS Tester Packet

Use this packet when giving OperatorOS to a friend or early tester.

Goal: collect real product data from a first-use session without turning the tester into a contributor on day one.

## Rule Of Thumb

- First session = usage data, not code contribution.
- Ask for an issue, log, or screen recording before asking for a PR.
- A PR only makes sense after the problem is reproduced and scoped.

## 1. Message To Send The Tester

Copy-paste this as the first message:

```text
Hey - I need a clean first-use test of OperatorOS.

This is not a coding task. I do NOT need a pull request from you on the first pass.
I need honest first-use feedback: where you got confused, what failed, what felt clear, and whether the product made sense.

Please use this exact version:

OPERATOROS_VERSION=v0.5.2-alpha curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

Please record your terminal session and then run the exact commands I send below.

What I need back from you:
1. the terminal log
2. short written feedback using the template below
3. if something breaks, a GitHub issue instead of a PR

Important: please do not ask me for hints during the first pass unless you are completely blocked. The point is to see what the product explains well on its own.
```

### 1A. Short DM Version For A macOS Friend

Use this when you want a shorter message in Telegram, iMessage, or Slack:

```text
Hey - can you do one clean first-use test of OperatorOS on your Mac?

Please don't fix anything or open a PR yet - I just need honest usage data.
Run the exact commands I send, record the terminal session, and note where anything feels unclear or breaks.

Install with:
OPERATOROS_VERSION=v0.5.2-alpha curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

What I need back: terminal log + short feedback + GitHub issue only if something documented fails.
```

## 2. Exact Test Scenario

This scenario is short enough for a friend to run in 10-15 minutes.

### 2A. Recommended macOS-First Scenario

Use this when the tester is specifically on macOS and you want the cleanest possible runbook.

Assumptions:

- Terminal app: Terminal.app or iTerm2
- Shell: `zsh`
- Goal: complete one first-use session in 10-15 minutes without live help

Start transcript:

```bash
mkdir -p ~/operatoros-test-session
cd ~/operatoros-test-session
script -q operatoros-test.log
```

Run the test:

```bash
OPERATOROS_VERSION=v0.5.2-alpha curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

mkdir -p ~/operatoros-eval
cd ~/operatoros-eval

operatoros version
operatoros init
operatoros validate operatoros.yaml
operatoros apply
operatoros run journal add "first entry from macOS test"
operatoros run timer start "deep work" 25
operatoros export --bundle tar.gz
ls -lah
```

If the shell says `operatoros: command not found`, do this once for the current session and note it in the feedback:

```bash
export PATH="$HOME/.local/bin:$PATH"
operatoros version
```

End transcript:

```bash
exit
```

Ask the tester to send back:

- `~/operatoros-test-session/operatoros-test.log`
- short written feedback using the template below
- a GitHub issue only if a documented step failed or misled them

### Linux / macOS

Start transcript:

```bash
mkdir -p ~/operatoros-test-session
cd ~/operatoros-test-session
script -q operatoros-test.log
```

Run the test:

```bash
OPERATOROS_VERSION=v0.5.2-alpha curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

mkdir -p ~/operatoros-eval
cd ~/operatoros-eval

operatoros version
operatoros init
operatoros validate operatoros.yaml
operatoros apply
operatoros run journal add "first entry from user test"
operatoros run timer start "deep work" 25
operatoros export --bundle tar.gz
ls -la
```

End transcript:

```bash
exit
```

### Windows PowerShell

Start transcript:

```powershell
New-Item -ItemType Directory -Force "$HOME\operatoros-test-session" | Out-Null
Set-Location "$HOME\operatoros-test-session"
Start-Transcript -Path .\operatoros-test.txt
```

Run the test:

```powershell
$env:OPERATOROS_VERSION="v0.5.2-alpha"
iwr https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.ps1 -UseBasicParsing | iex

New-Item -ItemType Directory -Force "$HOME\operatoros-eval" | Out-Null
Set-Location "$HOME\operatoros-eval"

operatoros version
operatoros init
operatoros validate operatoros.yaml
operatoros apply
operatoros run journal add "first entry from user test"
operatoros run timer start "deep work" 25
operatoros export --bundle tar.gz
Get-ChildItem -Force
```

End transcript:

```powershell
Stop-Transcript
```

## 3. What Success Looks Like

The tester should be able to complete the scenario without live guidance and understand, in plain language, what OperatorOS is for.

Minimum success criteria:

- `operatoros` installs successfully.
- `operatoros init` creates the workspace.
- `operatoros apply` installs bundled example modules.
- `operatoros run` works for both `journal` and `timer`.
- `operatoros export --bundle tar.gz` creates a portable archive.
- The tester can explain the product in one or two sentences.

## 4. Feedback Template

Ask the tester to reply in this format:

```text
OperatorOS first-use feedback

Environment
- OS:
- Shell / terminal:
- Install method used:

Outcome
- Did you finish the whole flow? yes / no
- Total time to complete:
- First command that felt confusing:

Product understanding
- In one sentence, what do you think OperatorOS does?
- At what point did the product click for you, if at all?

Friction
- What was the first confusing moment?
- What did you expect to happen there?
- What actually happened?
- Paste the exact command if relevant:

Trust
- Would you trust this with a real personal workspace today? yes / no / maybe
- Why?

Recommendation
- Would you recommend that another technical friend try it today? yes / no / maybe
- Why?

Top 3 observations
1.
2.
3.
```

## 5. When To Open An Issue Instead Of Sending A Message

Open a GitHub issue if any of the following happens:

- a documented command fails
- output contradicts the README
- the tester gets blocked and cannot proceed
- the product wording is misleading enough to cause the wrong action
- a successful-looking command leaves the tester in a broken state

Do not ask for a PR on the first pass unless the tester independently wants to fix a clearly reproduced bug.

## 6. GitHub Issue Template For A Test Session

Use this when the tester finished the session and you want a durable product-feedback record in GitHub.

````md
## Summary

First-use test session of OperatorOS by an external tester.

## Tester profile

- OS:
- Shell / terminal:
- Technical level:
- Prior context about OperatorOS: none / minimal / moderate

## Test scenario

- Version tested:
- Install method:
- Scripted flow used: init -> validate -> apply -> run -> export

## Outcome

- Completed flow: yes / no / partially
- Time to first success:
- Time to complete:

## What worked

- 

## Friction points

1. 
2. 
3. 

## Exact failures or misleading moments

```text
paste command output or link log snippets here
```

## Product understanding

Tester's one-sentence explanation of OperatorOS:

## Recommendation signal

- Would the tester try it again? yes / no / maybe
- Would the tester recommend it? yes / no / maybe

## Artifacts

- Transcript attached: yes / no
- Screen recording attached: yes / no
- Follow-up bug issues created: #
````

## 7. Triage After The Session

After each test session, split findings into three buckets:

1. **Bug** - command or documented behavior is broken.
2. **Docs gap** - the product works, but the tester could not infer the right next step.
3. **Product gap** - the feature works, but the value proposition or mental model is still unclear.

Do not turn all feedback into code changes. Some feedback should become copy changes, issue labels, or no action.
