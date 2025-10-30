# **App Name**: VeraLogix SecureConnect™

## Core Features:

- Agent Console: Web app for agents with secure data access and ABAC checks.
- Trustee/Owner Portal: Web app for trustees and owners with OIDC SSO integration.
- Vendor/Contractor Portal: Web portal for vendors/contractors, supporting RESTful mutations.
- Resident App (Mobile & PWA): Mobile app (React Native + Expo) and PWA for residents with real-time updates and offline support.
- Evidence Locker: Secure file storage with malware scanning, content hashing, and watermarking.
- Audit Logging: Mandatory audit trails on approvals, overrides, and financial actions.
- Telemetry Monitoring: Comprehensive telemetry for all primary actions.

## Style Guidelines:

- Background: Solid black (#373435) providing a dark, secure backdrop.
- Primary gradient: Shades of green (#A8CF45 → #BAD96B → #7D9C33 → #455C08) to provide visual accents, and highlight interactive elements without overwhelming the dark theme. Use a gradient that creates subtle depth.
- Neon accents: Electric green (#B6FF2E), chartreuse (#E4FF66), and lime (#D4FF00) to indicate interactive or real-time elements. Only sparingly apply these colors as a way to guide the user.
- Font: 'Inter' sans-serif for body text and headings to provide clarity and readability.
- Font Sizes: Body text at least 16px, Headings ranging from 24-40px for clear hierarchy, adhering to WCAG AA standards.
- Subtle glow and 'hover dust' effects at 60fps, enhancing interactivity without being distracting. Animations should respect the user's 'prefers-reduced-motion' setting.
- Lucide-react icons throughout the UI, ensuring consistency and a modern aesthetic.
- Responsive layout that adapts to both web and mobile platforms. Prioritize content hierarchy.