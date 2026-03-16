I need you to build a knowledge base from the Copilot Money help center.

The help center is at https://help.copilot.money/en/ and is built on Intercom.

Here are the collections and their URLs:
- Dashboard (4 articles): https://help.copilot.money/en/collections/3377751-dashboard
- Accounts (23 articles): https://help.copilot.money/en/collections/2343791-accounts
- Categories (13 articles): https://help.copilot.money/en/collections/2199956-categories
- Transactions (21 articles): https://help.copilot.money/en/collections/3194194-transactions
- Recurrings (8 articles): https://help.copilot.money/en/collections/2199953-recurrings
- Cash Flow (1 article): https://help.copilot.money/en/collections/10261166-cash-flow
- Investments (6 articles): https://help.copilot.money/en/collections/3136877-investments
- Goals (7 articles): https://help.copilot.money/en/collections/12508175-goals
- Widgets (2 articles): https://help.copilot.money/en/collections/2832266-widgets

For each collection:
1. Fetch the collection page to get all article URLs
2. Fetch each article and extract:
   - Title
   - Full text content
   - All image URLs (screenshots from downloads.intercomcdn.com)
3. Download all screenshots to a local docs/screenshots/ folder
4. Save each article as markdown in docs/help-center/{collection-name}/

Output a summary file at docs/help-center/INDEX.md listing all articles by collection
with their local screenshot paths.

Use Node.js with fetch. Handle rate limiting gracefully (add 500ms delay between requests).
