---
"tailorkit": patch
"@tailorkit/app": patch
"@tailorkit/client-platform": patch
"@tailorkit/core": patch
"@tailorkit/react": patch
"@tailorkit/sandbox": patch
---

Include development export targets in published packages so Vite consumers do not need custom resolution conditions. Expose app authoring from `tailorkit/app` and `tailorkit/app/config`.
