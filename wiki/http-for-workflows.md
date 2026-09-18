---
boards: [scalar/workflow-automation, scalar/n8n-automation]
updated: 2026-09-18
---

# HTTP, for workflow builders

A visual canvas hides HTTP until the day it does not, and the reason a course on drag-and-drop
automation spends twenty minutes here is worth stating first: **a node hides the work rather than
removing it.**

The separation to hold onto came out sharpest when a student pushed on it. **An API is the fact
that you can send data and get data back. HTTP is the contract for the format** — who guarantees
both ends agree on the shape. Or, more compactly: *API is the communication method; HTTP is the
language.* The word "API" gets used loosely for both halves, and keeping them apart is what makes
the rest of the vocabulary land.

## The five methods

**GET** asks for information. **POST** sends information — **and saves it on the application
side**, which is the distinction most often fudged and the reason POST is the wrong verb for a read
even when a read carries a body. **DELETE** removes. **PUT** and **PATCH** update.

One continuous example carries all four, and it works because the methods are told apart by what
happened in the world rather than by definitions. You are a street sensor. It starts raining, so you
POST that it is raining and the application stores it. It turns out somebody threw water on you, so
you DELETE the report. Then it really is weather, and it is snow rather than rain, so you PUT the
record to its corrected value.

The discipline point: PATCH and PUT are rarely reached for, and plenty of people do everything with
GET and POST. That is not recommended — use DELETE where a delete is meant and PUT where an update
is meant, because the method is part of what the request says.

**One thing was left explicitly unresolved.** Asked about newer methods and a proposed QUERY verb,
the instructor said he did not remember and would check, and never came back to it. Nothing is
settled there. What does survive is practical: **do not send a body with a GET** — most
applications still will not accept one.

## The vocabulary, and where it already appeared

**Payload** is the content being sent — message text, sender, timestamp. **Response** is what comes
back: confirmation, data, or an error, and it is what tells a node whether its action worked.
**Query parameters** are the key-value pairs after a `?` in a URL, which a testing tool will split
out for you automatically. **OPTIONS** is the method a browser sends to probe an endpoint before
committing to anything — dipping a foot in to see how cold the water is.

None of this is new machinery by the time it is named. Every term has already been seen running: a
node checking a sheet is a GET, logging a lead is a POST, the classifier reads a payload, and the
branch that fires depends on a response.

## Why the raw shape matters

A live walkthrough against a public recipe API returns ingredients, measures and instructions as raw
JSON, which is unreadable at a glance — the fix demonstrated was pasting it into a chat model and
asking for a legible card. The line that matters: raw JSON is difficult for a person to read, and
straightforward for an application to assemble.

Which is exactly what a canvas node is doing for you. A phone automation built without one spent
**four of its ten steps** walking down a nested response to reach a single string. Those four steps
do not disappear behind an LLM node that hands you clean text; somebody wrote them once, and knowing
they are there is what lets you debug the day the node hands you nothing.

## Making the call, in practice

The theory above has a working method attached, and the order of its steps is the point: **prove the
request outside the workflow before it becomes a node.**

Find the API and read its docs — a well-documented one hands you a ready-made curl request. Paste
that curl straight into the URL box of a request client, which parses it into an endpoint plus
separated query parameters rather than leaving you to read a string. Edit in your real values and
run it. You now have a request you know returns what you want, and when the workflow later returns
nothing you are not debugging two things at once.

Only then translate it into the node, where one detail catches almost everyone: **the URL field
takes only the part before the `?`**. The query parameters go in as separate key-value entries via
the node's own switch for them. Pasting the whole query string into a field labelled URL may even
work, but the field is asking for the endpoint, and parameters entered as data are individually
editable, individually expressible, and visible — which is what you need the moment one of them has
to come from an upstream node.

The last step is knowing what to ask for. APIs commonly return a skeleton unless you name the fields
you want: a weather endpoint called without its `current` parameter answers with latitude, longitude
and elevation, and no temperature at all. Nothing errors. You asked a question that did not include
the thing you wanted, and got a complete, correct, useless answer.

## Related

- [Polling vs webhooks](polling-vs-webhooks.md) — the trigger side of the same protocol, and what a webhook actually sends
- [The workflow grammar](workflow-grammar.md) — where a node hides this work, and the JSON walk it hides
- [Choosing between workflow tools](choosing-a-workflow-tool.md) — generic HTTP nodes as the escape hatch when no connector exists
