# Prompt 07: Contact Page

## Context

Read `CLAUDE.md` → `docs/DESIGN-SYSTEM.md`.

## Design

The simplest page. Don't overthink it.

### Layout

Left side (2/3): Contact form
Right side (1/3): Direct links + location

```
Get in Touch                              Blake Thomson
                                          Santa Monica, CA
Name        [                        ]
                                          blakethomson8@gmail.com
Email       [                        ]    github.com/blakethom8
                                          LinkedIn
Subject     [General             ▾   ]
                                          ─────
Message     [                        ]    "Prefer email for business
            [                        ]     inquiries. GitHub for
            [                        ]     technical questions."
            [                        ]

            [Send Message]
```

- Subject dropdown: General, Business Inquiry, Collaboration, Speaking, Other
- Form submission: client-side to a serverless function or email API (Formspree, Resend, etc.)
- Success state: form fades out, replaced with "Thanks — I'll get back to you soon."
- Rate limiting via honeypot field (hidden input, bots fill it)

### WebMCP: Declarative Form

Add `data-tool-name="send_message"` attributes to form fields so AI agents can fill it via WebMCP:

```html
<form data-tool-name="send_message" data-tool-description="Send a message to Blake Thomson">
  <input name="name" data-tool-param="name" data-tool-param-description="Your name" />
  <input name="email" data-tool-param="email" data-tool-param-description="Your email address" />
  <!-- etc -->
</form>
```

## Implementation

- `src/app/contact/page.tsx`
- `src/components/contact/ContactForm.tsx`
- `src/components/contact/ContactInfo.tsx`
