# Reusable Repos & Claude Skills

A collection of reusable projects, templates and Claude Code skills gathered from my work folder.

## Repos

| Label | Folder | What it is | Stack |
|---|---|---|---|
| Website / prototypes | [`repos/cutsway`](repos/cutsway) | Cutsway video-editing agency site: prototypes, launch pages, promo reels, tools | HTML/JS, HyperFrames |
| Website | [`repos/elite-redesign`](repos/elite-redesign) | Elite VFX cinematic static website (`dist/`) with build scripts | Static site, Node |
| Video template | [`repos/elite-vfx-promo`](repos/elite-vfx-promo) | Editable Remotion promo: 30s + 15s cuts, landscape & vertical | Remotion, React |
| Tool (third-party, MIT) | [`repos/davinci-resolve-mcp`](repos/davinci-resolve-mcp) | MCP server for DaVinci Resolve (works on the Free version). By [hiteshK03](https://github.com/hiteshK03/davinci-resolve-mcp), MIT license kept | Python, MCP |

## Templates

| Label | Folder | What it is |
|---|---|---|
| Video starter | [`templates/hyperframes-starter`](templates/hyperframes-starter) | Minimal HyperFrames composition project (HTML → MP4) with CLAUDE.md / AGENTS.md agent instructions |

## Claude Skills

Drop a skill folder into `.claude/skills/` in any project (or `~/.claude/skills/` globally).

### Included (MIT, from [supabase/agent-skills](https://github.com/supabase/agent-skills), see [`skills/LICENSE-supabase-agent-skills`](skills/LICENSE-supabase-agent-skills))

| Skill | Use for |
|---|---|
| [`supabase`](skills/supabase) | Any Supabase task: Database, Auth, Edge Functions, Realtime, Storage, SSR clients |
| [`supabase-postgres-best-practices`](skills/supabase-postgres-best-practices) | Postgres schema, indexes, RLS, query performance |

### Used, install from source (not redistributed here)

| Skill(s) | Install |
|---|---|
| Remotion skills: `remotion-best-practices`, `-captions`, `-create`, `-docs`, `-interactivity`, `-maps`, `-markup`, `-multimedia`, `-render`, `-saas`, `-studio`, `-upgrade` | `npx skills add remotion-dev/skills` ([source](https://github.com/remotion-dev/skills)) |
| HyperFrames block `wireframe-portal-title` | `npx hyperframes add wireframe-portal-title` |
| Supabase skills (latest version) | `npx skills add supabase/agent-skills` |

## Notes
- `node_modules`, `.env` files, build renders and raw source archives are excluded. Run `npm install` inside a project before use.
- `repos/elite-vfx-promo` expects Remotion skills via `skills-lock.json`; install them with the command above.
