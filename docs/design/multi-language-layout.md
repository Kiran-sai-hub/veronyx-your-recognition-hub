# Multi-language layout specs

Checklist §8.3–§8.4. Live reference: **Design system → Specs → Multi-language layout**.

## Languages

| Code                   | Language                                     | UI translation in this build                             | Font                      |
| ---------------------- | -------------------------------------------- | -------------------------------------------------------- | ------------------------- |
| en                     | English                                      | Full                                                     | DM Sans                   |
| hi                     | हिन्दी                                       | Employee app, navigation, Copilot greeting, WhatsApp bot | Noto Sans Devanagari      |
| ta                     | தமிழ்                                        | Employee app, navigation, Copilot greeting, WhatsApp bot | Noto Sans Tamil           |
| te, kn, mr, bn, gu, ml | తెలుగు, ಕನ್ನಡ, मराठी, বাংলা, ગુજરાતી, മലയാളം | Selectable; screens fall back to English with a notice   | Noto Sans for each script |

Agreed scope for the prototype: Hindi and Tamil fully demoed; other languages follow the
checklist's fallback rule (“Multi-language template missing → fall back to English, warn admin”).
The language choice is per user and remembered.

## Layout rules

- Allow 30–40 % longer strings: labels wrap; buttons keep the verb visible; no fixed-width text.
- Line height ≥ 1.5 for Indic scripts so matras and conjuncts are not clipped.
- Language names are always written in their own script in dropdowns.
- LTR only (no RTL needed).
- `<html lang>` follows the chosen language so screen readers pronounce correctly.

## Formats

| Thing       | Format                      | Helper                                                   |
| ----------- | --------------------------- | -------------------------------------------------------- |
| Numbers     | Indian grouping 1,00,000    | `formatIndianNumber`                                     |
| Money       | ₹ with a space: ₹ 1,00,000  | `formatRupees`                                           |
| Dates       | DD/MM/YYYY                  | `formatDmy`, `DatePicker`                                |
| Time        | 24-hour, IST (Asia/Kolkata) | `Intl.DateTimeFormat(..., { timeZone: "Asia/Kolkata" })` |
| Fiscal year | April–March (FY 2026-27)    | `fiscalYearFor`                                          |

## Templates per language

- WhatsApp: one Meta template per language (Settings → WhatsApp templates shows each language and
  approval status).
- Notification templates (WhatsApp, email, in-app) are edited per locale; missing locales are
  flagged and fall back to English (Settings → Notification Templates).
- Privacy notice: English, Tamil and Hindi; Telugu shows the fallback warning
  (Compliance → Privacy notice).
- AI Copilot understands Hindi and Tamil questions and greets in the user's language; answers are
  in English with a note in this build.
