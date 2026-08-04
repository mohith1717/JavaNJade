# Architecture

JadeGuard starts as a modular monolith with three independently runnable
workspace components:

```text
┌───────────────────────┐        ┌───────────────────────┐
│ React analyst UI      │        │ Python generator      │
│ localhost:5173        │        │ scenario-based input  │
└───────────┬───────────┘        └───────────┬───────────┘
            │ HTTP / REST                    │ HTTP / REST
            └────────────────┬───────────────┘
                             ▼
                 ┌───────────────────────┐
                 │ Spring Boot backend   │
                 │ localhost:8080        │
                 │                       │
                 │ transaction           │
                 │ validation            │
                 │ rule + risk           │
                 │ alert + audit         │
                 │ dashboard             │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ MySQL                 │
                 │ localhost:3307        │
                 └───────────────────────┘
```

## Dependency direction

The intended processing flow is:

```text
transaction → validation → rule → risk → alert → audit
```

Dashboard code is read-only and may query projections from multiple feature
areas. Cross-feature calls go through services, not another feature's
repository. `common` must remain small and must not become a miscellaneous
business-logic package.

## Future extraction boundary

If measured load eventually requires asynchronous processing, transaction
ingestion can publish an event consumed by rule evaluation. The current feature
boundaries allow that change without prematurely operating separate services.
