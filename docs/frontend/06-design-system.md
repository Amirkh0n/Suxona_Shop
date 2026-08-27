# SuxonaShop Design System

## Purpose

This document defines the visual design language, component standards, spacing system, typography, colors, and interaction patterns used throughout the SuxonaShop application.

The goal is to maintain a consistent, scalable, and professional user experience across all screens.

---

# Design Philosophy

SuxonaShop is designed as a modern mobile-first marketplace application.

Core principles:

* Simple
* Fast
* Familiar
* Accessible
* Mobile-focused

The interface should feel lightweight and intuitive, especially for users with limited technical experience.

---

# Platform Priority

Primary Platform:

* Telegram Mini App

Secondary Platform:

* Mobile Browser
* Desktop Browser

All design decisions should prioritize mobile usability.

---

# Layout System

## Base Width

Design reference width:

```text
375px
```

All layouts must remain responsive above and below this width.

---

## Maximum Content Width

Desktop:

```text
1280px
```

Content should remain centered on large screens.

---

# Grid System

## Mobile

```text
2-column product grid
```

## Tablet

```text
3-column product grid
```

## Desktop

```text
4-column product grid
```

---

# Spacing System

Use only the following spacing values.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Preferred spacing:

```text
8px
16px
24px
```

Avoid arbitrary spacing values.

---

# Border Radius

## Small

```text
8px
```

Used for:

* Inputs
* Small badges

---

## Medium

```text
12px
```

Used for:

* Buttons
* Cards

---

## Large

```text
16px
```

Used for:

* Product cards
* Store cards
* Modal containers

---

## Extra Large

```text
24px
```

Used sparingly for premium sections.

---

# Color System

## Primary Color

```text
#22C55E
```

Usage:

* Primary buttons
* Active navigation
* Highlights

---

## Primary Hover

```text
#16A34A
```

---

## Background

```text
#FFFFFF
```

---

## Secondary Background

```text
#F8FAFC
```

Used for:

* Sections
* Cards
* Page backgrounds

---

## Border Color

```text
#E2E8F0
```

---

## Primary Text

```text
#0F172A
```

---

## Secondary Text

```text
#64748B
```

---

## Success

```text
#22C55E
```

---

## Warning

```text
#F59E0B
```

---

## Error

```text
#EF4444
```

---

# Typography

## Font Family

Primary:

```text
Inter
```

Fallback:

```text
sans-serif
```

---

# Font Scale

## Display

```text
32px
Bold
```

Used for:

* Hero sections

---

## H1

```text
28px
Bold
```

---

## H2

```text
24px
Bold
```

---

## H3

```text
20px
SemiBold
```

---

## Body Large

```text
16px
Regular
```

---

## Body

```text
14px
Regular
```

---

## Small

```text
12px
Regular
```

---

# Elevation System

## Level 1

```css
box-shadow:
0 1px 2px rgba(0,0,0,0.05);
```

Cards.

---

## Level 2

```css
box-shadow:
0 4px 8px rgba(0,0,0,0.08);
```

Modals.

---

## Level 3

```css
box-shadow:
0 8px 24px rgba(0,0,0,0.12);
```

Floating elements.

---

# Buttons

## Primary Button

Background:

Primary Color

Text:

White

Height:

```text
48px
```

Radius:

```text
12px
```

Width:

```text
100%
```

---

## Secondary Button

Background:

White

Border:

1px Border Color

Text:

Primary Text

---

## Danger Button

Background:

Error Color

Text:

White

---

# Input Fields

Height:

```text
48px
```

Radius:

```text
12px
```

Border:

```text
1px solid #E2E8F0
```

Padding:

```text
16px
```

---

# Product Card

## Structure

Product Image

Product Name

Price

Store Name

Add To Cart Button

---

## Dimensions

Mobile:

```text
Width: 100%
```

Image Ratio:

```text
1:1
```

---

## Product Name

Maximum:

```text
2 lines
```

Use line clamp.

---

## Price

Must be visually dominant.

Example:

```text
45 000 so'm
```

---

# Store Card

Contains:

* Store Logo
* Store Name
* Rating
* Delivery Info

Radius:

```text
16px
```

---

# Bottom Navigation

Height:

```text
64px
```

Always fixed.

Contains:

* Home
* Search
* Cart
* Stores
* Profile

---

# Modal Design

Radius:

```text
24px 24px 0 0
```

Bottom-sheet style preferred on mobile.

---

# Loading States

Use Skeleton UI.

Never show empty white screens while loading.

Required for:

* Products
* Stores
* Orders
* Cart

---

# Empty States

Every empty page must include:

* Illustration
* Title
* Description
* Action Button

Examples:

Empty Cart

No Orders

No Products

No Search Results

---

# Animations

Animations should be subtle.

Preferred duration:

```text
150ms – 250ms
```

Use:

* Fade
* Scale
* Slide

Avoid:

* Bounce
* Excessive motion

---

# Accessibility

Minimum touch target:

```text
44px × 44px
```

All buttons must be accessible.

Color contrast must meet accessibility standards.

---

# Responsive Behavior

The application must function correctly on:

* 320px mobile width
* 375px mobile width
* 768px tablet width
* 1280px desktop width

Mobile experience always takes priority.

---

# Design Consistency Rules

Always use reusable components.

Never create duplicate button styles.

Never use hardcoded colors outside this document.

Never use inconsistent spacing.

All new screens must follow this design system.
