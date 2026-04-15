# 📐 Wireframes - Czech Rocket Society Platform

## Overview

Low-fidelity wireframes defining the structure and layout of all major pages. These wireframes focus on content hierarchy, user flow, and responsive behavior.

---

## 1. Homepage

### Desktop Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ [Logo]          [Projects] [Team] [News] [Contact]    [Sign In]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    HERO SECTION (Full viewport)                │
│                                                                 │
│                    [Animated Stars Background]                 │
│                                                                 │
│                     Czech Rocket Society                        │
│                         (Gradient)                              │
│                                                                 │
│            Building the future of space exploration             │
│                                                                 │
│                [Explore Projects]  [Join Us →]                  │
│                                                                 │
│              25+ Rockets    50+ Members    15+ Projects         │
│                                                                 │
│                        ↓ Scroll indicator                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                       WHAT WE DO SECTION                        │
│                                                                 │
│                         What We Do                              │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │    🚀         │  │    🛰️         │  │    📡         │      │
│  │   Rockets     │  │  Satellites   │  │  Telemetry    │      │
│  │               │  │               │  │               │      │
│  │ Description   │  │ Description   │  │ Description   │      │
│  │ of rocket     │  │ of satellite  │  │ of telemetry  │      │
│  │ projects...   │  │ projects...   │  │ systems...    │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     FEATURED PROJECTS SECTION                   │
│                                                                 │
│                      Recent Projects                            │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ [Project Image]      │  │ [Project Image]      │           │
│  │                      │  │                      │           │
│  │ CRS Rocket Alpha     │  │ CubeSat Beta         │           │
│  │ Status: In Progress  │  │ Status: Planning     │           │
│  │                      │  │                      │           │
│  │ Brief description... │  │ Brief description... │           │
│  │                      │  │                      │           │
│  │ [View Details →]     │  │ [View Details →]     │           │
│  └──────────────────────┘  └──────────────────────┘           │
│                                                                 │
│                      [View All Projects]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                       LATEST NEWS SECTION                       │
│                                                                 │
│                         Latest News                             │
│                                                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ [Cover Image]  │ │ [Cover Image]  │ │ [Cover Image]  │     │
│  │                │ │                │ │                │     │
│  │ Article Title  │ │ Article Title  │ │ Article Title  │     │
│  │ Dec 5, 2025    │ │ Dec 3, 2025    │ │ Nov 28, 2025   │     │
│  │                │ │                │ │                │     │
│  │ Short excerpt  │ │ Short excerpt  │ │ Short excerpt  │     │
│  │ of article...  │ │ of article...  │ │ of article...  │     │
│  │                │ │                │ │                │     │
│  │ [Read More →]  │ │ [Read More →]  │ │ [Read More →]  │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                 │
│                        [View All News]                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                          CTA SECTION                            │
│                                                                 │
│           ✨ Join us and become part of the                     │
│                Czech space community                            │
│                                                                 │
│                      [Get Started]                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
│                                                                 │
│ Czech Rocket Society                                            │
│                                                                 │
│ About Us    Projects    Team    News    Contact                │
│                                                                 │
│ [GitHub] [LinkedIn] [Twitter] [Instagram]                      │
│                                                                 │
│ © 2025 Czech Rocket Society. All rights reserved.              │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375x667)

