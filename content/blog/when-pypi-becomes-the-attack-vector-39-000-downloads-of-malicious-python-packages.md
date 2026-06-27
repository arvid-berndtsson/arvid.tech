---
title: "When PyPI Becomes the Attack Vector: 39,000+ Downloads of Malicious Python Packages"
date: 2025-04-05
tags: ["python", "cybersecurity"]
summary: "Three Python packages made it onto PyPI, stole data, validated stolen credit cards, and were downloaded over 39,000 times. Here’s how they worked and what we can learn from it."
---

Most of us trust `pip install` a bit more than we probably should.

This week, researchers from ReversingLabs and Socket uncovered **three malicious packages on PyPI** that had been downloaded over **39,000 times**. Their goals? Steal sensitive data and validate stolen credit cards wrapped in innocent-looking Python packages.

## Fake Fixes, Real Malware

Two of the packages, `bitcoinlibdbfix` and `bitcoinlib-dev`, pretended to be patches for the popular `bitcoinlib` module. The third, `disgrasya`, didn’t even pretend to be nice.

### Downloads:

- `bitcoinlibdbfix`: 1,101
- `bitcoinlib-dev`: 735
- `disgrasya`: **37,217**

> _Pro tip: if a package is literally called “disgrasya” (Filipino slang for “disaster”)... maybe don’t install it blindly._

## So, what did these packages actually do?

### The “fix” packages:

- Overwrote the `clw cli` command.
- Embedded malicious code that exfiltrated local database files.

### `disgrasya`, on the other hand:

- Contained a **fully automated carding script**.
- Targeted WooCommerce stores using CyberSource as the payment gateway.
- Emulated a full buyer journey:
  - Found a product
- Added it to the cart
- Reached checkout
- Filled in stolen credit card data
- Sent everything to an attacker-controlled server (`railgunmisaka[.]com`)

This is done to validate stolen cards without tripping fraud detection systems.

## The social engineering twist

The authors of the fake `bitcoinlib` packages even joined a GitHub issue thread, trying to convince other users to install their “fix.” It didn't work, but it's worth noting that **supply chain attacks aren’t just about code but also about people.**

## Why this matters

- **Modular tools:** Packages like `disgrasya` are plug-and-play for larger automation frameworks.
- **Official channels:** These weren’t shady downloads from weird forums. They were live on PyPI.

## What can you do?

The boring advice still holds:

- Review dependencies (especially obscure ones).
- Lock down versions and hashes.
- Use tools like `pip-audit`, `bandit`, or `safety`.

Also, don’t install something just because the name sounds like it _might_ fix a bug you’re experiencing, especially when it wasn’t mentioned in the official repo.

🔗

Credit to [ReverseLabs](https://www.reversinglabs.com/blog/malicious-python-packages-target-popular-bitcoin-library) for finding this and, as always, for the amazing article from [The Hacker News](https://thehackernews.com/2025/04/malicious-python-packages-on-pypi.html).
