# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report vulnerabilities privately via GitHub's **"Report a vulnerability"**
button (Security tab → Report a vulnerability / private advisory), or by email to
the maintainers. Include:

- a description and impact,
- steps to reproduce or a proof of concept,
- affected version/commit.

We aim to acknowledge reports within a few business days and to provide a
remediation timeline after triage. Please give us reasonable time to fix an
issue before any public disclosure.

## Never commit secrets

- Real credentials must never be committed. Use `.env` (git-ignored) locally,
  based on `.env.example` (placeholders only).
- API keys are **server-side only**. Do not place secrets in frontend code,
  `public/`, Vite config, tests, or `VITE_*` variables — anything reachable by
  the browser bundle is public.
- If a secret is ever committed, treat it as compromised: **rotate it
  immediately**, then remove it from history (coordinated `git filter-repo` /
  BFG, force-push, and have all collaborators re-clone).

## Recommended GitHub repository settings

Maintainers should enable, for this repository:

- **Secret scanning** and **push protection** (Settings → Code security).
  Never bypass a real-secret push-protection warning.
- **Dependabot alerts** and security updates (config in
  `.github/dependabot.yml`).
- **Branch protection** on the default branch: require pull requests and require
  the `ci` and `secret-scan` status checks to pass before merge.
- **Required status checks** kept up to date.

## Supported versions

This is an educational project. Security fixes are applied to the latest
`main` only.

## Known residual risks

- **Authentication is simulated.** `Login.jsx` and `Signup.jsx` are demo UI
  only and must never be treated as authentication or authorization. Real
  authentication is a pending product decision — a managed OIDC / passkey
  provider is recommended. If local password auth is later chosen, use
  server-side sessions with HttpOnly + Secure + SameSite cookies, CSRF
  protection, verified email recovery, login throttling, and Argon2id password
  hashing. No secrets, tokens, or passwords should be stored in `localStorage`.
- **Collaboration rooms are not authenticated.** A room link is a bearer
  capability, not authorization. See `docs/collaboration-security.md`.
- **y-webrtc** uses a public signaling server by default; configure your own
  (`VITE_YWEBRTC_SIGNALING`) for any non-demo deployment.