```
┌─────────────────────┐
│ HEADER              │
│ [☰] [Logo]  [Sign] │
├─────────────────────┤
│                     │
│    HERO SECTION     │
│                     │
│  [Stars Animation]  │
│                     │
│  Czech Rocket       │
│     Society         │
│                     │
│  Building the       │
│  future of space    │
│  exploration        │
│                     │
│ [Explore Projects]  │
│                     │
│   [Join Us →]       │
│                     │
│ 25+      50+   15+  │
│ Rockets  Team  Proj │
│                     │
│        ↓            │
├─────────────────────┤
│                     │
│   WHAT WE DO        │
│                     │
│ ┌─────────────────┐ │
│ │      🚀         │ │
│ │    Rockets      │ │
│ │  Description... │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      🛰️         │ │
│ │   Satellites    │ │
│ │  Description... │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      📡         │ │
│ │   Telemetry     │ │
│ │  Description... │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│                     │
│ RECENT PROJECTS     │
│                     │
│ [Swipe carousel →]  │
│                     │
│ ┌─────────────────┐ │
│ │ [Project Img]   │ │
│ │ CRS Rocket      │ │
│ │ Alpha           │ │
│ │ [Details →]     │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│                     │
│   LATEST NEWS       │
│                     │
│ ┌─────────────────┐ │
│ │ [Cover]         │ │
│ │ Article Title   │ │
│ │ Dec 5, 2025     │ │
│ │ [Read More]     │ │
│ └─────────────────┘ │
│                     │
│ [... more articles] │
│                     │
├─────────────────────┤
│                     │
│      CTA            │
│                     │
│  Join us and        │
│  become part of     │
│  Czech space        │
│  community          │
│                     │
│  [Get Started]      │
│                     │
├─────────────────────┤
│ FOOTER              │
│                     │
│ Czech Rocket        │
│ Society             │
│                     │
│ [Links]             │
│ [Social Media]      │
│                     │
│ © 2025 CRS          │
└─────────────────────┘
```

---

