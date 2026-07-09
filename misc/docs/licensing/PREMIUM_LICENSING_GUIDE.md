# Premium Plugin Licensing Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Licensing Flow Architecture](#licensing-flow-architecture)
3. [Implementation Options](#implementation-options)
4. [Pricing for Licensing Platforms](#pricing-for-licensing-platforms)
5. [Recommended Solution](#recommended-solution)
6. [Premium Plugin Pricing Strategy](#premium-plugin-pricing-strategy)
7. [License Key Flow](#license-key-flow)
8. [Technical Implementation](#technical-implementation)
9. [Security Considerations](#security-considerations)
10. [User Experience Flow](#user-experience-flow)
11. [Integration with Existing System](#integration-with-existing-system)

---

## Overview

This document outlines the complete licensing architecture for the Adaire Blocks premium plugin. The goal is to create a secure, user-friendly system that:

- Validates premium users through license keys
- Prevents unauthorized use of premium features
- Integrates seamlessly with the existing free/premium configuration
- Provides automatic updates for licensed users
- Offers a smooth activation/deactivation experience

---

## Licensing Flow Architecture

### High-Level Flow

```
1. User purchases premium plugin
   ↓
2. User receives license key via email
   ↓
3. User installs premium plugin on WordPress site
   ↓
4. User enters license key in plugin settings
   ↓
5. Plugin validates key with licensing server
   ↓
6. License key is activated for the specific domain
   ↓
7. Premium features are unlocked
   ↓
8. Plugin periodically checks license validity
   ↓
9. User receives automatic updates
```

### License States

- **Inactive**: License key not entered or not activated
- **Active**: Valid license key activated for current domain
- **Expired**: License subscription has expired (for subscription model)
- **Invalid**: License key is invalid or revoked
- **Exceeded**: License activation limit exceeded (e.g., used on too many sites)
- **Deactivated**: User manually deactivated license from this site

---

## Implementation Options

### Option 1: Software Licensing (SL) with Easy Digital Downloads (EDD)

**Overview**: EDD is a complete WordPress e-commerce solution with a robust licensing add-on.

**Components**:
- Easy Digital Downloads (Core plugin for selling)
- Software Licensing add-on (for license management)
- EDD SL Plugin Updater class (for plugin updates)

**Pros**:
- Battle-tested by thousands of WordPress plugin/theme shops
- Complete e-commerce solution included
- Excellent documentation and community support
- Handles payments, subscriptions, renewals automatically
- REST API for programmatic access
- Advanced features like upgrades, renewals, and license management

**Cons**:
- Requires WordPress installation for the licensing server
- Additional server needed if using separate site for sales
- More complex initial setup
- Licensing add-on is a paid product (199 USD/year)

**Best For**: Developers wanting a complete e-commerce + licensing solution.

---

### Option 2: Freemius SDK

**Overview**: All-in-one monetization platform specifically designed for WordPress plugins and themes.

**Components**:
- Freemius SDK (integrated into your plugin)
- Freemius Dashboard (hosted service)

**Pros**:
- Zero server setup required (fully hosted)
- Handles licensing, payments, analytics, and affiliates
- Free tier available for testing
- Automatic plugin updates
- Built-in analytics and insights
- Professional checkout experience
- Multi-currency support
- Subscription management
- Freemium model support
- No coding required for basic integration

**Cons**:
- Revenue sharing model (some plans take percentage of sales)
- Less control over the licensing server
- Data stored on third-party servers
- Limited customization of checkout flow

**Best For**: Solo developers or small teams wanting a quick, hosted solution with minimal maintenance.

---

### Option 3: License Manager for WooCommerce

**Overview**: WooCommerce extension for selling and managing software licenses.

**Components**:
- WooCommerce (e-commerce platform)
- License Manager for WooCommerce plugin
- REST API integration

**Pros**:
- Uses familiar WooCommerce ecosystem
- Full control over your data and licensing server
- One-time purchase option available
- REST API for license validation
- Advanced license key generation options
- Supports license activation limits
- Supports expiration dates
- Can integrate with existing WooCommerce store

**Cons**:
- Requires WooCommerce setup
- Need separate WordPress installation for licensing server
- More manual setup than Freemius
- May require custom integration code

**Best For**: Developers with existing WooCommerce stores or those wanting full control.

---

### Option 4: 10Quality WP Plugin Licenser

**Overview**: WordPress plugin for license key validation and software updates.

**Components**:
- WP Plugin Licenser (on licensing server)
- Licensing SDK (integrated into your plugin)

**Pros**:
- Lightweight and focused on licensing only
- Open-source and free
- Good for simple licensing needs
- Works with any payment gateway
- Full control over implementation

**Cons**:
- Less feature-rich than EDD SL
- Smaller community and support
- Requires separate payment processing setup
- More manual development work

**Best For**: Developers wanting a free, lightweight solution with full control.

---

### Option 5: Custom Built Solution

**Overview**: Build your own licensing server and validation system.

**Components**:
- Custom REST API endpoints on your server
- Database for license key storage
- Plugin updater class
- License validation logic

**Pros**:
- Complete control over every aspect
- No third-party dependencies
- No revenue sharing
- Customizable to exact needs
- Can integrate with any payment processor

**Cons**:
- Significant development time required
- Responsibility for security and maintenance
- Need to handle edge cases and testing
- Must build update mechanism from scratch
- Ongoing maintenance burden

**Best For**: Developers with specific requirements or those wanting zero dependencies.

---

## Pricing for Licensing Platforms

### Easy Digital Downloads + Software Licensing

**Initial Investment**:
- Easy Digital Downloads Core: FREE
- Software Licensing Add-on: 199 USD/year (Personal Pass)
  - OR 299 USD/year (Extended Pass)
  - OR 499 USD/year (Professional Pass - includes all extensions)
- EDD Recurring Payments (for subscriptions): Included in Extended/Professional Pass
  - OR 99 USD/year standalone

**Total Annual Cost**:
- Minimum (one-time licenses): 199 USD/year
- Recommended (with subscriptions): 299 USD/year
- Full featured: 499 USD/year

**Additional Costs**:
- Hosting for licensing server: 5-50 USD/month (depending on scale)
- SSL certificate: FREE (Let's Encrypt) or 10-100 USD/year
- Domain name: 10-15 USD/year

**Renewal Policy**:
- Annual renewal for updates and support
- Extensions continue working after expiration
- No updates/support if not renewed

**Payment Processing Fees**:
- Stripe: 2.9% + 0.30 USD per transaction
- PayPal: 2.9% + 0.30 USD per transaction
- No additional EDD fees

**Break-even Analysis**:
```
With 299 USD/year investment:
- At 49 USD/plugin: Need 7 sales to break even
- At 99 USD/plugin: Need 4 sales to break even
- At 149 USD/plugin: Need 2 sales to break even
```

---

### Freemius Pricing

**Revenue Sharing Model**:

**Free Plan**:
- Cost: FREE
- Features: Basic SDK integration, analytics
- Limitations: Freemius branding on checkout
- Best for: Testing and development

**Growth Plan**:
- Cost: 7% of revenue (minimum 99 USD/month when revenue exceeds 1,414 USD/month)
- Features:
  - Custom checkout branding
  - Unlimited products
  - Email support
  - Analytics dashboard
  - Affiliate management
  - Multi-currency support
- No upfront costs

**Professional Plan**:
- Cost: 5% of revenue (minimum 499 USD/month when revenue exceeds 9,980 USD/month)
- Features:
  - Everything in Growth
  - Priority support
  - Custom payment gateways
  - Advanced analytics
  - White-label checkout
  - Dedicated account manager

**Payment Processing**:
- Freemius handles payment processing
- Supports Stripe, PayPal, and more
- Payment processing fees separate (Stripe/PayPal standard rates apply)

**Break-even Comparison vs EDD**:
```
Monthly Revenue: 1,000 USD
- Freemius (7%): 70 USD/month = 840 USD/year
- EDD: 299 USD/year
Winner: EDD

Monthly Revenue: 3,000 USD  
- Freemius (7%): 210 USD/month = 2,520 USD/year
- EDD: 299 USD/year
Winner: EDD

Monthly Revenue: 500 USD
- Freemius (7%): 35 USD/month = 420 USD/year
- EDD: 299 USD/year
Winner: Freemius (lower revenue, percentage better)

Freemius becomes more expensive at >3,571 USD/year revenue (298 USD/month)
```

**Pros of Revenue Sharing**:
- No upfront investment
- Scales with business
- Less financial risk when starting

**Cons of Revenue Sharing**:
- More expensive at higher revenue
- Ongoing percentage vs one-time annual fee

---

### License Manager for WooCommerce

**Plugin Cost**:
- Core Plugin: FREE (basic version on WordPress.org)
- Premium Version: 99 EUR/year (~108 USD/year)
  - Includes: License generators, API access, stock control
  - OR: 199 EUR/year (~217 USD/year)
  - Includes: Priority support, advanced features

**Additional Requirements**:
- WooCommerce: FREE
- WooCommerce Subscriptions (for recurring): 199 USD/year
- Hosting for WooCommerce store: 10-100 USD/month
- SSL certificate: FREE or 10-100 USD/year
- Payment gateway fees: Standard Stripe/PayPal rates

**Total Annual Cost**:
- Basic (one-time sales): 108 USD/year
- With subscriptions: 108 + 199 = 307 USD/year
- Premium with subscriptions: 217 + 199 = 416 USD/year

**Break-even Analysis**:
```
With 307 USD/year investment:
- At 49 USD/plugin: Need 7 sales to break even
- At 99 USD/plugin: Need 4 sales to break even
- Similar to EDD
```

---

### 10Quality WP Plugin Licenser

**Plugin Cost**: FREE (open source)

**Total Investment**:
- Plugin: 0 USD
- Hosting: 5-50 USD/month
- SSL certificate: FREE or 10-100 USD/year
- Payment processing: Need separate solution
  - Stripe: 2.9% + 0.30 USD per transaction
  - PayPal: 2.9% + 0.30 USD per transaction

**Annual Cost**: 60-600 USD (hosting only)

**Hidden Costs**:
- Development time to implement payment system
- Maintenance and support burden
- Security updates and monitoring

**Best For**: 
- Very budget-conscious developers
- Those with existing payment infrastructure
- Custom requirements not met by other solutions

---

### Custom Built Solution

**Development Cost**: 2,000 - 10,000 USD (one-time)
- Junior developer (40 hours @ 50 USD/hour): 2,000 USD
- Experienced developer (40 hours @ 100 USD/hour): 4,000 USD
- Full-featured system (80-100 hours): 5,000-10,000 USD

**Ongoing Costs**:
- Hosting: 10-100 USD/month
- Maintenance: 20-40 hours/year = 1,000-4,000 USD/year
- Security updates and monitoring: Included in maintenance
- SSL certificate: FREE or 10-100 USD/year

**Total First Year**: 3,200 - 15,000 USD
**Annual Ongoing**: 1,200 - 5,000 USD

**Break-even vs Commercial Solution**:
```
Custom build at 5,000 USD + 2,000 USD/year maintenance
vs EDD at 299 USD/year

Year 1: 5,000 vs 299 (EDD wins by 4,701 USD)
Year 2: 7,000 vs 598 (EDD wins by 6,402 USD)
Year 5: 13,000 vs 1,495 (EDD wins by 11,505 USD)

Custom solution rarely makes financial sense unless:
- Very specific requirements
- Extremely high volume (>100,000 USD/year revenue)
- Control requirements override cost
```

---

### Platform Comparison Summary

| Platform | Upfront Cost | Annual Cost | Revenue % | Best For | Break-even |
|----------|-------------|-------------|-----------|----------|------------|
| EDD + SL | 0 USD | 199-499 USD | 0% | Most WordPress plugins | 4-10 sales @ 49 USD |
| Freemius | 0 USD | 0 USD | 7% | Quick launch, low risk | Good under 3,571 USD/year |
| License Manager WC | 0 USD | 108-416 USD | 0% | Existing WC stores | 6-9 sales @ 49 USD |
| WP Plugin Licenser | 0 USD | 60-600 USD | 0% | DIY developers | Variable |
| Custom Build | 2,000-10,000 USD | 1,200-5,000 USD | 0% | Specific needs | Rarely cost-effective |

**Recommendation**: For Adaire Blocks, EDD Software Licensing offers the best value at moderate scale.

---

## Recommended Solution

### Primary Recommendation: Easy Digital Downloads + Software Licensing

**Reasoning**:
1. **Proven Track Record**: Used by major WordPress plugin/theme companies
2. **Complete Ecosystem**: Handles sales, licensing, and updates
3. **Excellent Documentation**: Comprehensive guides and code examples
4. **Active Community**: Large user base for troubleshooting
5. **Professional Updates**: Automatic plugin updates with version control
6. **Scalability**: Can handle growth from small to enterprise

**Secondary Recommendation: Freemius** (for faster launch)

If you want to launch quickly without managing a licensing server, Freemius is excellent for:
- Quick market validation
- Minimal technical overhead
- Professional checkout experience
- Built-in analytics

---

## Premium Plugin Pricing Strategy

### Market Research: WordPress Block Plugins

**Competitor Analysis**:

| Plugin | Free Features | Premium Price | Model | Features |
|--------|--------------|---------------|-------|----------|
| Stackable | 40+ blocks | 99 USD/year | Annual | Unlimited sites, premium blocks |
| Kadence Blocks | 15+ blocks | 129 USD/year | Annual | Advanced features, priority support |
| GenerateBlocks Pro | Basic blocks | 49 USD/year | Annual | Premium suite, updates |
| Spectra Pro | 25+ blocks | 69 USD/year | Annual | Premium blocks, WooCommerce |
| Ultimate Addons for Gutenberg | Basic blocks | 69 USD/year | Annual | 1 site license |
| Block Lab Pro | Basic builder | 99 USD/year | Annual | Advanced features |

**Average Market Price**: 60-130 USD/year for annual subscriptions

---

### Recommended Pricing Models

#### Option 1: Annual Subscription (Recommended)

**Single Site License**:
- Price: 79 USD/year
- Includes: All premium blocks, 1 site activation
- Updates: 1 year
- Support: 1 year email support

**5 Site License**:
- Price: 149 USD/year (30 USD/site)
- Includes: All premium blocks, 5 site activations
- Updates: 1 year
- Support: 1 year priority support
- Popular choice badge

**Unlimited Sites License**:
- Price: 249 USD/year
- Includes: All premium blocks, unlimited activations
- Updates: 1 year
- Support: 1 year priority support
- Best for: Agencies and freelancers

**Pricing Psychology**:
```
79 USD   - Anchors the low end (individual users)
149 USD  - Sweet spot (62% more expensive, 400% more value)
249 USD  - Premium tier (makes 149 USD look reasonable)

Most customers will choose the middle tier (5 sites)
```

**Annual Revenue Projections**:
```
Conservative (Year 1):
- 20 single site @ 79 USD = 1,580 USD
- 30 5-site @ 149 USD = 4,470 USD
- 5 unlimited @ 249 USD = 1,245 USD
Total: 7,295 USD

Moderate (Year 2):
- 50 single site @ 79 USD = 3,950 USD
- 80 5-site @ 149 USD = 11,920 USD
- 15 unlimited @ 249 USD = 3,735 USD
Total: 19,605 USD

Optimistic (Year 3):
- 100 single site @ 79 USD = 7,900 USD
- 150 5-site @ 149 USD = 22,350 USD
- 30 unlimited @ 249 USD = 7,470 USD
Total: 37,720 USD
```

---

#### Option 2: Lifetime License

**Single Site Lifetime**:
- Price: 199 USD (one-time)
- Includes: All premium blocks, lifetime updates
- Support: 1 year (extendable)

**5 Site Lifetime**:
- Price: 349 USD (one-time)
- Includes: All premium blocks, lifetime updates
- Support: 1 year priority (extendable)

**Unlimited Sites Lifetime**:
- Price: 549 USD (one-time)
- Includes: All premium blocks, lifetime updates
- Support: Lifetime priority support

**Pros**:
- Higher upfront revenue
- More attractive to some customers
- Competitive advantage

**Cons**:
- No recurring revenue
- Long-term support costs
- Updates burden without income

**Recommendation**: Offer both annual and lifetime, but emphasize annual subscriptions.

---

#### Option 3: Hybrid Model (Best of Both Worlds)

**Core Offering - Annual Subscription**:
- Single Site: 79 USD/year
- 5 Sites: 149 USD/year
- Unlimited: 249 USD/year

**Alternative - Lifetime Option** (at 3x annual price):
- Single Site Lifetime: 237 USD (3 years worth)
- 5 Sites Lifetime: 447 USD (3 years worth)
- Unlimited Lifetime: 747 USD (3 years worth)

**Rationale**:
- Lifetime priced at 3x annual encourages subscriptions
- Customers staying 3+ years would choose annual anyway
- Provides choice without cannibalizing recurring revenue

---

### Freemium Strategy

**Free Version Limitations** (from your config):

Current limitations are well-designed:

1. **Accordion Block**: Max 3 items (premium: unlimited)
2. **Testimonial Block**: Max 3 items (premium: unlimited)
3. **Logos Block**: Max 3 items (premium: unlimited)
4. **Tabs Block**: Max 3 items (premium: unlimited)
5. **Premium-Only Blocks**:
   - Video Hero Block
   - Portfolio Block
   - Particles Block
   - Services Block
   - Posts Grid Block
   - Project Block
   - Scroll Text Block
   - Tab Panel Block
   - Questions Block

**Upgrade Triggers**:
```
User needs 4+ accordion items → Must upgrade
User wants video background → Must upgrade
User needs advanced blocks → Must upgrade
```

**Recommended Adjustments**:
- Keep item limits at 3 (good balance)
- Consider offering 1-2 more premium blocks in free version with limits
- This creates more "aha moments" before hitting limits

---

### Launch Pricing Strategy

**Phase 1: Early Bird (First 3 Months)**

Offer 40% discount to early adopters:
- Single Site: 47 USD/year (regularly 79 USD)
- 5 Sites: 89 USD/year (regularly 149 USD)
- Unlimited: 149 USD/year (regularly 249 USD)

**Benefits**:
- Builds initial customer base
- Generates testimonials and reviews
- Creates urgency with countdown timer
- Covers licensing platform costs quickly

**Marketing Message**: "Launch Special: Get Adaire Blocks Premium at 40% off - Limited Time"

---

**Phase 2: Standard Pricing (After Launch Period)**

Full pricing as outlined:
- Single Site: 79 USD/year
- 5 Sites: 149 USD/year
- Unlimited: 249 USD/year

**Grandfather Policy**: Early bird customers keep their pricing on renewals (builds loyalty)

---

**Phase 3: Seasonal Promotions**

Periodic discounts throughout the year:
- Black Friday / Cyber Monday: 35% off
- New Year: 25% off
- Plugin Anniversary: 30% off
- Random flash sales: 20% off

**Frequency**: 4-6 times per year (not too often to devalue)

---

### Payment Terms and Policies

**Renewal Pricing**:
- Same price as initial purchase (if purchased at full price)
- Early bird customers: Keep launch pricing forever
- 30-day renewal reminder emails
- Grace period: 14 days after expiration (premium features still work)

**Refund Policy**:
- 30-day money-back guarantee
- No questions asked
- Full refund processing
- Builds trust and reduces purchase anxiety

**Upgrade Paths**:
- Single Site → 5 Sites: Pay difference pro-rated
- 5 Sites → Unlimited: Pay difference pro-rated
- Annual → Lifetime: Credit annual payment toward lifetime

**Educational/Non-Profit Discount**:
- 40% discount with .edu email or non-profit verification
- Good for community building
- PR and goodwill

**Agency Partner Program**:
- Buy 10+ licenses: 25% discount
- Buy 25+ licenses: 35% discount
- Dedicated support channel
- Co-marketing opportunities

---

### Revenue Optimization

**Upsells and Cross-sells**:

1. **During Checkout**:
   - "Upgrade to 5 sites and save 62% per site"
   - "Add lifetime support for +99 USD"

2. **After Purchase**:
   - "Upgrade your license" option in dashboard
   - Email campaign: "Need more sites?"

3. **Complementary Products** (Future):
   - Adaire Blocks Templates: 29 USD/pack
   - Premium Support (monthly): 29 USD/month
   - Custom Block Development: Starting at 499 USD

**Affiliate Program**:
- Commission: 30% on first sale
- Cookie duration: 60 days
- Recurring commissions: 20% on renewals
- Attracts WordPress educators and bloggers

---

### Pricing Psychology Tactics

**Anchoring**:
```
Standard Price: 149 USD
Discount Price: 79 USD
Savings: 70 USD (47% OFF)

Customer sees value of 149 USD, pays only 79 USD
```

**Scarcity**:
- "Only 50 early bird licenses left"
- "Offer ends in 3 days"
- Countdown timers

**Social Proof**:
- "Join 1,000+ happy customers"
- Display recent purchases (e.g., "John from USA purchased 5 minutes ago")
- Show testimonials on pricing page

**Risk Reversal**:
- 30-day money-back guarantee
- "Try risk-free for 30 days"
- Reduces purchase friction

**Value Stack**:
```
Premium Blocks:         399 USD value
Priority Support:       99 USD value
Lifetime Updates:       199 USD value
Premium Templates:      149 USD value
Total Value:            846 USD

Your Price Today:       79 USD/year
You Save:               767 USD (91% OFF)
```

---

### Competitive Positioning

**Your Unique Selling Points**:

1. **Modern Block Architecture**
   - Built with latest WordPress standards
   - Performance optimized
   - Gutenberg-native

2. **Developer-Friendly**
   - Well-documented
   - Extensible codebase
   - Block template system

3. **Premium Support**
   - Direct access to developers
   - Fast response times
   - Active development

**Positioning Statement**:
"Professional Gutenberg blocks for designers and developers who demand performance, flexibility, and beautiful design."

**Target Audience**:
- Primary: Freelance web designers/developers
- Secondary: Small agencies
- Tertiary: DIY business owners

**Price Positioning**:
- Not the cheapest (avoid race to bottom)
- Not the most expensive (accessible to freelancers)
- Mid-range premium (79-249 USD range)
- Focus on value over price

---

### Financial Planning

**First Year Budget** (Using EDD at 299 USD/year):

**Costs**:
- EDD Software Licensing: 299 USD/year
- Hosting: 120 USD/year (10 USD/month)
- Domain: 15 USD/year
- Payment processing: ~3% of revenue
- Support time: 5 hours/month @ 50 USD/hour = 3,000 USD/year

**Total Fixed Costs**: 3,434 USD/year
**Variable Costs**: 3% of revenue (payment processing)

**Break-even Calculation**:
```
At 79 USD/year pricing (single site):
Break-even = 3,434 / 79 = 44 sales

At 149 USD/year pricing (5 sites):
Break-even = 3,434 / 149 = 24 sales

Mixed (50% single, 50% 5-site):
Average price: 114 USD
Break-even = 3,434 / 114 = 31 sales
```

**Realistic First Year Goal**: 50-100 sales = 5,700 - 11,400 USD revenue

---

### Pricing Recommendations Summary

**Recommended Pricing**:
- Single Site: 79 USD/year
- 5 Sites: 149 USD/year (most popular)
- Unlimited: 249 USD/year

**Launch Strategy**:
- Start with 40% early bird discount (47/89/149 USD)
- Run for 90 days
- Grandfather early adopters on renewals

**Business Model**:
- Primary: Annual subscriptions (recurring revenue)
- Optional: Lifetime licenses at 3x annual price
- Additional: Affiliate program at 30% commission

**Revenue Target Year 1**: 7,000-15,000 USD
**Revenue Target Year 2**: 20,000-35,000 USD
**Revenue Target Year 3**: 40,000-70,000 USD

**Platform**: Easy Digital Downloads + Software Licensing (299 USD/year)

---

## License Key Flow

### Detailed Flow Diagram

```
CUSTOMER JOURNEY:
=================

1. PURCHASE PHASE
   - Customer visits your website
   - Adds Adaire Blocks Premium to cart
   - Completes checkout (via EDD/WooCommerce/Stripe)
   - Receives purchase confirmation email

2. LICENSE DELIVERY
   - System generates unique license key
   - License key sent via email
   - Customer can view license in account dashboard
   - Downloads premium plugin ZIP file

3. INSTALLATION
   - Customer uploads plugin to WordPress
   - Activates plugin
   - Plugin detects no valid license
   - Shows admin notice: "Activate your license to unlock premium features"

4. ACTIVATION
   - User navigates to Adaire Blocks → License
   - Enters license key in input field
   - Clicks "Activate License" button
   - Plugin sends API request to licensing server:
     * License key
     * Site URL
     * WordPress version
     * Plugin version
   
5. VALIDATION (Server-Side)
   - Licensing server receives request
   - Checks if license key exists in database
   - Validates license status (not expired/revoked)
   - Checks activation count vs. limit
   - Verifies domain not already activated (if single-site license)
   
6. ACTIVATION RESPONSE
   Success:
   - Server increments activation count
   - Stores domain → license association
   - Returns success + license data (expiry, plan type, etc.)
   - Plugin stores license data locally (encrypted)
   - Shows success message
   - Premium features are unlocked
   - User can start using premium blocks
   
   Failure:
   - Server returns error code and message
   - Plugin displays specific error:
     * "Invalid license key"
     * "License expired - please renew"
     * "Activation limit reached"
     * "License revoked"
   - Premium features remain locked

7. ONGOING VALIDATION
   - Plugin checks license validity every 24 hours (heartbeat)
   - Validates on plugin update
   - Validates when accessing specific premium features
   - Stores last check timestamp

8. AUTOMATIC UPDATES
   - Plugin checks for updates daily
   - Sends license key with update check request
   - Licensing server validates license
   - If valid, returns update package URL
   - WordPress downloads and installs update

9. DEACTIVATION (Optional)
   - User can deactivate license from site
   - Frees up activation slot
   - Premium features revert to free limitations
   - User can activate on different site

10. RENEWAL (For Subscriptions)
    - License approaching expiration
    - Send renewal reminder emails
    - User renews via customer portal
    - License expiration extended automatically
    - No re-activation needed
```

---

## Technical Implementation

### Using EDD Software Licensing

#### Server-Side Setup (Licensing Server)

**Required Plugins**:
```
1. Easy Digital Downloads (Free)
2. Software Licensing add-on (Paid)
3. EDD Recurring Payments (for subscriptions - Paid)
```

**Product Setup**:
1. Create new Download: "Adaire Blocks Premium"
2. Enable Software Licensing for product
3. Configure license settings:
   - Activation limit: 1 (or 5, 10, unlimited)
   - License expiration: 1 year (or lifetime)
   - Enable version checking
   - Set current version number
4. Add plugin ZIP file as download file
5. Configure pricing and purchase options

**API Endpoints** (provided by EDD SL):
- License activation: `?edd_action=activate_license`
- License deactivation: `?edd_action=deactivate_license`
- License check: `?edd_action=check_license`
- Version check: `?edd_action=get_version`

---

#### Client-Side Implementation (Your Plugin)

**File Structure**:
```
adaire-blocks-dev2/
├── includes/
│   ├── class-adaire-license-manager.php    (NEW)
│   └── class-adaire-blocks-config.php      (EXISTING)
├── admin/
│   ├── class-adaire-license-page.php       (NEW)
│   └── settings-page.php                    (EXISTING)
└── lib/
    └── EDD_SL_Plugin_Updater.php           (NEW - from EDD)
```

**Core License Manager Class** (`class-adaire-license-manager.php`):

```php
<?php
/**
 * Adaire Blocks License Manager
 * Handles license activation, validation, and updates
 */

class Adaire_License_Manager {
    
    private static $instance = null;
    private $license_key_option = 'adaire_blocks_license_key';
    private $license_status_option = 'adaire_blocks_license_status';
    private $license_data_option = 'adaire_blocks_license_data';
    private $store_url = 'https://yourlicenseserver.com'; // Your EDD site
    private $item_id = 123; // EDD Download ID
    private $item_name = 'Adaire Blocks Premium';
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        // Initialize updater
        $this->init_updater();
        
        // Schedule license check
        if (!wp_next_scheduled('adaire_license_check')) {
            wp_schedule_event(time(), 'daily', 'adaire_license_check');
        }
        
        add_action('adaire_license_check', array($this, 'check_license'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_init', array($this, 'handle_license_actions'));
    }
    
    /**
     * Initialize EDD updater
     */
    private function init_updater() {
        $license_key = trim(get_option($this->license_key_option));
        
        $edd_updater = new EDD_SL_Plugin_Updater(
            $this->store_url,
            ADAIRE_BLOCKS_PLUGIN_FILE,
            array(
                'version'   => ADAIRE_BLOCKS_VERSION,
                'license'   => $license_key,
                'item_id'   => $this->item_id,
                'author'    => 'Adaire Digital',
                'beta'      => false
            )
        );
    }
    
    /**
     * Activate license key
     */
    public function activate_license($license_key) {
        $api_params = array(
            'edd_action' => 'activate_license',
            'license'    => $license_key,
            'item_id'    => $this->item_id,
            'url'        => home_url()
        );
        
        $response = wp_remote_post($this->store_url, array(
            'timeout'   => 15,
            'sslverify' => true,
            'body'      => $api_params
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => 'Connection error: ' . $response->get_error_message()
            );
        }
        
        $license_data = json_decode(wp_remote_retrieve_body($response));
        
        if ($license_data->license === 'valid') {
            update_option($this->license_key_option, $license_key);
            update_option($this->license_status_option, 'valid');
            update_option($this->license_data_option, $license_data);
            
            return array(
                'success' => true,
                'message' => 'License activated successfully!',
                'data'    => $license_data
            );
        } else {
            return array(
                'success' => false,
                'message' => $this->get_error_message($license_data->license)
            );
        }
    }
    
    /**
     * Deactivate license key
     */
    public function deactivate_license() {
        $license_key = get_option($this->license_key_option);
        
        $api_params = array(
            'edd_action' => 'deactivate_license',
            'license'    => $license_key,
            'item_id'    => $this->item_id,
            'url'        => home_url()
        );
        
        $response = wp_remote_post($this->store_url, array(
            'timeout'   => 15,
            'sslverify' => true,
            'body'      => $api_params
        ));
        
        if (!is_wp_error($response)) {
            delete_option($this->license_status_option);
            delete_option($this->license_data_option);
            
            return array(
                'success' => true,
                'message' => 'License deactivated successfully'
            );
        }
        
        return array(
            'success' => false,
            'message' => 'Deactivation failed'
        );
    }
    
    /**
     * Check license validity (run daily)
     */
    public function check_license() {
        $license_key = get_option($this->license_key_option);
        
        if (empty($license_key)) {
            return;
        }
        
        $api_params = array(
            'edd_action' => 'check_license',
            'license'    => $license_key,
            'item_id'    => $this->item_id,
            'url'        => home_url()
        );
        
        $response = wp_remote_post($this->store_url, array(
            'timeout'   => 15,
            'sslverify' => true,
            'body'      => $api_params
        ));
        
        if (!is_wp_error($response)) {
            $license_data = json_decode(wp_remote_retrieve_body($response));
            update_option($this->license_status_option, $license_data->license);
            update_option($this->license_data_option, $license_data);
        }
    }
    
    /**
     * Check if license is valid
     */
    public function is_license_valid() {
        $status = get_option($this->license_status_option);
        return $status === 'valid';
    }
    
    /**
     * Get license data
     */
    public function get_license_data() {
        return get_option($this->license_data_option);
    }
    
    /**
     * Get error message based on license status
     */
    private function get_error_message($status) {
        $messages = array(
            'expired'    => 'Your license has expired. Please renew to continue receiving updates.',
            'disabled'   => 'Your license has been disabled.',
            'invalid'    => 'Invalid license key. Please check and try again.',
            'inactive'   => 'License is not active for this site.',
            'item_name_mismatch' => 'This license key is not for Adaire Blocks Premium.',
            'no_activations_left' => 'Activation limit reached. Deactivate from another site first.'
        );
        
        return isset($messages[$status]) ? $messages[$status] : 'Unknown error occurred.';
    }
}
```

**License Settings Page** (`class-adaire-license-page.php`):

```php
<?php
/**
 * License activation page in WordPress admin
 */

class Adaire_License_Page {
    
    private $license_manager;
    
    public function __construct() {
        $this->license_manager = Adaire_License_Manager::get_instance();
        
        add_action('admin_menu', array($this, 'add_license_menu'));
        add_action('admin_notices', array($this, 'show_license_notices'));
    }
    
    public function add_license_menu() {
        add_submenu_page(
            'adaire-blocks-settings', // Parent slug
            'License',
            'License',
            'manage_options',
            'adaire-blocks-license',
            array($this, 'render_license_page')
        );
    }
    
    public function render_license_page() {
        $license_status = get_option('adaire_blocks_license_status');
        $license_data = $this->license_manager->get_license_data();
        
        ?>
        <div class="wrap">
            <h1>Adaire Blocks Premium License</h1>
            
            <?php if ($license_status === 'valid'): ?>
                <div class="notice notice-success">
                    <p><strong>License Active</strong> - Premium features are enabled.</p>
                </div>
                
                <table class="form-table">
                    <tr>
                        <th>License Status</th>
                        <td><span class="dashicons dashicons-yes-alt" style="color: green;"></span> Active</td>
                    </tr>
                    <tr>
                        <th>License Type</th>
                        <td><?php echo esc_html($license_data->license_limit); ?> site(s)</td>
                    </tr>
                    <tr>
                        <th>Expires</th>
                        <td><?php echo $license_data->expires === 'lifetime' ? 'Never' : date('F j, Y', strtotime($license_data->expires)); ?></td>
                    </tr>
                </table>
                
                <form method="post">
                    <?php wp_nonce_field('adaire_license_deactivate', 'adaire_license_nonce'); ?>
                    <input type="hidden" name="adaire_license_action" value="deactivate">
                    <button type="submit" class="button">Deactivate License</button>
                </form>
                
            <?php else: ?>
                <div class="notice notice-warning">
                    <p>Enter your license key to unlock premium features and receive automatic updates.</p>
                </div>
                
                <form method="post">
                    <?php wp_nonce_field('adaire_license_activate', 'adaire_license_nonce'); ?>
                    <input type="hidden" name="adaire_license_action" value="activate">
                    
                    <table class="form-table">
                        <tr>
                            <th>License Key</th>
                            <td>
                                <input type="text" 
                                       name="adaire_license_key" 
                                       class="regular-text" 
                                       placeholder="Enter your license key"
                                       required>
                                <p class="description">
                                    Enter the license key you received after purchase.
                                    <a href="https://yoursite.com/account/" target="_blank">View your license key</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <p class="submit">
                        <button type="submit" class="button button-primary">Activate License</button>
                    </p>
                </form>
            <?php endif; ?>
        </div>
        <?php
    }
    
    public function show_license_notices() {
        if (!$this->license_manager->is_license_valid() && current_user_can('manage_options')) {
            ?>
            <div class="notice notice-warning">
                <p>
                    <strong>Adaire Blocks Premium:</strong> 
                    Please <a href="<?php echo admin_url('admin.php?page=adaire-blocks-license'); ?>">activate your license</a> 
                    to unlock premium features and receive updates.
                </p>
            </div>
            <?php
        }
    }
}

new Adaire_License_Page();
```

**Integration with Existing Config**:

Modify `class-adaire-blocks-config.php`:

```php
public function is_premium() {
    // Check if license is valid
    $license_manager = Adaire_License_Manager::get_instance();
    
    // Plugin is premium if:
    // 1. Not defined as free version AND
    // 2. Has valid license
    return !ADAIRE_BLOCKS_IS_FREE && $license_manager->is_license_valid();
}
```

---

## Security Considerations

### Critical Security Measures

1. **License Key Storage**:
   - Store license keys in WordPress options table
   - Consider encryption for sensitive data
   - Never output license keys in frontend HTML
   - Use wp_nonce for all license actions

2. **API Communication**:
   - Always use HTTPS for licensing server
   - Enable SSL verification in wp_remote_post
   - Implement rate limiting on licensing server
   - Use authentication tokens for API requests

3. **Validation Frequency**:
   - Check license on plugin activation
   - Daily background checks (using WP Cron)
   - Check before allowing premium features
   - Graceful degradation if server unreachable

4. **Code Obfuscation** (Optional):
   - Consider using ionCube or Zend Guard for critical files
   - Note: Not foolproof, but adds another layer
   - Balance between security and support/debugging

5. **License Limit Enforcement**:
   - Track domain activations on server
   - Prevent activation on localhost/staging (optional setting)
   - Allow deactivation to free up slots
   - Consider allowing X development domains

6. **Update Security**:
   - Sign update packages with checksums
   - Verify package integrity before installation
   - Use secure download URLs
   - Set proper file permissions after update

---

## User Experience Flow

### Smooth Activation Journey

**First Install Experience**:
```
1. User activates plugin
2. See welcome screen with:
   - Quick start guide
   - "Activate License" button (prominent)
   - Link to purchase if they don't have license
3. Click "Activate License" → taken to license page
4. Enter key → instant validation → success message
5. Redirect to block showcase or getting started page
```

**Admin Notice Strategy**:
```
- Show dismissible notice on all admin pages (first 3 days)
- After dismissal, show only on plugin pages
- Include clear CTA button
- Show different messages based on:
  * No license entered
  * Invalid license
  * Expired license
  * Approaching expiration (30 days)
```

**Error Handling**:
```
- Use specific error messages:
  ✗ "Invalid license key" (not just "error")
  ✓ "License key activated successfully"
  
- Provide actionable next steps:
  ✗ "Activation limit reached"
  ✓ "Activation limit reached. Deactivate from another site or upgrade your plan."
  
- Include support links:
  "Having trouble? Contact support"
```

**License Expiration Handling**:
```
30 Days Before:
- Email: "Your license expires in 30 days"
- Admin notice: "Renew now to continue receiving updates"

7 Days Before:
- More urgent email reminder
- Prominent admin notice

After Expiration:
- Premium features continue to work (graceful degradation)
- Updates stop
- Admin notice: "License expired - renew to receive updates"
- No hard block (better UX)
```

---

## Integration with Existing System

### Modifications to Current Codebase

**1. Update `adaire-blocks.php`**:

```php
// Add after existing constants
define('ADAIRE_BLOCKS_STORE_URL', 'https://yourlicenseserver.com');
define('ADAIRE_BLOCKS_ITEM_ID', 123); // Your EDD Download ID

// Include license manager
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'includes/class-adaire-license-manager.php';
require_once ADAIRE_BLOCKS_PLUGIN_PATH . 'admin/class-adaire-license-page.php';

// Initialize license manager
Adaire_License_Manager::get_instance();
```

**2. Update `class-adaire-blocks-config.php`**:

```php
public function is_premium() {
    // Return true only if license is valid
    if (ADAIRE_BLOCKS_IS_FREE) {
        return false;
    }
    
    $license_manager = Adaire_License_Manager::get_instance();
    return $license_manager->is_license_valid();
}

public function should_show_upgrade_notice($block_name, $attributes) {
    // Only show upgrade notice if:
    // 1. Free version OR
    // 2. Premium version without valid license
    
    if (!$this->is_premium()) {
        // Check block limits
        $block_config = $this->get_block_config($block_name);
        
        // If block is disabled in free version
        if (!$block_config['enabled']) {
            return true;
        }
        
        // Check specific limits (e.g., accordion items)
        return $this->check_block_limits($block_name, $attributes);
    }
    
    return false;
}
```

**3. Update Editor Configuration**:

Modify `adaire_blocks_localize_editor_config()` function:

```php
function adaire_blocks_localize_editor_config() {
    $config = AdaireBlocksConfig::get_instance();
    $license_manager = Adaire_License_Manager::get_instance();
    
    $editor_config = array(
        'isPremium'       => $config->is_premium(),
        'licenseValid'    => $license_manager->is_license_valid(),
        'licenseData'     => $license_manager->get_license_data(),
        'pluginVersion'   => ADAIRE_BLOCKS_VERSION,
        'blocks'          => $blocks_config,
        'upgradeUrl'      => 'https://yoursite.com/premium/',
        'licenseUrl'      => admin_url('admin.php?page=adaire-blocks-license')
    );
    
    wp_localize_script('wp-block-editor', 'adaireBlocksConfig', $editor_config);
}
```

**4. Add License Check to Block Registration**:

```php
function create_block_gsap_hero_block_block_init() {
    // Check license before registering premium blocks
    $config = AdaireBlocksConfig::get_instance();
    $is_premium = $config->is_premium();
    
    // Get settings
    $settings = AdaireBlocksSettings::get_instance();
    $block_settings = $settings->get_settings();
    $available_blocks = $settings->get_available_blocks();
    
    foreach ($block_settings as $block_key => $enabled) {
        if (!$enabled) {
            continue;
        }
        
        $block_name = $block_mapping[$block_key] ?? null;
        if (!$block_name) {
            continue;
        }
        
        // Check if block requires premium license
        $block_config = $config->get_block_config($block_name);
        if (!$block_config['enabled'] && !$is_premium) {
            continue; // Skip premium blocks if no valid license
        }
        
        // Register block...
    }
}
```

---

## Next Steps

### Implementation Checklist

- [ ] Choose licensing solution (EDD SL recommended)
- [ ] Set up licensing server (WordPress + EDD + SL add-on)
- [ ] Configure product in EDD
- [ ] Implement license manager class
- [ ] Create license settings page
- [ ] Integrate with existing config system
- [ ] Add license validation to block registration
- [ ] Implement automatic updates
- [ ] Test activation flow
- [ ] Test deactivation flow
- [ ] Test license expiration handling
- [ ] Test multi-site scenarios
- [ ] Add admin notices
- [ ] Create user documentation
- [ ] Set up customer email templates
- [ ] Test complete purchase → activation flow
- [ ] Security audit
- [ ] Load testing for licensing API
- [ ] Prepare launch

### Testing Scenarios

1. **Fresh Installation**:
   - Install without license → verify free features only
   - Activate valid license → verify premium features unlock
   
2. **License States**:
   - Test invalid license key
   - Test expired license
   - Test activation limit reached
   - Test deactivated license
   
3. **Updates**:
   - Test update with valid license
   - Test update attempt without license
   
4. **Edge Cases**:
   - Server connection failure during validation
   - License server downtime
   - Domain change scenarios
   - Multisite installations

---

## Additional Resources

### EDD Software Licensing
- Documentation: https://easydigitaldownloads.com/downloads/software-licensing/
- API Reference: https://docs.easydigitaldownloads.com/article/1569-software-licensing-api
- Code Examples: https://github.com/easydigitaldownloads/edd-sl-code-examples

### Freemius SDK
- Website: https://freemius.com/
- Documentation: https://freemius.com/help/documentation/
- SDK GitHub: https://github.com/Freemius/wordpress-sdk

### License Manager for WooCommerce
- Plugin Page: https://wordpress.org/plugins/license-manager-for-woocommerce/
- Documentation: https://www.licensemanager.at/docs/

### WP Plugin Licenser
- GitHub: https://github.com/10quality/wp-plugin-licenser

### Best Practices
- WordPress Plugin Handbook: https://developer.wordpress.org/plugins/
- Plugin Security Best Practices: https://developer.wordpress.org/plugins/security/
- Update API: https://developer.wordpress.org/plugins/wordpress-org/how-to-use-the-update-api/

---

## Conclusion

Implementing a licensing system requires careful planning but provides essential protection for your premium product. The recommended approach using Easy Digital Downloads with Software Licensing offers the best balance of features, reliability, and community support.

Start with a clear plan, implement security from the beginning, and prioritize user experience throughout the activation and validation flow. With proper implementation, your licensing system will be secure, user-friendly, and maintainable for years to come.

