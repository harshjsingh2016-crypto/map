---
boards: [scalar/workflow-automation]
updated: 2026-09-14
---

# API key hygiene

A key is a bearer credential: it identifies the account, not the person holding it, and everything
done with it is billed and attributed to you. The instructor's framing is that **API keys are the
gold of the AI industry at this point**, and the analogy is lending a car key — your friend crashes
the car and you take the loss, not them.

Four practices follow, and they are boring in the way that useful security advice usually is.

**Never share a key.** Not by email, not left pasted on a desktop, not in a screenshot.

**Set an expiry.** A key created for a demo or a class should die on a schedule. The option for no
expiration exists and is, in his words, absolutely unsafe — an eternal credential is one you will
eventually lose track of rather than one you will remember to revoke.

**Rotate frequently.** The reason people skip it is honest and worth naming: rotation means
re-updating everywhere the key is used, and nobody wants that work later. That is a design problem
rather than a reason, and the practice stands.

**Name each key for its purpose.** Several keys, distinct names, distinct expiries. The payoff is
not tidiness — it is that when one leaks you know **which one to kill**, and killing it does not
take down everything else you run.

## What the model never sees

A misconception worth killing early: **the model never receives your API key.** The key sits with
the platform making the call, which uses it to authenticate the request to the provider. It is not
part of the payload the model reads. Prompt content and credentials travel in different places, and
conflating them leads to worrying about the wrong risk.

The real question is whether to trust the platform holding it. The expectation is that it encrypts
or hashes the key at rest, and beyond that, as he put it, that is the trust you have to make —
comparable to letting a browser autofill a bank login. Liability after a breach sits with the
vendor, and pursuing it is a legal war rather than a remedy.

**The demonstration that outranks the advice:** having shown a working key on screen to a class, he
revoked it live at the end of the session. A leaked key is not a thing to feel bad about, it is a
thing to kill immediately, and doing it in public is the lesson.

## Related

- [The workflow grammar](workflow-grammar.md) — where the credential attaches, at the top of the node that calls out
- [Data anonymization](data-anonymization.md) — the neighbouring rule about what should not reach a model in the first place
- [Vendor data diligence](vendor-data-diligence.md) — trusting a platform with something, verified rather than assumed