## 2. Projects Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (same as homepage)                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      PAGE HEADER                                │
│                                                                 │
│                    Our Projects                                 │
│         Explore our rocket and satellite projects               │
│                                                                 │
│  [Filter: All] [Status: All] [Sort: Recent]  [🔍 Search]       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROJECT GRID (3 columns)                                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │[Project Img] │  │[Project Img] │  │[Project Img] │         │
│  │              │  │              │  │              │         │
│  │ CRS Rocket   │  │ CubeSat Beta │  │ Telemetry    │         │
│  │ Alpha        │  │              │  │ System v2    │         │
│  │              │  │              │  │              │         │
│  │ [In Progress]│  │ [Planning]   │  │ [Completed]  │         │
│  │              │  │              │  │              │         │
│  │ Max Alt:     │  │ Size: 2U     │  │ Range: 10km  │         │
│  │ 3000m        │  │ CubeSat      │  │ Real-time    │         │
│  │              │  │              │  │              │         │
│  │ Team: 8      │  │ Team: 5      │  │ Team: 3      │         │
│  │ members      │  │ members      │  │ members      │         │
│  │              │  │              │  │              │         │
│  │[View Details]│  │[View Details]│  │[View Details]│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ ... more     │  │ ... more     │  │ ... more     │         │
│  │ projects     │  │ projects     │  │ projects     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│              [Load More] or [Pagination]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Detail Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [← Back to Projects]                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              [Hero Image / Gallery]                     │   │
│  │                                                         │   │
│  │              [< Previous | Next >]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────┐  ┌─────────────────────────┐  │
│  │                            │  │  PROJECT INFO SIDEBAR   │  │
│  │  CRS Rocket Alpha          │  │                         │  │
│  │                            │  │  Status: In Progress    │  │
│  │  [Status Badge]            │  │  Started: Jan 2025      │  │
│  │                            │  │                         │  │
│  │  DESCRIPTION               │  │  SPECIFICATIONS         │  │
│  │  Lorem ipsum dolor sit     │  │  • Max Altitude: 3000m  │  │
│  │  amet, consectetur...      │  │  • Engine: Solid fuel   │  │
│  │                            │  │  • Weight: 12kg         │  │
│  │  This project aims to...   │  │  • Diameter: 15cm       │  │
│  │                            │  │                         │  │
│  │  TECHNICAL DETAILS         │  │  TEAM MEMBERS           │  │
│  │  • Propulsion system       │  │  ┌──────────────────┐  │  │
│  │  • Avionics               │  │  │ [Avatar]         │  │  │
│  │  • Recovery system        │  │  │ Jan Novák        │  │  │
│  │  • Telemetry             │  │  │ Lead Engineer    │  │  │
│  │                            │  │  └──────────────────┘  │  │
│  │  MILESTONES               │  │  ┌──────────────────┐  │  │
│  │  ✅ Design completed      │  │  │ [Avatar]         │  │  │
│  │  ✅ Prototype built       │  │  │ Anna Svobodová   │  │  │
│  │  🔄 Testing in progress   │  │  │ Electronics      │  │  │
│  │  ⏳ Launch preparation    │  │  └──────────────────┘  │  │
│  │                            │  │                         │  │
│  │                            │  │  [+ View All Team]      │  │
│  └────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
│  RELATED PROJECTS                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Similar  │  │ Similar  │  │ Similar  │                     │
│  │ Project  │  │ Project  │  │ Project  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Team / Members Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Our Team                                   │
│            Meet the people behind Czech Rocket Society          │
│                                                                 │
│  [Filter: All Roles] [Search members...]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LEADERSHIP (Featured larger cards)                             │
│                                                                 │
│  ┌────────────────────┐       ┌────────────────────┐           │
│  │  [Large Avatar]    │       │  [Large Avatar]    │           │
│  │                    │       │                    │           │
│  │  Jan Novák         │       │  Eva Procházková   │           │
│  │  President         │       │  CTO                │           │
│  │                    │       │                    │           │
│  │  Bio text...       │       │  Bio text...       │           │
│  │                    │       │                    │           │
│  │  [LinkedIn] [Git]  │       │  [LinkedIn] [Git]  │           │
│  └────────────────────┘       └────────────────────┘           │
│                                                                 │
│  ALL MEMBERS (Grid - 4 columns)                                 │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ [Avatar] │ │ [Avatar] │ │ [Avatar] │ │ [Avatar] │          │
│  │          │ │          │ │          │ │          │          │
│  │ Name     │ │ Name     │ │ Name     │ │ Name     │          │
│  │ Role     │ │ Role     │ │ Role     │ │ Role     │          │
│  │          │ │          │ │          │ │          │          │
│  │ Projects │ │ Projects │ │ Projects │ │ Projects │          │
│  │ [View]   │ │ [View]   │ │ [View]   │ │ [View]   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  [... more members in grid]                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              JOIN OUR TEAM                                      │
│                                                                 │
│     We're always looking for talented individuals               │
│                                                                 │
│              [Apply Now]                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. News / Blog Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Latest News                                │
│              Stay updated with our activities                   │
│                                                                 │
│  [Category: All] [🔍 Search articles...]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FEATURED ARTICLE (Full width)                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │            [Large Cover Image]                          │   │
│  │                                                         │   │
│  │  First Successful Launch of CRS-1 Rocket                │   │
│  │  December 1, 2025 • 5 min read • Launch Event           │   │
│  │                                                         │   │
│  │  Lorem ipsum dolor sit amet, consectetur adipiscing     │   │
│  │  elit. Historic moment for Czech space exploration...   │   │
│  │                                                         │   │
│  │  [Read Full Article →]                                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ALL ARTICLES (2 columns)                                       │
│                                                                 │
│  ┌────────────────────────────┐  ┌────────────────────────┐   │
│  │ [Cover Image]              │  │ [Cover Image]          │   │
│  │                            │  │                        │   │
│  │ Article Title              │  │ Article Title          │   │
│  │ Dec 3, 2025 • 3 min read   │  │ Nov 28 • 4 min read    │   │
│  │                            │  │                        │   │
│  │ Short excerpt of the       │  │ Short excerpt...       │   │
│  │ article content...         │  │                        │   │
│  │                            │  │                        │   │
│  │ [Event] [Rockets]          │  │ [Team] [News]          │   │
│  │                            │  │                        │   │
│  │ [Read More →]              │  │ [Read More →]          │   │
│  └────────────────────────────┘  └────────────────────────┘   │
│                                                                 │
│  [... more articles in 2-column grid]                           │
│                                                                 │
│              [Load More Articles]                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Article Detail Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [← Back to News]                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              [Hero Cover Image]                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────┐  ┌─────────────────────────┐  │
│  │                            │  │  ARTICLE META           │  │
│  │  First Successful Launch   │  │                         │  │
│  │  of CRS-1 Rocket           │  │  Published              │  │
│  │                            │  │  December 1, 2025       │  │
│  │  [Event] [Rockets]         │  │                         │  │
│  │                            │  │  Author                 │  │
│  │  By Jan Novák              │  │  ┌────────────┐        │  │
│  │  December 1, 2025          │  │  │ [Avatar]   │        │  │
│  │  5 min read                │  │  │ Jan Novák  │        │  │
│  │                            │  │  └────────────┘        │  │
│  │  ARTICLE CONTENT           │  │                         │  │
│  │  ══════════════            │  │  Reading time           │  │
│  │                            │  │  5 minutes              │  │
│  │  Lorem ipsum dolor sit     │  │                         │  │
│  │  amet, consectetur...      │  │  Share                  │  │
│  │                            │  │  [Twitter] [FB]         │  │
│  │  Paragraph 1...            │  │  [LinkedIn]             │  │
│  │                            │  │                         │  │
│  │  ## Heading 2              │  │  TABLE OF CONTENTS      │  │
│  │                            │  │  • Introduction         │  │
│  │  More content...           │  │  • Preparation          │  │
│  │                            │  │  • Launch Day           │  │
│  │  [Embedded Image]          │  │  • Results              │  │
│  │                            │  │  • Conclusion           │  │
│  │  More paragraphs...        │  │                         │  │
│  │                            │  │                         │  │
│  │  ### Heading 3             │  │                         │  │
│  │                            │  │                         │  │
│  │  Content continues...      │  │                         │  │
│  │                            │  │                         │  │
│  └────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
│  RELATED ARTICLES                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Related  │  │ Related  │  │ Related  │                     │
│  │ Article  │  │ Article  │  │ Article  │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Recruitment Page (Multi-step Form)

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    Join Our Team                                │
│         We're looking for passionate space enthusiasts          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  PROGRESS BAR                                           │   │
│  │  ●───────○───────○───────○                              │   │
│  │  Personal  Skills  Motivation  Review                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  STEP 1: PERSONAL INFORMATION                           │   │
│  │                                                         │   │
│  │  Full Name *                                            │   │
│  │  [                                    ]                 │   │
│  │                                                         │   │
│  │  Email Address *                                        │   │
│  │  [                                    ]                 │   │
│  │                                                         │   │
│  │  Phone Number                                           │   │
│  │  [                                    ]                 │   │
│  │                                                         │   │
│  │  University / School *                                  │   │
│  │  [                                    ]                 │   │
│  │                                                         │   │
│  │  Field of Study *                                       │   │
│  │  [▼ Select field                      ]                 │   │
│  │                                                         │   │
│  │  Year of Study *                                        │   │
│  │  [▼ Select year                       ]                 │   │
│  │                                                         │   │
│  │                                      [Next Step →]      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  WHY JOIN US?                                                   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🎓           │  │ 🚀           │  │ 🤝           │         │
│  │ Learn        │  │ Real         │  │ Network      │         │
│  │ Advanced     │  │ Projects     │  │ & Grow       │         │
│  │ Skills       │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Skills

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PROGRESS BAR                                                   │
│  ●───────●───────○───────○                                      │
│  Personal  Skills  Motivation  Review                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  STEP 2: SKILLS & EXPERIENCE                            │   │
│  │                                                         │   │
│  │  Your Skills (select all that apply)                    │   │
│  │  ☐ CAD Modeling (SolidWorks, Fusion 360)               │   │
│  │  ☐ Electronics Design                                  │   │
│  │  ☐ Programming (Python, C++, etc.)                     │   │
│  │  ☐ 3D Printing                                         │   │
│  │  ☐ Telemetry Systems                                   │   │
│  │  ☐ Mechanical Engineering                              │   │
│  │  ☐ Other: [                ]                           │   │
│  │                                                         │   │
│  │  Describe your relevant experience (optional)           │   │
│  │  ┌─────────────────────────────────────────┐           │   │
│  │  │                                         │           │   │
│  │  │                                         │           │   │
│  │  │                                         │           │   │
│  │  └─────────────────────────────────────────┘           │   │
│  │                                                         │   │
│  │  [← Previous]                        [Next Step →]     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Contact Page

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      Contact Us                                 │
│                Get in touch with our team                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────┐  ┌─────────────────────────┐  │
│  │                            │  │  CONTACT INFORMATION    │  │
│  │  Send us a message         │  │                         │  │
│  │                            │  │  📧 Email               │  │
│  │  Name *                    │  │  info@czechrocket       │  │
│  │  [                    ]    │  │  society.cz             │  │
│  │                            │  │                         │  │
│  │  Email *                   │  │  📍 Address             │  │
│  │  [                    ]    │  │  Prague, Czech          │  │
│  │                            │  │  Republic               │  │
│  │  Subject *                 │  │                         │  │
│  │  [▼ Select             ]   │  │  🕐 Office Hours        │  │
│  │                            │  │  Mon-Fri 9AM-5PM        │  │
│  │  Message *                 │  │                         │  │
│  │  ┌──────────────────────┐ │  │  SOCIAL MEDIA           │  │
│  │  │                      │ │  │  [GitHub]               │  │
│  │  │                      │ │  │  [LinkedIn]             │  │
│  │  │                      │ │  │  [Instagram]            │  │
│  │  │                      │ │  │  [Twitter/X]            │  │
│  │  └──────────────────────┘ │  │                         │  │
│  │                            │  │  FAQ                    │  │
│  │  [Send Message]            │  │  [View FAQs →]          │  │
│  │                            │  │                         │  │
│  └────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
│  LOCATION MAP (Optional)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │              [Embedded Google Maps]                     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Admin Dashboard (CMS)

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                    │
│ [Logo] Czech Rocket Society CMS         [Notifications] [User] │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│  SIDEBAR          │  MAIN CONTENT AREA                          │
│                   │                                             │
│  📊 Dashboard     │  Dashboard Overview                         │
│  📰 Articles      │                                             │
│  🚀 Projects      │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  👥 Members       │  │ 25   │ │ 50   │ │ 15   │ │ 120  │      │
│  🤝 Partners      │  │ Proj │ │ Team │ │ News │ │ Apps │      │
│  📝 Recruitment   │  └──────┘ └──────┘ └──────┘ └──────┘      │
│  ⚙️  Settings     │                                             │
│                   │  Recent Activity                            │
│  [Logout]         │  ┌─────────────────────────────────────┐   │
│                   │  │ • New article published             │   │
│                   │  │ • Project updated                   │   │
│                   │  │ • New recruitment submission        │   │
│                   │  └─────────────────────────────────────┘   │
│                   │                                             │
│                   │  Quick Actions                              │
│                   │  [+ New Article] [+ New Project]            │
│                   │                                             │
├───────────────────┴─────────────────────────────────────────────┤
│ FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Articles Management

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN HEADER                                                    │
├───────────────────┬─────────────────────────────────────────────┤
│ SIDEBAR           │  Articles                                   │
│                   │                                             │
│ [Active: Articl]  │  [+ New Article]  [🔍 Search]  [Filter ▼]  │
│                   │                                             │
│                   │  ┌───────────────────────────────────────┐ │
│                   │  │ Title               Status   Date     │ │
│                   │  ├───────────────────────────────────────┤ │
│                   │  │ First Launch        ✅ Pub  Dec 1     │ │
│                   │  │ Team Update         📝 Draft Dec 3    │ │
│                   │  │ New Partnership     ✅ Pub  Nov 28    │ │
│                   │  │ ...                                   │ │
│                   │  │                                       │ │
│                   │  │ [Edit] [Delete] [View]                │ │
│                   │  └───────────────────────────────────────┘ │
│                   │                                             │
│                   │  [Pagination]                               │
│                   │                                             │
└───────────────────┴─────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

All wireframes are designed with mobile-first approach:

- **Mobile:** 375px - 767px (single column)
- **Tablet:** 768px - 1023px (2 columns)
- **Desktop:** 1024px+ (3-4 columns)

---

## User Flows

### Flow 1: Visitor browsing projects
```
Homepage → Projects Page → Project Detail → Related Project → Back to Projects
```

### Flow 2: Reading news
```
Homepage → News Page → Article Detail → Related Article → Share on Social
```

### Flow 3: Recruitment application
```
Homepage → Join CTA → Recruitment Form (Step 1) → Step 2 → Step 3 → Review → Submit → Thank You
```

### Flow 4: Admin content management
```
Login → Dashboard → Articles → New Article → Editor → Publish → Preview → Publish
```

---

**Version:** 1.0  
**Date:** 8.12.2025  
**Author:** Simon Cerman
