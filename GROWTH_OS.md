# Baldwin Growth OS — consumer acquisition

## Objective

Turn Baldwin from a finished product with little/no revenue into a measurable acquisition system.

The optimization target is **not email opens, impressions, or raw App Store clicks**. The funnel is:

```
qualified intent
  -> landing_view
  -> app_store_click
  -> app_signup
  -> baseline_complete
  -> second_session
  -> subscription_started
```

Until paid starts are numerous enough to optimize directly, use `baseline_complete` as the primary activation metric and `subscription_started` as the terminal business metric.

## Authorized cash budget

Budget authorization: **$200 total**.

The D1 ledger row `consumer-acquisition-2026-09-22` is the aggregate cap. Every paid experiment must have a per-experiment cap and every external charge must be written to `growth_spend_ledger`.

No agent may:
- create a new budget authorization;
- exceed the aggregate $200 authorization;
- increase an experiment's cap beyond remaining authorization;
- infer that an unused amount may be re-authorized after the cap is exhausted.

## Initial allocation

Do not scatter $200 across many channels.

1. **Apple Ads Advanced search-results test: up to $150**
   - Only after Apple Ads access/payment is configured.
   - Use high-intent keyword clusters, not broad awareness.
   - Match keyword intent to a Custom Product Page when available.
   - Start with a smaller tranche and pause variants that spend without downstream activation.
2. **Creator test / contingency: up to $50**
   - Public business contact details only.
   - Prefer tracked affiliate/referral economics or one very small sponsored test over paying for reach with no attribution.
   - Do not spend this reserve until at least one creator has replied positively or Apple Ads identifies an actionable bottleneck.

Infrastructure, bulk lead lists, generic SEO services, and new outbound SaaS products get **$0** from this budget.

## Acquisition agents

### 1. Funnel Analyst

Reads experiment attribution and lifecycle events. Produces:
- conversion rate by channel / experiment / variant;
- cost per App Store click;
- cost per signup;
- cost per baseline completion;
- cost per paid start;
- revenue where known;
- a recommended continue / pause / collect-more-data state.

Never optimize solely on opens or clicks when downstream events exist.

### 2. Intent & Search Agent

Inputs:
- Search Console queries;
- Baldwin content/search pages;
- Apple Ads search terms once connected;
- public aggregate trend/search evidence.

Outputs:
- keyword/topic clusters;
- proposed landing/store positioning;
- content gaps;
- paid-search experiments.

It may operate on aggregate intent. It must not create profiles of individuals based on hair loss or other health-related inferences.

### 3. Creator Agent

Discovers creators whose *public content/business identity* is explicitly about hair loss, hair restoration, minoxidil/finasteride progress, transplants, or related tracking.

Stores:
- public profile URL;
- public business email where supplied;
- audience/niche;
- fit score;
- outreach state.

It may draft personalized outreach and, when an approved sending capability exists, send low-volume business outreach. It must honor suppression and never obtain private contact data through scraping.

### 4. Community Opportunity Agent

Finds **threads/topics**, not vulnerable individuals.

Allowed workflow:
```
discover public discussion
 -> store URL/community/topic
 -> draft a genuinely useful answer
 -> human/authorized review
 -> post through a compliant account/API
 -> attribute downstream traffic
```

Do not:
- scrape Reddit/X user profiles to infer who has hair loss;
- build a health-status lead list;
- automatically DM people because they discussed hair loss;
- mass-reply to threads;
- evade platform rate limits or moderation.

### 5. Store Experiment Agent

There are three distinct experiment surfaces:

**Owned web positioning**
- Randomized server-side variants are allowed.
- Persist assignment.
- Track through app lifecycle events.
- Candidate message family:
  - "See whether your hair is actually changing."
  - "See whether your hair-loss treatment is working."
  - "Track hair progress without guessing."

**App Store Product Page Optimization**
- Use Apple's native randomized testing for supported creative assets.
- Optimize screenshots/icon/previews against conversion.
- Do not pretend the public app name/title is randomized by PPO.

**App name/subtitle**
- Treat metadata changes as slower sequential experiments tied to version submissions.
- Test the underlying wording first on owned web / ads / custom pages.
- Only promote a metadata wording after it has evidence elsewhere.

### 6. Paid Acquisition Agent

First paid channel: Apple Ads Advanced.

Guardrails:
- hard experiment spend cap;
- hard aggregate authorization cap;
- exact keyword/search-term ledger;
- no automatic budget expansion;
- pause when the experiment hits its cap;
- prefer search-results intent over awareness inventory for the initial $200 test.

## Experiment discipline

Each experiment has:
- one hypothesis;
- one meaningful variable under test;
- a primary metric;
- a budget/sample limit;
- explicit stop/continue criteria;
- attribution all the way to the deepest available lifecycle event.

For owned-web copy tests, the optimizer may use a Bayesian/Beta-Binomial or Thompson-sampling policy **after** a minimum exploration floor. Do not starve a new arm after a handful of observations.

For low-volume outcomes, use a hierarchy:
1. `subscription_started`
2. `baseline_complete`
3. `app_signup`
4. `app_store_click`

Never declare a winner from click-through rate when downstream evidence contradicts it.

## Immediate provider-outreach lesson

The existing provider loop remains in the system, but it is not the only acquisition motion. Before scaling it again:
- improve address quality;
- use real role/person contacts where publicly available;
- test meaningful copy variants;
- optimize for replies -> pilots -> attributed patient activation, not delivery/open rate.

## Control-room target

`/ops-agent/` should evolve from "provider email agent" into the Growth OS console with:

- **Portfolio** — $200 authorization, spend, experiment state, deepest funnel outcomes.
- **Store** — owned-web variants, PPO plan/results, metadata recommendations, Custom Product Pages.
- **Paid** — Apple Ads keyword/ad-group spend and downstream activations.
- **Creators** — public creator pipeline, exact outreach copy, replies, referrals.
- **Community** — public thread opportunities + drafts requiring approval.
- **Providers** — existing provider outreach and referral loop.
- **Content** — existing search/content operator.

The Growth Worker remains the deterministic executor and ledger. ChatGPT chooses research, experiment design, targeting hypotheses, copy, and next action within the configured guardrails.
