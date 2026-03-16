# Optimizing Recurrings

**Source:** https://help.copilot.money/en/articles/3783499-optimizing-recurrings

Recurring filter settings help with automatically detecting transactions as an existing recurring when the transaction shows up in Copilot. It's important that the recurring filter settings are set up correctly and also optimized to always look for the correct transaction.

---

# Optimizing Transaction Name

Some recurring transactions might have a slightly different name every month, so we want to make sure the recurring is looking for the part of the transaction name that's always present.

For example, this Uber One subscription might be charged with a different transaction name every month, such as "**Uber One**", "**Uber Pass**", or "**Uber**". So it's best that the recurring is looking for transactions with just "**Uber**" included in the transaction name, instead of looking specifically for "**Uber One**" or "**Uber Pass**" in the transaction name.
[![screenshot](../../screenshots/recurrings/01-image.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1234550208/27ae2f0e545af0ebe65dbb531a92/image.png?expires=1773322200&signature=382117ba03f548e8ebc55c066ebe8b8e85599c1124572bbb6fc1f99af2f3d45d&req=dSIkEsx7nYNfUfMW1HO4zbIY6fbyCSWOq63qvbjhk3cZUvsrY4B2WpuVQyqw%0A2nXybvZ09qOgdsc7oos%3D%0A)
# Optimizing Transaction Date

Recurring transaction can be charged on the same day every month, or on a near by day. Or, sometimes it depends on when you decide to make this payment every month. So when it comes to setting a date for a recurring, we recommend that you look at the historic transactions for this recurring and check for the date they're typically charged on.

In this example, this recurring is looking for a transaction around 8th of every month.
[![screenshot](../../screenshots/recurrings/02-Single_Day.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1291882886/c87a6014205b2c52def2afe3baaf/Single_Day.png?expires=1773322200&signature=0fc4885e57fa21f69bb26a22361e8da8d69b4ee661793c9afaad15d3239468e2&req=dSIuF8F2n4lXX%2FMW1HO4zU%2FTeGwqWS3h9ejKguLX8hiQ%2BDXqUuYUcNzNB9W1%0AeJnLhtWFO1J%2BJn0kF4s%3D%0A)
In this example, this recurring is looking for a transactions around the 24th of every month but with multiple near by dates selected.
[![screenshot](../../screenshots/recurrings/03-Date_Range.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1291885242/5b4d9127fca17db4033af8ba8584/Date_Range.png?expires=1773322200&signature=9be4980689323691b215c79ec17b33ee5b8eb0514538649bc773e9866b7aaee3&req=dSIuF8F2mINbW%2FMW1HO4zVJLDa3AO5HroWUeBTfQTMmTz9yU54Ecssr63HHJ%0A%2BfgU7OyB79Ky1B3vabk%3D%0A)
In this example, this recurring is looking for a transaction on any day of the month.
[![screenshot](../../screenshots/recurrings/04-image.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1291890226/93588a84ff26c1bc2ebc0b9ffca5/image.png?expires=1773322200&signature=fe7583380f8dac4092e521ced5ea1dfa086d03d342b6c93db646d374b5174505&req=dSIuF8F3nYNdX%2FMW1HO4zQfoWJKlGAH4g%2FVnKm59qdq4Q5zAPL4SAjVk8gaC%0A0675Q1A6ERVQvjbmJ40%3D%0A)
# Optimizing Transaction Amount

Just like transaction date, you can set a range for the transaction amount as well. This is helpful if you have multiple recurrings from the same merchant that are charged on the same date.

In this example below, both of these recurrings are charged on the same day every month with the same transaction name "Apple". But because these recurrings are looking for different transaction amount, it's able to capture the correct transactions into the corresponding recurrings every month.
[![screenshot](../../screenshots/recurrings/05-image.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1291907082/547ba75333e9807821eb7aaf6458/image.png?expires=1773322200&signature=af0e5d82d7a1527e91d0e8cb4fbfa4d58573556fcaf7aea797123ec5a7482475&req=dSIuF8B%2BmoFXW%2FMW1HO4zVrK%2FH8yBn1ITi72LU37dXnrhchIWRS%2FBM%2BjLxaI%0AKJJkgt2cgHbPx8J2gzI%3D%0A)[![screenshot](../../screenshots/recurrings/06-image.png)](https://downloads.intercomcdn.com/i/o/gw2wbwl7/1291906968/cdb18a9cb951a350aa7972a528c8/image.png?expires=1773322200&signature=bf9670f402d694cfbe6bf5e4e3d8003910a86171a01d5f1b8515d2557761e988&req=dSIuF8B%2Bm4hZUfMW1HO4ze%2FNMIqQsln5xCRuxryHOdXP9WEmX98lbqV1zzrZ%0ArwUkq%2BE8kgf1AiKjo1M%3D%0A)
👋 Still have questions? Contact us via the in-app chat.

---
Related Articles[Creating Recurrings](https://help.copilot.money/en/articles/3760068-creating-recurrings)[Editing Recurrings](https://help.copilot.money/en/articles/3783837-editing-recurrings)[Shared Recurring Expenses](https://help.copilot.money/en/articles/5324776-shared-recurring-expenses)[Multiple Recurrings for the Same Merchant](https://help.copilot.money/en/articles/5327632-multiple-recurrings-for-the-same-merchant)[Recurrings FAQ](https://help.copilot.money/en/articles/10244751-recurrings-faq)
