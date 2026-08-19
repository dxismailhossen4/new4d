# Deployment checklist

## Supabase configuration

Open the target project’s **SQL Editor** and execute [`supabase/migrations/0001_membership_platform.sql`](./supabase/migrations/0001_membership_platform.sql). The migration creates the required profile, membership, payment, prediction, contact, FAQ, result-showcase and administrator tables without inserting fabricated records. It also enables Row Level Security, creates a private `payment-screenshots` storage bucket, and adds the trigger that activates a membership only when an administrator approves a payment.

Create an owner account through `/register`, then run the two commented promotion statements at the bottom of the migration after replacing `OWNER_EMAIL@example.com`. This creates the admin designation and synchronizes the visible profile role. No ordinary account can approve a payment or access premium content through the client alone.

| Setting | Required value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://pfyviyhdyjztqvvvibby.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The provided Supabase publishable/anonymous key, entered only in the hosting environment configuration. Do not commit it. |
| `VITE_SITE_URL` | The final HTTPS domain, without a trailing slash. |

The application uses a publishable browser key by design; database permissions are enforced by the supplied RLS policies. **Never** add a Supabase `service_role` key to the frontend environment or any client source file.

## Authentication URLs

In Supabase Authentication URL Configuration, set the Site URL to the final HTTPS domain. Add the final domain plus the following paths to Redirect URLs: `/login`, `/forgot-password`, and any deployment preview URL used for testing. This supports account-confirmation and password-reset redirects without relying on a localhost address.

## Domain and publishing

Before public launch, set the final domain in the website hosting settings and set `VITE_SITE_URL` to that exact domain. Replace the `YOUR_DOMAIN` placeholders in `client/public/robots.txt` and `client/public/sitemap.xml` with the same domain. Confirm that the payment instructions, owner name, refund/cancellation wording, support email, business hours and social links are legally and operationally correct for the owner before enabling payments.

## Pre-launch verification

Use genuine owner-controlled test accounts and real administrative records only. Test registration, email confirmation behavior, login, logout, password reset, free content publication, premium access restrictions, screenshot upload, payment submission, manual approval, rejection, request-for-information handling, private screenshot visibility, contact messages, admin route access, mobile navigation, and the final responsive layouts. Do not create fake results, testimonials, winners, payment approvals, statistics, or prediction records for testing or marketing.
