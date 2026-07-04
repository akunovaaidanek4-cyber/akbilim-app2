# Telegram Bot Edge Function

## Deploy

```bash
supabase functions deploy telegram-bot
```

## Set secrets

```bash
supabase secrets set TG_TOKEN=8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w
```

## Register webhook

After deploy, run once to register the webhook URL with Telegram:

```
https://api.telegram.org/bot8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w/setWebhook?url=https://odicvebknzkbxgclwlfx.supabase.co/functions/v1/telegram-bot
```

## How it works

1. Admin adds a new lead in the app
2. App sends a Telegram message to coordinator chat with inline buttons (one per teacher in that district)
3. Coordinator taps a teacher button → Telegram calls this webhook
4. Webhook patches `ak_leads` table: sets `status=trial`, `teacherId`, `teacherName`
5. Message is updated to confirm assignment

## Commands

- `/report` — request evening summary report
