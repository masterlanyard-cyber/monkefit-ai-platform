# Repository Standard

## Naming Rules
- Use lowercase folder names.
- Use kebab-case for file names.
- Use one product per folder.
- Use one topic per knowledge file.

## Content Rules
- Prompt files must not contain product facts.
- Product facts belong in `knowledge/`.
- SOP files describe actions and escalation.
- Playbook files describe decision flow and guidance.

## Source of Truth
- `knowledge/` is the source of truth for facts.
- `prompts/` is the source of truth for behavior.
- `playbooks/` is the source of truth for procedure.

## File Types
- Markdown for human-readable docs
- JSON for structured product data
- Media files for supporting assets

## Versioning
- All changes must be committed to Git.
- Major updates should be tracked with release tags.
