# FavoritePerson.app - Product Vision Document
## Expanding to a Full Digital Album Platform

**Version:** 1.0
**Date:** January 2026
**Author:** Morgan - Product Manager
**Status:** Draft for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision Statement](#2-vision-statement)
3. [Market Analysis](#3-market-analysis)
4. [Target User Segments & Personas](#4-target-user-segments--personas)
5. [Feature Prioritization](#5-feature-prioritization)
6. [Monetization Strategy](#6-monetization-strategy)
7. [Success Metrics](#7-success-metrics)
8. [Competitive Differentiation](#8-competitive-differentiation)
9. [Risk Assessment](#9-risk-assessment)
10. [Roadmap Summary](#10-roadmap-summary)

---

## 1. Executive Summary

FavoritePerson.app has successfully established itself as a couples-focused photo sharing platform with a charming polaroid aesthetic, relationship timer, and QR-based sharing. The current freemium model (Free/R$9.90/R$19.90) serves the Brazilian Portuguese-speaking market.

This document outlines the strategic expansion from a niche couples app into a comprehensive digital album platform serving multiple audience segments: **couples, families, professional photographers, and event organizers**.

**Key Strategic Goals:**
- Expand Total Addressable Market (TAM) by 10x through new audience segments
- Increase Average Revenue Per User (ARPU) by 3x with professional-tier offerings
- Maintain emotional brand identity while adding professional capabilities
- Establish FavoritePerson.app as the go-to platform for meaningful photo experiences in Brazil

---

## 2. Vision Statement

### The Vision

**"FavoritePerson.app is where meaningful moments become lasting memories."**

We transform photo storage into emotional experiences. Whether it's a couple's journey, a family's story, a photographer's portfolio, or an event's highlights, FavoritePerson.app provides beautiful, secure, and shareable digital albums that preserve what matters most.

### Mission

To empower individuals and professionals to curate, preserve, and share their most meaningful visual stories through elegant, intuitive, and emotionally resonant digital experiences.

### Core Values

1. **Emotional Connection First** - Every feature should enhance the emotional value of photos
2. **Privacy by Design** - Users control who sees their memories
3. **Beautiful Simplicity** - Professional power with consumer-friendly UX
4. **Brazilian Identity** - Built for Brazil, with local payment methods and Portuguese-first design

---

## 3. Market Analysis

### Current Market Position

| Metric | Current State |
|--------|---------------|
| Primary Market | Brazil (Portuguese speakers) |
| Core Segment | Couples |
| Pricing | Free / R$9.90 / R$19.90 |
| Key Features | Polaroid display, relationship timer, QR sharing |
| Tech Stack | Next.js, Supabase, Vercel |

### Market Opportunity

**Brazil Photo Sharing Market:**
- 214 million population
- 150+ million smartphone users
- Growing digital photo market
- Underserved by international competitors (limited Portuguese support)

**Segment Size Estimates (Brazil):**

| Segment | Market Size | Willingness to Pay |
|---------|-------------|-------------------|
| Couples | ~30M relationships | Low-Medium (R$10-20/mo) |
| Families | ~70M households | Medium (R$20-30/mo) |
| Professional Photographers | ~500K professionals | High (R$50-150/mo) |
| Event Organizers | ~100K businesses | High (R$100-300/event) |

### Competitive Landscape

| Competitor | Strength | Weakness | Our Opportunity |
|------------|----------|----------|-----------------|
| Google Photos | Free storage, AI | No emotional design, generic | Curated, emotional experiences |
| iCloud Photos | Apple ecosystem | iOS only, no sharing focus | Cross-platform, sharing-first |
| SmugMug | Professional features | Expensive, complex | Simpler, Brazil-focused pricing |
| Flickr | Photography community | Outdated UX, declining | Modern, mobile-first |
| WhatsApp | Ubiquitous sharing | No organization, compression | High-quality, organized albums |

---

## 4. Target User Segments & Personas

### Segment 1: Couples (Existing)

#### Persona: Ana & Pedro

**Demographics:**
- Ages 22-35
- Dating or married 1-5 years
- Urban Brazil (Sao Paulo, Rio, Belo Horizonte)
- Combined income: R$5,000-15,000/month

**Goals:**
- Preserve relationship memories
- Share moments with each other
- Track relationship milestones
- Create a private space for their love story

**Pain Points:**
- Photos scattered across devices
- No meaningful organization
- Social media feels too public
- Generic photo apps lack romance

**Quote:** *"Quero um lugar especial so nosso, onde nossas memorias nao se percam no meio de mil outras fotos."*

**Feature Priorities:**
1. Polaroid aesthetic (existing)
2. Relationship timer (existing)
3. Private QR sharing (existing)
4. Chronological timeline view (new)
5. Anniversary reminders (new)

---

### Segment 2: Families

#### Persona: Marcia - Family Organizer

**Demographics:**
- Age 35-55
- Mother of 2-3 children
- Extended family connections important
- Household income: R$8,000-25,000/month

**Goals:**
- Central place for family photos
- Share with grandparents (tech-limited)
- Preserve children's milestones
- Organize by events and years

**Pain Points:**
- Family photos in 10 different places
- Grandparents can't use complex apps
- Coordinating photos from multiple family members
- Privacy concerns with kid photos

**Quote:** *"Minha sogra nao consegue usar Instagram, mas ela adoraria ver as fotos do neto sem ter que pedir toda vez."*

**Feature Priorities:**
1. Simple QR sharing for tech-limited relatives
2. Multiple contributor albums (family members can add)
3. Timeline/chronological layouts
4. Event-based organization (Natal 2025, Aniversario do Joao)
5. Kid-friendly albums with restricted sharing

---

### Segment 3: Professional Photographers

#### Persona: Rafael - Wedding & Event Photographer

**Demographics:**
- Age 25-45
- 3-10 years professional experience
- 20-50 shoots per year
- Annual revenue: R$60,000-200,000

**Goals:**
- Deliver photos to clients professionally
- Control downloads and watermarks
- Build portfolio for new clients
- Streamline delivery workflow

**Pain Points:**
- Google Drive feels unprofessional
- International platforms are expensive (USD pricing)
- Clients requesting photos months later
- Managing multiple client galleries

**Quote:** *"Preciso de algo profissional que cabe no bolso de um fotografo brasileiro, nao um preco gringo."*

**Feature Priorities:**
1. Client galleries with password protection
2. Large file support (50MB RAW/high-res JPG)
3. Batch upload (100+ photos)
4. Selective download permissions
5. Custom watermarking
6. Expiring links (90 days after event)
7. Portfolio/public gallery mode

---

### Segment 4: Event Organizers

#### Persona: Carla - Event Coordinator

**Demographics:**
- Age 28-50
- Works at event company or freelance
- 10-30 events per year
- Revenue per event: R$5,000-50,000

**Goals:**
- Centralize event photos from multiple photographers
- Share with all attendees easily
- Create branded event albums
- Archive past events

**Pain Points:**
- Coordinating photos from hired photographers
- Guests want photos but hate downloading apps
- Managing photo delivery for 50-500 guests
- Post-event follow-up tedious

**Quote:** *"Depois do casamento, todos os convidados pedem as fotos. Preciso de um jeito facil de compartilhar sem mandar 500 WhatsApps."*

**Feature Priorities:**
1. Event albums with multiple contributors
2. Mass QR code generation (printable for tables)
3. Attendee photo upload (crowdsourced galleries)
4. Event branding (logo, colors)
5. Collage/mosaic export for social sharing
6. Download-all option for event organizer

---

## 5. Feature Prioritization

### MVP Phase (Months 1-3)

**Goal:** Expand layouts and basic professional features

| Feature | Segments | Priority | Effort |
|---------|----------|----------|--------|
| Multiple Layouts (Mosaic, Timeline, Masonry) | All | P0 | Medium |
| Tumblr-style Vertical Layout | Couples, Families | P0 | Medium |
| Batch Upload (up to 50 photos) | All | P0 | Medium |
| Album Organization (folders/events) | All | P0 | Medium |
| Password-Protected Sharing | Photographers, Families | P1 | Low |
| Download Permissions (on/off) | Photographers | P1 | Low |

**MVP Exit Criteria:**
- Users can create multiple albums
- 4 layout options available
- Basic password protection works
- Batch upload functional up to 50 photos

---

### Phase 2 (Months 4-6)

**Goal:** Professional photographer features

| Feature | Segments | Priority | Effort |
|---------|----------|----------|--------|
| Large File Support (50MB) | Photographers | P0 | High |
| Custom Watermarking | Photographers | P0 | Medium |
| Batch Upload (100+ photos) | Photographers | P0 | Medium |
| Expiring Links | Photographers, Events | P1 | Low |
| Client Management Dashboard | Photographers | P1 | High |
| Contributor Invites (family/team uploads) | Families, Events | P1 | Medium |

---

### Phase 3 (Months 7-9)

**Goal:** Social sharing and event features

| Feature | Segments | Priority | Effort |
|---------|----------|----------|--------|
| One-Click Instagram Sharing | All | P0 | Medium |
| Story-Format Export | Couples, Families | P0 | Medium |
| Collage Generation | All | P1 | High |
| Event Mode (crowdsourced uploads) | Events | P1 | High |
| Mass QR Generation | Events | P1 | Medium |
| Event Branding (logo, colors) | Events | P2 | Medium |

---

### Phase 4 (Months 10-12)

**Goal:** AI and advanced features

| Feature | Segments | Priority | Effort |
|---------|----------|----------|--------|
| AI Photo Organization (faces, dates) | All | P1 | Very High |
| Smart Album Suggestions | All | P2 | High |
| Print Partnership Integration | All | P2 | Medium |
| API for Third-Party Integration | Photographers | P2 | High |
| White-Label Option | Events, Photographers | P3 | Very High |

---

### Future Backlog

| Feature | Segments | Notes |
|---------|----------|-------|
| Mobile App (React Native) | All | After web MVP stable |
| Video Support | All | Storage cost implications |
| Slideshow Mode | All | Anniversary feature |
| Anniversary/Date Reminders | Couples | Push notifications |
| Family Tree View | Families | Complex UI |
| Real-Time Collaboration | Events | WebSocket implementation |

---

## 6. Monetization Strategy

### Pricing Philosophy

1. **Accessible Entry** - Free tier generous enough to convert to paid
2. **Value-Based Pricing** - Charge based on value delivered, not storage
3. **Brazil-First** - Prices in BRL, competitive with local purchasing power
4. **Segment-Specific** - Different plans for different needs

---

### Consumer Plans (Couples & Families)

| Plan | Price | Photos | Features |
|------|-------|--------|----------|
| **Gratis** | R$0 | 30 photos | 1 album, Polaroid layout only, basic QR sharing |
| **Essencial** | R$14.90/mo | 200 photos | 3 albums, All layouts, Password protection |
| **Premium** | R$29.90/mo | Unlimited | Unlimited albums, Contributor invites, Priority support, No watermark on exports |
| **Familia** | R$39.90/mo | Unlimited | Everything in Premium + 5 family member accounts, Shared family albums |

**Annual Discount:** 20% off (2 months free)

---

### Professional Plans (Photographers)

| Plan | Price | Storage | Features |
|------|-------|---------|----------|
| **Fotografo Starter** | R$49.90/mo | 50GB | 10 client galleries, Custom watermark, Download controls, 50MB file support |
| **Fotografo Pro** | R$99.90/mo | 200GB | 50 client galleries, Client management, Batch upload (200+), Expiring links, Portfolio page |
| **Fotografo Ilimitado** | R$149.90/mo | Unlimited | Unlimited galleries, White-label option, API access, Priority support |

**Annual Discount:** 25% off

---

### Event Plans (Per-Event Pricing)

| Plan | Price | Photos | Features |
|------|-------|--------|----------|
| **Evento Basico** | R$99/event | 500 photos | 1 event album, QR codes, 90-day access |
| **Evento Premium** | R$249/event | 2,000 photos | Crowdsourced uploads, Branding, Download-all, 1-year access |
| **Evento Enterprise** | R$499/event | Unlimited | Multiple albums, Real-time uploads, Dedicated support, Permanent access |

**Volume Discount:** 10% off for 5+ events/year

---

### Revenue Projections (Year 1 Post-Launch)

| Segment | Users | Conversion | ARPU | Monthly Revenue |
|---------|-------|------------|------|-----------------|
| Couples (existing) | 5,000 | 8% | R$22 | R$8,800 |
| Families (new) | 2,000 | 10% | R$35 | R$7,000 |
| Photographers (new) | 500 | 25% | R$85 | R$10,625 |
| Events (new) | 50 | 50% | R$200 | R$5,000 |
| **Total** | 7,550 | - | - | **R$31,425** |

**Year 1 Target:** R$375,000 ARR

---

## 7. Success Metrics

### North Star Metric

**Monthly Active Albums (MAA):** Number of albums with at least 1 view or 1 upload in the last 30 days.

*Rationale:* This measures engagement across all segments and indicates real usage, not just signups.

---

### Segment-Specific KPIs

#### Couples

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Monthly Active Users | 3,000 | 8,000 |
| Photos per Active User | 25 | 40 |
| Paid Conversion | 6% | 10% |
| Churn (Monthly) | <5% | <4% |
| NPS | 50 | 60 |

#### Families

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Monthly Active Users | 500 | 2,500 |
| Contributors per Album | 2.5 | 3.5 |
| Paid Conversion | 8% | 12% |
| Churn (Monthly) | <6% | <5% |
| NPS | 45 | 55 |

#### Photographers

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Registered Photographers | 200 | 800 |
| Active Client Galleries | 500 | 3,000 |
| Paid Conversion | 20% | 30% |
| Churn (Monthly) | <3% | <2% |
| NPS | 55 | 65 |

#### Events

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Events Created | 50 | 300 |
| Avg Attendee Engagement | 30% | 45% |
| Repeat Event Organizers | 15% | 30% |
| NPS | 50 | 60 |

---

### Business Health Metrics

| Metric | Target |
|--------|--------|
| Monthly Recurring Revenue (MRR) | R$30,000 by Month 12 |
| Customer Acquisition Cost (CAC) | <R$50 for consumers, <R$150 for professionals |
| Lifetime Value (LTV) | >R$200 for consumers, >R$800 for professionals |
| LTV:CAC Ratio | >4:1 |
| Gross Margin | >70% |

---

## 8. Competitive Differentiation

### Our Unique Position

**"The Emotional Album Platform Built for Brazil"**

| Differentiator | vs Google Photos | vs SmugMug | vs Local Competitors |
|----------------|------------------|------------|---------------------|
| **Emotional Design** | Generic utility | Professional but cold | Often poor UX |
| **Brazil-First** | Portuguese as afterthought | USD pricing | May exist but limited |
| **Simple Sharing** | Complex permissions | Complex | Often none |
| **Multiple Layouts** | One view | Multiple but complex | Usually one |
| **Fair Pricing** | Free but data concerns | Expensive | Varies |
| **QR Innovation** | None | None | None |

---

### Core Differentiators to Maintain

1. **Emotional Identity**
   - Polaroid aesthetic remains core
   - Relationship timer extends to family milestones
   - Design evokes nostalgia and warmth

2. **QR-First Sharing**
   - Physical-digital bridge (print QR for events)
   - Tech-accessible for all ages
   - Unique to our platform

3. **Privacy Simplicity**
   - Private by default
   - Simple sharing controls
   - No social network pressure

4. **Brazilian DNA**
   - Portuguese-native UX writing
   - BRL pricing
   - Local payment methods (Pix, Boleto)
   - Support in Portuguese

---

### Competitive Moats to Build

1. **Network Effects** (Medium-Term)
   - Photographers recommend to clients
   - Families share across generations
   - Event guests become couples users

2. **Switching Costs** (Long-Term)
   - Accumulated memories hard to move
   - Custom organization/layouts
   - Integration with life events

3. **Brand Affinity** (Ongoing)
   - Emotional connection to brand
   - Associated with special moments
   - Word-of-mouth in communities

---

## 9. Risk Assessment

### High-Impact Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Storage costs exceed revenue** | Medium | High | Implement smart storage tiers, compression, CDN optimization |
| **Photographers don't see value vs free alternatives** | Medium | High | Focus on time-saving, professional presentation, BRL pricing advantage |
| **Feature creep delays core improvements** | High | Medium | Strict prioritization, MVP discipline, feature flags |
| **Competition from big tech Brazil entry** | Low | Very High | Build brand loyalty now, unique features they won't copy |

### Medium-Impact Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Technical scaling challenges** | Medium | Medium | Supabase scales well, prepare CDN strategy early |
| **Payment processing issues** | Low | Medium | Multiple payment providers, Stripe + local options |
| **User confusion from multiple segments** | Medium | Medium | Clear segment-based onboarding, separate landing pages |

---

## 10. Roadmap Summary

### 2026 Timeline

```
Q1 2026 (Months 1-3): Foundation
|-- Multiple Layouts (Mosaic, Timeline, Masonry, Tumblr)
|-- Album Organization
|-- Batch Upload (50)
|-- Password Protection
|-- New Pricing Tiers

Q2 2026 (Months 4-6): Professional
|-- Large File Support (50MB)
|-- Watermarking
|-- Batch Upload (100+)
|-- Client Dashboard
|-- Contributor Invites

Q3 2026 (Months 7-9): Social & Events
|-- Instagram Sharing
|-- Story Export
|-- Collage Generation
|-- Event Mode
|-- Mass QR Generation

Q4 2026 (Months 10-12): Intelligence
|-- AI Organization
|-- Smart Suggestions
|-- Print Partnerships
|-- API Launch
|-- Mobile App Beta
```

---

## Appendix A: Feature Details

### Layout Specifications

**1. Polaroid (Existing)**
- Classic white-border polaroid style
- Caption and date below photo
- Hover effects for actions
- Best for: Couples, nostalgic feel

**2. Mosaic Grid**
- Pinterest-style varied sizes
- Masonry layout algorithm
- Dense photo display
- Best for: Large galleries, photographers

**3. Timeline/Chronological**
- Vertical scroll with date markers
- Year/month navigation
- Story-like flow
- Best for: Families, life events

**4. Tumblr-Style Vertical**
- Single-column centered
- Full-width photos
- Caption-focused
- Best for: Artistic, blog-style

**5. Masonry**
- Variable height, fixed columns
- No cropping
- Efficient space use
- Best for: Mixed aspect ratios

---

## Appendix B: Technical Considerations

### Storage Architecture (High-Level)

- **Supabase Storage:** Primary for file hosting
- **CDN:** CloudFlare for delivery
- **Compression:** Client-side before upload (except Pro plans)
- **Tiers:**
  - Free: Max 5MB per photo
  - Paid Consumer: Max 15MB per photo
  - Professional: Max 50MB per photo

### Upload Limits

| Plan | Max File Size | Batch Size | Daily Limit |
|------|---------------|------------|-------------|
| Free | 5MB | 5 | 10 photos |
| Essencial | 15MB | 20 | 50 photos |
| Premium | 15MB | 50 | Unlimited |
| Fotografo | 50MB | 200 | Unlimited |

---

## Appendix C: Localization Notes

### Brazilian Portuguese Guidelines

- Use informal "voce" not "tu" (standard in most of Brazil)
- Currency always in R$ with comma for decimals (R$29,90)
- Date format: DD/MM/AAAA
- Emotional copy: warm, romantic, family-focused
- Avoid anglicisms when Portuguese alternatives exist

### Payment Methods Priority

1. **Pix** - Instant, low fees, most popular
2. **Credit Card** - Stripe integration
3. **Boleto Bancario** - For those without cards
4. **Recurring via Card** - For subscriptions

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Morgan (PM) | Initial product vision document |

---

*This document is a living strategy guide. Review quarterly and update based on market feedback and business performance.*
