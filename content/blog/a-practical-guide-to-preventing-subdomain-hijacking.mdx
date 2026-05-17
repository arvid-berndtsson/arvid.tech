---
title: "A Practical Guide to Preventing Subdomain Hijacking"
date: 2025-07-15
tags: ["cli", "cybersecurity", "infosec", "open-source"]
summary: "Forgetting to delete an old DNS record can leave you vulnerable to subdomain hijacking. Attackers can claim your unused addresses to host malicious content under your brand's name. Learn how to find and fix these dangling pointers with o..."
---

**A quick heads-up:** The tools mentioned here are powerful. Please use them responsibly and only on domains you own or have explicit permission to scan. The goal is to be a good internet citizen.

## What is Subdomain Hijacking?

Imagine you launch a cool marketing campaign on a special subdomain, like campaign.yourcompany.com. You point it to an external service (like Heroku, GitHub Pages, or Netlify) where you've built a landing page. The campaign is a success! A few months later, it's over. To save money, you cancel the subscription for the external service. Smart.

But you forgot one small thing: you never deleted the DNS record for campaign.yourcompany.com.

This now-unused DNS record is called a "dangling pointer." Subdomain hijacking is what happens when someone else notices this, signs up for the same external service, and claims your unused subdomain.

Suddenly, they control a web address that your customers trust. They can use it to:

- Set up a phishing page to steal credentials.
- Distribute malware.
- Post embarrassing content that damages your brand's reputation.

The worst part is that it often isn't a sophisticated hack. It's an oversight—a cleanup task that was simply forgotten. This guide will show you how to proactively find and fix these issues using a few fantastic command-line tools.

## Your Toolkit: Friends in the Terminal

We'll focus on a few of the most popular open-source tools for this job. They are all written in Go, making them fast and easy to install.

### 1. Subfinder – The Fast Specialist

Subfinder is a lightning-fast tool that uses passive sources (search engines, public databases, etc.) to discover subdomains. It's great for getting a comprehensive list without sending a single packet to your own servers.

**Installation:**

```
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

**Usage:**

```
subfinder -d yourcompany.com -o subdomains.txt
```

• `-d yourcompany.com`: The domain you want to investigate.

• `-o subdomains.txt`: Saves the output to a file.

### 2. HTTPX – Finding What's Live

Having a list of subdomains is just the first step. Now you need to know which ones are actually active and what's running on them. That's where HTTPX comes in. It's a fast multi-purpose HTTP toolkit that can quickly probe a list of domains.

**Installation:**

```
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

```

## A Practical Workflow for Finding Vulnerabilities

Let's combine these tools into a simple, effective workflow.

### Step 1: Gather Your Subdomains

First, use Subfinder to get a list of all known subdomains for your domain. The -silent flag gives us a clean list, perfect for piping to other tools.

```
subfinder -d yourcompany.com -silent &gt; subdomains.txt
```

### Step 2: Find Out What's Live

Next, feed this list into HTTPX to see which of the subdomains actually have a web server responding. We'll also ask it to grab the page title and status code, which is incredibly useful for analysis.

```
cat subdomains.txt | httpx -title -status-code -o live_subdomains.txt
```

### Step 3: Analyze and Identify Risks

This is where your detective work begins. Open the live_subdomains.txt file. You're looking for subdomains that point to a third-party service but display an error message indicating the page or account is no longer there.

Look for titles or page content containing messages like:

- "There isn't a GitHub Pages site here."
- "Sorry, this page is no longer available." (Heroku)
- "Fastly error: unknown domain"
- "This domain is for sale"
- "404 Not Found" or "Repository not found" from services like Netlify, Vercel, or AWS S3.

If you find a subdomain you own that displays one of these messages, you've found a dangling DNS record. This is a potential subdomain hijacking vulnerability.

### Step 4: Fix It!

The fix is simple. Log in to your DNS provider and **delete the CNAME or A record** associated with that vulnerable subdomain. Done. You've closed the security hole.

#### Making It a Habit: Automation

Doing this once is good. Doing it automatically is great. You can easily automate this workflow to continuously monitor your domains.

- **GitHub Actions:** If you use GitHub, you can create a workflow that runs this process on a schedule (e.g., weekly). It can save the results as an artifact or even be configured to automatically create an Issue if a potentially vulnerable subdomain is discovered.
- **Cron Job:** If you have a VPS or an on-premise server, you can write a simple shell script to perform these steps and schedule it to run regularly using cron.

When automating, stick to passive tools like Subfinder and use -silent flags to ensure your scripts work smoothly. This respects the services you're querying and keeps your monitoring clean and efficient.
