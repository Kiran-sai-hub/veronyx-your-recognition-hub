# Icon set and illustration set

Checklist §10.6, §10.7 and Appendix B (“Icon set”, “Illustration set”). Live reference:
**Design system → Foundations** (`/design-system`).

## Icons

- Library: [Lucide](https://lucide.dev) outline icons (`lucide-react`), one style everywhere.
- Sizes: 20 px small (`size-5`, navigation and buttons), 24 px default (`size-6`), 32 px large
  (`size-8`, empty states, hero tiles).
- State: outline when inactive, **filled when active** — active navigation items render the icon
  with `fill="currentColor"` at 18 % opacity (`activeFill()` in `app-shell.tsx`).
- Icon-only buttons always have an `aria-label`; decorative icons are `aria-hidden`.
- Status icons are paired with words (never icon or colour alone).

### Domain icons (`src/components/domain-icons.tsx`)

| Concept     | Emoji in copy | Icon                                                          |
| ----------- | ------------- | ------------------------------------------------------------- |
| Workflow    | ⚡            | `Zap`                                                         |
| Approval    | ✅            | `CheckSquare`                                                 |
| Reward      | 🎁            | `Gift`                                                        |
| Performance | 📊            | `BarChart3`                                                   |
| Connector   | 🔌            | `Plug`                                                        |
| AI          | 🤖            | `Bot`                                                         |
| Fairness    | ⚖️            | `Scale`                                                       |
| Budget      | 💰            | `IndianRupee`                                                 |
| WhatsApp    | —             | `WhatsAppIcon` (brand glyph, `#25D366` where colour is shown) |

## Illustrations (`src/components/illustrations.tsx`)

One flat, token-coloured style (works in light, dark and high contrast). 240 × 160 SVG, inline, no
network requests. Hidden automatically in **low-data mode** (`data-decorative`).

| Kind      | Scene                                             | Used for                              |
| --------- | ------------------------------------------------- | ------------------------------------- |
| `start`   | Factory, retail and office colleagues together    | Getting started, generic empty states |
| `factory` | Two line workers with safety helmets at a machine | Boards, capture, manufacturing        |
| `retail`  | Shop counter with staff                           | Reward catalogue empty state          |
| `office`  | Desk worker and a colleague wearing a scarf       | Office/IT contexts                    |
| `field`   | Field salesperson with bike and phone             | Field / sales contexts                |
| `done`    | Two people celebrating, success tick              | “All caught up” states                |
| `data`    | Person beside a chart                             | Analytics, “not enough data yet”      |
| `inbox`   | Two people beside an empty tray                   | Empty lists, notifications            |

Inclusion rules applied: five skin tones across the set; mixed hair styles and a scarf;
men and women in the same roles (no gendered jobs); no religious, caste or regional
markers in clothing; neutral professional tone. Empty states use `EmptyState`
(`src/components/empty-state.tsx`) with the exact copy from checklist §6.1.
