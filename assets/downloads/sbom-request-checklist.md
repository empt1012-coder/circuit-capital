# SBOM request checklist and email template

Circuit & Capital, https://circuits.fit/tools/sbom-request-pack.html
Free to use and adapt. Not legal or procurement advice.

Fields follow the 2026 Minimum Elements for a Software Bill of Materials, published July 29, 2026 by CISA, the NSA, the FBI and international partners. CISA says the minimum elements apply to all software, including SaaS and AI, which may need additional elements. Check the CISA document for exact definitions.

## Before you send
- [ ] Vendor and product named exactly as on the contract
- [ ] Delivery model noted: SaaS, installed software, or AI feature
- [ ] Contract owner and security contact identified
- [ ] Renewal date and notice deadline checked (an SBOM ask carries more weight before the notice deadline)

## Email template

To: [Vendor]
Subject: SBOM request for [Product]

We are buying [Product] ([SaaS / installed software / AI feature]).
Please send an ingredients list that meets the 2026 CISA minimum elements, including for SaaS and AI software, not only code we compile.

For each component, include:
- Supplier name
- Component name
- Version
- Unique identifier
- Component hash, with the name of the hash algorithm used
- Dependency relationship
- License
- Known vulnerabilities

For the SBOM itself, include:
- Author of the SBOM data
- Timestamp
- SBOM tool name: the tool that generated it
- SBOM generation context: when and how in the software lifecycle the SBOM was generated

A logo slide is not an ingredients list.

[Your name]

## What came back (mark Received or Missing)

| Field | Received / Missing | Notes |
|---|---|---|
| Supplier name | | |
| Component name | | |
| Version | | |
| Unique identifier | | |
| Component hash and hash algorithm | | |
| Dependency relationship | | |
| Author of SBOM data | | |
| Timestamp | | |
| SBOM tool name | | |
| SBOM generation context | | |
| License | | |
| Known vulnerabilities | | |

## Tracking across vendors

| Vendor | Product | Model | Date asked | Date received | Fields missing | Follow-up owner | Follow-up date |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
