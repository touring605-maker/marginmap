# Industry Value Profile Reference
**Purpose:** Machine-readable reference for populating revenue and value proposition templates in a business case builder app.
**Companion file:** `industry_cost_profiles.md` — this file mirrors that structure exactly.
**Structure:** Universal value streams → Near-universal value streams → Industry sectors → Sub-industry value profiles → Hybrid industry scenarios.
**Usage notes:**
- Each value item represents a *category* of revenue or value delivery, not an amount.
- `prevalence` indicates how broadly a stream applies: `universal`, `near-universal`, `common`, `selective`.
- `revenue_type` classifies how money flows: `recurring`, `transactional`, `usage-based`, `project`, `hybrid`.
- `value_driver` indicates what the customer is fundamentally paying for: `access`, `outcome`, `asset`, `service`, `experience`, `risk-transfer`, `information`, `compliance`.
- Sub-industry profiles inherit sector-level common value streams unless noted.
- Both revenue model (how money is collected) and value proposition (what drives willingness to pay) are captured per item.

---

## Part 1: Universal Value Streams

These revenue models and value propositions appear across virtually all industries. Every business case template should include hooks for these regardless of industry selection.

```yaml
universal_value_streams:

  - id: service_fee
    label: Service Fees
    description: Direct payment for a service performed. The most fundamental exchange of value across all industries.
    prevalence: universal
    revenue_type: transactional
    value_driver: outcome
    value_proposition: The customer pays for a specific result or task to be completed on their behalf.
    sub_items:
      - One-time service fee
      - Hourly or daily rate billing
      - Project-based flat fee
      - Retainer fee (ongoing access to services)
      - Performance-based fee (tied to outcome)
      - Consulting or advisory fee

  - id: product_sale
    label: Product Sales
    description: Exchange of a physical or digital good for a one-time payment.
    prevalence: universal
    revenue_type: transactional
    value_driver: asset
    value_proposition: The customer acquires ownership of something that delivers utility, status, or capability.
    sub_items:
      - New product sale (unit price × volume)
      - Bundle or package sale
      - Replacement & repeat purchase
      - Spare parts & consumables
      - Digital product download or license

  - id: subscription
    label: Subscription & Recurring Revenue
    description: Periodic payment in exchange for ongoing access to a product, service, or platform.
    prevalence: universal
    revenue_type: recurring
    value_driver: access
    value_proposition: The customer pays for continuous availability, updates, and the right to use — without owning.
    sub_items:
      - Monthly or annual subscription
      - Tiered subscription plans (basic / pro / enterprise)
      - Seat-based or user-based subscription
      - Usage-included subscription with overage
      - Membership fee

  - id: contract_revenue
    label: Contract & Program Revenue
    description: Revenue earned under a formal multi-period agreement, often with defined deliverables and milestones.
    prevalence: universal
    revenue_type: project
    value_driver: outcome
    value_proposition: The customer pays for guaranteed delivery of a defined scope over a defined period.
    sub_items:
      - Fixed-price contract
      - Time-and-materials contract
      - Cost-plus contract
      - Milestone-based payment schedule
      - Government or institutional program contract

  - id: licensing
    label: Licensing & Royalties
    description: Payment for the right to use intellectual property, a brand, technology, or proprietary method.
    prevalence: universal
    revenue_type: recurring
    value_driver: access
    value_proposition: The customer pays for access to IP or capability they could not easily replicate independently.
    sub_items:
      - Software license fee
      - IP or patent royalty (percentage of revenue)
      - Brand or trademark license
      - Franchise fee & ongoing royalty
      - Content or media license

  - id: ancillary_and_add_on
    label: Ancillary & Add-On Revenue
    description: Secondary revenue streams layered on top of a primary product or service relationship.
    prevalence: universal
    revenue_type: transactional
    value_driver: service
    value_proposition: The customer pays for convenience, enhancement, or extension of their primary purchase.
    sub_items:
      - Extended warranty or service plan
      - Premium support tier
      - Customization or configuration fee
      - Training & onboarding fee
      - Accessories & complementary products
      - Rush or priority service premium
```

---

## Part 2: Near-Universal Value Streams

These appear in the majority of industries but may be absent or negligible in some pure-product or non-commercial organizations.

```yaml
near_universal_value_streams:

  - id: usage_based_revenue
    label: Usage-Based & Consumption Revenue
    description: Charges that scale directly with how much of a product or service the customer consumes.
    prevalence: near-universal
    revenue_type: usage-based
    value_driver: access
    value_proposition: The customer pays only for what they use, aligning cost to value received.
    notes: Negligible for fixed-price or subscription-only businesses. Dominant for utilities, cloud, and telecom.
    sub_items:
      - Per-unit consumption charge
      - Metered billing (by volume, weight, time)
      - Overage or burst fees
      - Pay-as-you-go pricing
      - Variable rate based on demand or time of use

  - id: data_and_information
    label: Data, Information & Insights Revenue
    description: Monetization of proprietary data, analysis, research, or intelligence.
    prevalence: near-universal
    revenue_type: recurring
    value_driver: information
    value_proposition: The customer pays for a decision advantage they cannot easily produce themselves.
    notes: Absent for pure physical goods manufacturers with no data layer. Growing in virtually every sector.
    sub_items:
      - Market research & intelligence reports
      - Data feed or API access subscription
      - Analytics & dashboard access
      - Benchmarking & competitive intelligence
      - Proprietary index or scoring product
      - Consulting insights derived from proprietary data

  - id: advertising_and_sponsorship
    label: Advertising & Sponsorship Revenue
    description: Payment by a third party (advertiser or sponsor) for access to an audience or venue.
    prevalence: near-universal
    revenue_type: transactional
    value_driver: access
    value_proposition: The paying party (advertiser) buys exposure to a targeted audience they value.
    notes: Not applicable to B2B-only businesses with no audience. Increasingly relevant as platforms proliferate.
    sub_items:
      - Display & digital advertising
      - Sponsored content or native advertising
      - Event or venue sponsorship
      - Product placement
      - Co-marketing & promotional partnerships
      - Retail media (advertising within commerce platforms)

  - id: financing_and_interest
    label: Financing, Interest & Financial Revenue
    description: Revenue generated from providing credit, financing, or financial products alongside a core offering.
    prevalence: near-universal
    revenue_type: recurring
    value_driver: access
    value_proposition: The customer pays for the ability to acquire or use something now that they could not afford outright.
    notes: Explicit in financial services; embedded in auto, healthcare, real estate, and many retail businesses.
    sub_items:
      - Interest income on loans extended
      - Lease income
      - Floor plan or inventory financing income
      - Credit card or payment product revenue
      - Insurance product revenue (sold alongside core offering)
      - Finance & insurance (F&I) income

  - id: marketplace_and_platform_revenue
    label: Marketplace & Platform Revenue
    description: Revenue from facilitating transactions or connections between two or more parties.
    prevalence: near-universal
    revenue_type: transactional
    value_driver: access
    value_proposition: The customer pays for access to a marketplace, network, or matching mechanism that reduces friction.
    notes: Growing as platform models extend into traditional industries.
    sub_items:
      - Transaction or take-rate fee (% of GMV)
      - Listing or placement fee
      - Lead generation fee
      - Matchmaking or referral fee
      - Network access fee
      - App store or platform distribution fee

  - id: asset_monetization
    label: Asset Monetization & Leasing
    description: Revenue generated by deploying owned assets — property, equipment, IP, or infrastructure — in exchange for periodic payment.
    prevalence: near-universal
    revenue_type: recurring
    value_driver: asset
    value_proposition: The customer pays for use of an asset without the capital commitment of ownership.
    notes: Negligible for pure-service businesses with no owned assets.
    sub_items:
      - Equipment rental or lease income
      - Real property lease income
      - IP licensing income
      - Infrastructure access fees
      - Fleet or vehicle leasing income
      - Capacity leasing (manufacturing, data center)
```

---

## Part 3: Sector & Sub-Industry Value Profiles

Each sector includes:
- `sector_common_value_streams`: Revenue models and value propositions shared broadly across the sector.
- `sub_industries`: Individual sub-industry profiles with specific value streams and what drives customer willingness to pay.

Sub-industry profiles include the sector common value streams by inheritance unless marked `inherits_sector_value: false`.

---

### Sector: Agriculture, Food & Natural Resources

```yaml
sector:
  id: agriculture_food_natural_resources
  label: Agriculture, Food & Natural Resources
  sector_common_value_streams:
    - Commodity product sale (bulk pricing, spot or contract)
    - Forward & futures contract revenue (price certainty)
    - Premium product / specialty crop premium over commodity
    - Contract farming or growing agreements
    - Direct-to-consumer sales (farmers markets, CSA subscriptions)
    - By-product & co-product monetization
    - Carbon credit & ecosystem services revenue (emerging)
    - Government subsidy & program payment income

  sub_industries:

    - id: crop_farming
      label: Crop Farming
      value_proposition: Reliable supply of food, fiber, or feedstock inputs at competitive cost.
      specific_value_streams:
        - Bulk commodity sale (grains, oilseeds, cotton at market price)
        - Specialty & heirloom crop premium (above-commodity pricing)
        - Organic certification premium
        - Direct-to-consumer (CSA boxes, farmers market, farm stand)
        - Contract production agreements (processors, food companies)
        - Agritourism revenue (farm tours, pick-your-own)
        - Carbon sequestration credits
        - Cover crop seed sales

    - id: livestock_and_dairy
      label: Livestock & Dairy
      value_proposition: Animal protein, dairy products, and breeding genetics at scale.
      specific_value_streams:
        - Live animal sale (market price by weight)
        - Processed meat & poultry product sale
        - Milk & dairy product sale (fluid milk, cheese, butter)
        - Breeding stock & genetics premium
        - Organic / grass-fed / pasture-raised premium
        - By-product monetization (hides, wool, offal)
        - Direct-to-consumer (farm store, meat CSA)

    - id: aquaculture_and_fishing
      label: Aquaculture & Fishing
      value_proposition: Seafood supply — wild-caught or farm-raised — for food service, retail, and export.
      specific_value_streams:
        - Whole fish & seafood sale (commodity or market price)
        - Processed & value-added seafood (fillets, smoked, frozen)
        - Premium species or origin premium (wild Alaskan salmon, etc.)
        - Aquaculture product sale (consistent spec, year-round supply)
        - Export market revenue (higher-value international buyers)
        - Bycatch & by-product monetization (fishmeal, fish oil)

    - id: forestry_and_timber
      label: Forestry & Timber
      value_proposition: Sustainable supply of wood fiber for construction, paper, and biomass energy.
      specific_value_streams:
        - Timber & log sale (by species, grade, volume)
        - Pulpwood & biomass sale
        - Carbon credit & sustainable forestry certification premium
        - Recreation & hunting lease revenue
        - Land sale or conservation easement income
        - Certified sustainable timber premium (FSC)

    - id: food_and_beverage_processing
      label: Food & Beverage Processing
      value_proposition: Transformed, safe, shelf-stable, and convenient food products at scale.
      specific_value_streams:
        - Branded consumer product sale (retail & food service)
        - Private label / co-manufacturing revenue
        - Bulk ingredient sale (B2B to other manufacturers)
        - Premium & specialty product lines (organic, non-GMO, clean label)
        - Foodservice distribution contracts
        - Export & international market revenue
        - By-product & co-product sale (animal feed, industrial uses)

    - id: agricultural_inputs
      label: Agricultural Inputs
      value_proposition: Yield improvement, input efficiency, and risk reduction for farm operators.
      specific_value_streams:
        - Seed sale (commodity or proprietary genetics)
        - Proprietary seed technology license / trait fee
        - Fertilizer & crop protection product sale
        - Equipment sale & financing income
        - Precision agriculture software subscription
        - Agronomic advisory & consulting services
        - Data & field analytics platform revenue
```

---

### Sector: Energy & Utilities

```yaml
sector:
  id: energy_and_utilities
  label: Energy & Utilities
  sector_common_value_streams:
    - Commodity energy sale (electricity, gas, fuel by unit)
    - Capacity & reliability payment (grid services)
    - Long-term supply contract or PPA revenue
    - Infrastructure access & tariff revenue
    - Ancillary & grid services revenue
    - Carbon credit & renewable energy certificate (REC) sale
    - Government incentive & subsidy income

  sub_industries:

    - id: oil_and_gas_extraction
      label: Oil & Gas Extraction
      value_proposition: Reliable supply of hydrocarbon feedstock for energy, transportation, and industrial use.
      specific_value_streams:
        - Crude oil sale (global commodity, WTI/Brent benchmark)
        - Natural gas sale (spot or long-term contract)
        - Natural gas liquids (NGL) sale
        - Royalty & working interest income
        - Midstream gathering & processing fees (if integrated)
        - Carbon offset or emissions trading revenue

    - id: coal_mining
      label: Coal Mining
      value_proposition: Low-cost thermal energy feedstock for power generation; metallurgical coal for steel.
      specific_value_streams:
        - Thermal coal sale (power plant contracts)
        - Metallurgical (coking) coal sale (steel industry premium)
        - Long-term offtake contract revenue
        - Export market revenue

    - id: petroleum_refining_and_distribution
      label: Petroleum Refining & Distribution
      value_proposition: Refined fuels and petrochemical feedstocks delivered reliably to end markets.
      specific_value_streams:
        - Refined product sale (gasoline, diesel, jet fuel, fuel oil)
        - Petrochemical feedstock sale (naphtha, LPG)
        - Refining margin (crack spread) monetization
        - Retail fuel distribution margin
        - Lubricants & specialty product sale
        - Pipeline & terminal throughput fees

    - id: electric_power_generation
      label: Electric Power Generation
      value_proposition: Reliable, affordable electricity delivered when and where needed.
      specific_value_streams:
        - Wholesale electricity sale (energy market)
        - Capacity market payment (for being available)
        - Power purchase agreement (PPA) revenue
        - Ancillary services revenue (frequency regulation, reserves)
        - Retail electricity sale (vertically integrated utilities)
        - Renewable energy certificate (REC) sale

    - id: electric_grid_and_transmission
      label: Electric Grid & Transmission
      value_proposition: Safe, reliable transmission of electricity from generation to distribution — the physical internet of power.
      specific_value_streams:
        - Regulated transmission tariff revenue (FERC-approved)
        - Wheeling & open-access transmission fee
        - Interconnection service revenue
        - Ancillary services provision
        - Infrastructure lease income (tower attachments, fiber on right-of-way)

    - id: natural_gas_distribution
      label: Natural Gas Distribution
      value_proposition: Reliable, safe delivery of natural gas to homes and businesses.
      specific_value_streams:
        - Regulated distribution tariff revenue
        - Gas commodity sale margin (where utilities buy and resell gas)
        - Transportation-only fee (where customers buy gas directly)
        - Storage service revenue
        - New connection & infrastructure fees

    - id: water_and_wastewater_utilities
      label: Water & Wastewater Utilities
      value_proposition: Safe drinking water and wastewater treatment as a public health essential.
      specific_value_streams:
        - Metered water consumption revenue
        - Fixed service / availability charge
        - Wastewater treatment fee
        - Industrial pretreatment permit revenue
        - New connection & tap fee (capital contribution)
        - Reclaimed water sale (irrigation, industrial)

    - id: renewable_energy
      label: Renewable Energy
      value_proposition: Zero-carbon electricity and energy products that meet sustainability mandates and long-term price stability needs.
      specific_value_streams:
        - Power purchase agreement (PPA) revenue (long-term fixed price)
        - Wholesale energy market revenue
        - Renewable energy certificate (REC) sale
        - Capacity market revenue
        - Tax credit monetization (ITC, PTC — sold or transferred)
        - Green tariff or premium green power product revenue

    - id: energy_storage_and_management
      label: Energy Storage & Management
      value_proposition: Grid flexibility, peak shaving, and backup power that reduces cost and increases resilience.
      specific_value_streams:
        - Capacity market revenue (storage as dispatchable resource)
        - Ancillary services revenue (frequency regulation, spinning reserve)
        - Energy arbitrage revenue (buy low, sell high)
        - Demand charge reduction value (sold as service to commercial customers)
        - Behind-the-meter storage as a service subscription
        - Software & optimization platform subscription
```

---

### Sector: Mining & Materials

```yaml
sector:
  id: mining_and_materials
  label: Mining & Materials
  sector_common_value_streams:
    - Commodity mineral or material sale (spot or contract)
    - Long-term offtake agreement revenue
    - Streaming & royalty agreement income
    - By-product metal or mineral sale
    - Processing & toll treatment fee
    - Premium for certified or responsibly sourced material

  sub_industries:

    - id: metal_ore_mining
      label: Metal Ore Mining
      value_proposition: Supply of metal concentrates and refined metals essential for manufacturing, construction, and technology.
      specific_value_streams:
        - Ore concentrate sale (copper, gold, iron, lithium, etc.)
        - Refined metal sale (where integrated smelting exists)
        - By-product recovery revenue (silver from copper, etc.)
        - Streaming agreement income (royalty on future production)
        - Critical mineral premium (lithium, cobalt, rare earths for EV/tech)
        - Long-term offtake contract revenue

    - id: non_metallic_mineral_mining
      label: Non-Metallic Mineral Mining
      value_proposition: Essential construction aggregates and industrial minerals at scale and proximity to demand.
      specific_value_streams:
        - Aggregate sale (crushed stone, sand, gravel by ton)
        - Industrial mineral sale (potash, phosphate, silica)
        - Location premium (proximity to construction markets)
        - Long-term supply contract with construction or industrial buyers
        - Recycled aggregate premium (sustainability)

    - id: steel_and_metals_production
      label: Steel & Metals Production
      value_proposition: Structural and specialty metals that form the physical backbone of construction, manufacturing, and infrastructure.
      specific_value_streams:
        - Standard steel product sale (sheet, coil, bar, beam)
        - Specialty & high-strength steel premium
        - Aluminum, copper, and non-ferrous product sale
        - Value-added processing revenue (cutting, forming, coating)
        - Long-term supply contract with OEM or construction buyers
        - Scrap & recycled content premium

    - id: chemicals_and_specialty_materials
      label: Chemicals & Specialty Materials
      value_proposition: Enabling inputs that confer performance, functionality, or cost advantage in downstream products.
      specific_value_streams:
        - Commodity chemical sale (bulk volume pricing)
        - Specialty chemical premium (performance, purity, formulation)
        - Long-term supply agreement revenue
        - Contract manufacturing & toll processing fee
        - Technical service & application development fee
        - IP licensing of proprietary formulations

    - id: plastics_and_rubber
      label: Plastics & Rubber
      value_proposition: Lightweight, formable materials that replace heavier or more expensive alternatives.
      specific_value_streams:
        - Resin & compound sale
        - Molded or extruded part sale
        - Custom compounding & formulation premium
        - Recycled content / sustainability premium
        - Long-term supply contract with OEM

    - id: glass_and_ceramics
      label: Glass & Ceramics
      value_proposition: Inert, durable, and optically or thermally superior materials for construction, packaging, and technical applications.
      specific_value_streams:
        - Flat glass & architectural glass sale
        - Container & packaging glass sale
        - Technical & specialty glass premium (display, optical, fiber)
        - Ceramic component sale (industrial, medical)
        - Custom specification premium

    - id: lumber_and_building_materials
      label: Lumber & Building Materials
      value_proposition: Structural and finish materials that enable construction at scale.
      specific_value_streams:
        - Dimensional lumber sale (commodity)
        - Engineered wood product sale (LVL, I-joist, CLT — premium)
        - Building product sale (panels, siding, roofing)
        - Value-added processing (cutting to length, treating, prefab)
        - Long-term supply agreement with homebuilders or distributors

    - id: textiles_and_fiber_materials
      label: Textiles & Fiber Materials
      value_proposition: Performance, comfort, and aesthetic properties in fabric and fiber form.
      specific_value_streams:
        - Commodity fabric & yarn sale
        - Technical textile premium (moisture-wicking, flame-resistant, medical)
        - Sustainable / organic fiber certification premium
        - Private label manufacturing for apparel brands
        - Long-term supply contract with apparel manufacturers
```

---

### Sector: Manufacturing

```yaml
sector:
  id: manufacturing
  label: Manufacturing
  sector_common_value_streams:
    - Product sale (unit price × volume)
    - Premium for brand, performance, or specification
    - Aftermarket parts & consumables revenue
    - Service & maintenance contract revenue
    - Licensing of technology or manufacturing process
    - Contract / OEM manufacturing revenue
    - Financing & leasing of manufactured products

  sub_industries:

    - id: automotive_manufacturing
      label: Automotive Manufacturing
      value_proposition: Personal and commercial transportation; safety, performance, status, and total cost of ownership.
      specific_value_streams:
        - New vehicle sale (MSRP / dealer margin model)
        - Fleet & commercial vehicle sale
        - EV and powertrain technology premium
        - Aftermarket parts & accessories
        - Extended warranty & service contract
        - Financing & leasing income (captive finance arm)
        - Software & connected vehicle subscription (emerging)
        - Licensing of powertrain or autonomous technology

    - id: aerospace_and_defense_manufacturing
      label: Aerospace & Defense Manufacturing
      value_proposition: Mission-critical performance, safety, and national security capability where failure is not an option.
      specific_value_streams:
        - Prime contract revenue (government programs)
        - Subcontract revenue (tier 1/2 supplier)
        - Aftermarket & MRO parts revenue (very high margin)
        - Upgrade & modification program revenue
        - Sustainment & long-term support contract
        - Technology licensing & IP monetization
        - Commercial aviation product sale

    - id: electronics_and_semiconductors
      label: Electronics & Semiconductors
      value_proposition: Enabling technology that makes other products smarter, faster, or more capable.
      specific_value_streams:
        - Chip / component sale (ASP × volume)
        - IP licensing & royalty income
        - Design win revenue (long-tail supply relationship)
        - EMS / contract manufacturing revenue
        - Software & firmware bundled with hardware
        - Reference design & engineering service fee
        - Premium for advanced node or specialty process

    - id: industrial_machinery_and_equipment
      label: Industrial Machinery & Equipment
      value_proposition: Productivity, uptime, and output quality in industrial operations.
      specific_value_streams:
        - Capital equipment sale
        - Aftermarket parts & consumables (recurring, high margin)
        - Service & maintenance contract
        - Equipment financing & leasing income
        - Upgrade & retrofitting revenue
        - Remote monitoring & predictive maintenance subscription

    - id: consumer_goods_manufacturing
      label: Consumer Goods Manufacturing
      value_proposition: Functional utility, convenience, or lifestyle expression at an accessible price point.
      specific_value_streams:
        - Branded consumer product sale (retail channel)
        - Private label manufacturing revenue
        - Direct-to-consumer channel revenue
        - Extended warranty & protection plan
        - Accessories & consumable parts
        - Brand licensing income

    - id: apparel_and_footwear
      label: Apparel & Footwear
      value_proposition: Identity, performance, comfort, and self-expression through what people wear.
      specific_value_streams:
        - Branded wholesale sale (to retailers)
        - Direct-to-consumer (DTC) retail & e-commerce
        - Licensed brand & collaboration revenue
        - Premium performance product tier
        - Resale & secondary market participation (emerging)
        - Rental & subscription model (emerging)

    - id: medical_devices_and_equipment
      label: Medical Devices & Equipment
      value_proposition: Clinical outcomes, patient safety, and procedural efficiency — with regulatory-backed proof of efficacy.
      specific_value_streams:
        - Capital equipment sale (hospital & clinic)
        - Disposable & single-use consumable revenue (recurring, sticky)
        - Service & maintenance contract
        - Software & data analytics subscription
        - Per-procedure or reagent-based revenue model
        - Reimbursement-driven pricing (tied to insurance codes)
        - Technology licensing

    - id: packaging_manufacturing
      label: Packaging Manufacturing
      value_proposition: Product protection, shelf appeal, compliance, and supply chain efficiency.
      specific_value_streams:
        - Standard packaging product sale (commodity)
        - Custom design & specification premium
        - Sustainable / recyclable packaging premium
        - Long-term supply contract with CPG or pharma customers
        - Fulfillment & kitting service revenue

    - id: paper_and_printing
      label: Paper & Printing
      value_proposition: Communication, documentation, and packaging in physical form — increasingly premium and specialized.
      specific_value_streams:
        - Commodity paper & board sale
        - Commercial print job revenue
        - Specialty paper premium (fine, technical, medical)
        - Publication & book printing contract
        - Packaging printing revenue
        - Variable data & personalized print premium

    - id: pharmaceuticals_and_biotech_manufacturing
      label: Pharmaceuticals & Biotech Manufacturing
      value_proposition: Therapeutic outcomes — treating, managing, or curing disease — backed by clinical evidence.
      specific_value_streams:
        - Branded drug sale (innovator price)
        - Generic drug sale (volume / market share model)
        - Biologic & biosimilar product revenue
        - Specialty pharmacy & rare disease premium pricing
        - Licensing of drug compound or technology platform
        - Contract development & manufacturing (CDMO) revenue
        - Government procurement & tender revenue
```

---

### Sector: Construction & Real Estate

```yaml
sector:
  id: construction_and_real_estate
  label: Construction & Real Estate
  sector_common_value_streams:
    - Project contract revenue (design, build, or both)
    - Change order & scope expansion revenue
    - Property sale (developed or improved)
    - Lease & rental income
    - Property management fee
    - Development fee

  sub_industries:

    - id: residential_construction
      label: Residential Construction
      value_proposition: A completed home that meets buyer expectations for quality, location, and value.
      specific_value_streams:
        - Home sale (spec or pre-sold)
        - Lot sale (land-only to custom builders)
        - Custom build contract revenue
        - Upgrade & option revenue (above base spec)
        - Warranty & service plan revenue
        - Rental income (if builder holds homes for rent)

    - id: commercial_industrial_construction
      label: Commercial & Industrial Construction
      value_proposition: Delivered building or facility that meets specification, schedule, and budget.
      specific_value_streams:
        - Fixed-price or GMP contract revenue
        - Design-build contract revenue
        - Construction management fee
        - Change order revenue
        - Specialty construction premium (clean room, data center, hospital)

    - id: infrastructure_and_civil_engineering
      label: Infrastructure & Civil Engineering
      value_proposition: Public or private infrastructure delivered safely, on time, and within regulatory requirements.
      specific_value_streams:
        - Government contract revenue (federal, state, municipal)
        - Design-build-finance-operate (DBFO) concession revenue
        - Toll or user fee revenue (PPP / P3 models)
        - Environmental remediation contract
        - Emergency response & disaster recovery contract

    - id: architecture_and_engineering_design
      label: Architecture & Engineering Design
      value_proposition: Expert design that reduces construction risk, meets code, and delivers the client's vision.
      specific_value_streams:
        - Design fee (percentage of construction cost or fixed)
        - Hourly rate billing
        - Construction administration fee
        - Specialty consulting fee (sustainability, acoustics, historic)
        - Reuse of design / prototype design licensing

    - id: general_contracting_and_trades
      label: General Contracting & Trades
      value_proposition: Reliable execution of specific scopes of work by skilled, licensed professionals.
      specific_value_streams:
        - Project contract or bid revenue
        - Time-and-materials billing
        - Service call & emergency response premium
        - Maintenance contract revenue
        - Material supply markup

    - id: property_development
      label: Property Development
      value_proposition: Transformed land or buildings that create above-market returns through entitlement, development, and timing.
      specific_value_streams:
        - Sale of completed development (condo, commercial, industrial)
        - Stabilized asset sale (to institutional investors)
        - Ongoing lease income (if held)
        - Development management fee
        - Promote / carried interest (in partnership structures)
        - Land sale post-entitlement

    - id: commercial_real_estate
      label: Commercial Real Estate
      value_proposition: A productive, well-located space where businesses can operate effectively.
      specific_value_streams:
        - Base rent income ($/SF/year)
        - Triple net (NNN) lease structure (tenant pays operating expenses)
        - Percentage rent (tied to tenant sales — retail)
        - Parking & amenity fee income
        - Tenant improvement allowance recapture
        - Property sale (stabilized or value-add)
        - Refinancing proceeds (equity recapture)

    - id: residential_real_estate
      label: Residential Real Estate
      value_proposition: A place to live with security of tenure, and a store of value or income-producing asset.
      specific_value_streams:
        - Monthly rent income (residential lease)
        - Property sale gain (appreciation)
        - Agent commission income (buy or sell side)
        - Property management fee income
        - Short-term rental income (vacation rental premium)

    - id: property_management_and_facilities
      label: Property Management & Facilities Services
      value_proposition: Professionally operated properties that retain value, maintain tenant relationships, and minimize owner headaches.
      specific_value_streams:
        - Management fee (percentage of rent collected)
        - Leasing commission
        - Maintenance & repair markup
        - Construction supervision fee
        - Consulting & advisory fee
```

---

### Sector: Transportation & Logistics

```yaml
sector:
  id: transportation_and_logistics
  label: Transportation & Logistics
  sector_common_value_streams:
    - Freight or passenger transport fee
    - Fuel surcharge revenue
    - Storage & handling fee
    - Premium speed or service tier
    - Logistics management fee
    - Technology platform access fee

  sub_industries:

    - id: trucking_and_freight
      label: Trucking & Freight
      value_proposition: Reliable, time-definite movement of goods from origin to destination.
      specific_value_streams:
        - Linehaul rate revenue (per mile or per shipment)
        - Fuel surcharge revenue
        - Accessorial fees (liftgate, residential, hazmat, detention)
        - Expedited & time-critical premium
        - Dedicated contract carriage fee
        - Freight brokerage fee (asset-light model)
        - Last-mile premium

    - id: rail_freight
      label: Rail Freight
      value_proposition: High-volume, low-cost movement of bulk commodities or intermodal containers over long distances.
      specific_value_streams:
        - Freight rate revenue (carload or intermodal)
        - Fuel surcharge
        - Demurrage & car hire fees
        - Intermodal premium (double-stack efficiency)
        - Bulk commodity contract revenue
        - Terminal & drayage fee

    - id: air_cargo
      label: Air Cargo
      value_proposition: Speed and global reach for high-value, time-sensitive shipments.
      specific_value_streams:
        - Air freight rate revenue (per kg or per shipment)
        - Fuel & security surcharges
        - Express & next-flight-out premium
        - Dangerous goods & special handling premium
        - Charter revenue
        - Customs brokerage & clearance fee

    - id: ocean_and_inland_shipping
      label: Ocean & Inland Shipping
      value_proposition: Lowest cost-per-ton movement of large volumes over long distances.
      specific_value_streams:
        - Ocean freight rate revenue (spot or contract)
        - Fuel surcharge (bunker adjustment factor)
        - Container demurrage & detention fees
        - Port & terminal handling fee
        - Charter hire income
        - Inland waterway transport fee

    - id: passenger_airlines
      label: Passenger Airlines
      value_proposition: Point-to-point travel that compresses distance and enables global movement of people.
      specific_value_streams:
        - Base ticket fare revenue
        - Ancillary fee revenue (bags, seat selection, upgrades, meals)
        - Loyalty program & miles sale to partners (very high margin)
        - Cargo hold revenue
        - Charter revenue
        - Codeshare & interline revenue
        - Premium cabin (business/first) fare premium

    - id: rail_and_bus_transit
      label: Rail & Bus Transit
      value_proposition: Affordable, reliable mobility for daily commuters and urban populations.
      specific_value_streams:
        - Fare box revenue (passenger fares)
        - Government subsidy & operating grant
        - Advertising revenue (station, vehicle)
        - Naming rights & sponsorship
        - Real estate & development income (transit-oriented development)
        - Charter & special event service premium

    - id: last_mile_delivery
      label: Last-Mile Delivery
      value_proposition: Doorstep delivery speed and convenience that enables e-commerce.
      specific_value_streams:
        - Per-parcel delivery fee
        - Speed premium (same-day, next-day)
        - Subscription delivery program revenue
        - Returns handling fee
        - Proof-of-delivery & signature service premium
        - White-glove & installation premium

    - id: warehousing_and_fulfillment
      label: Warehousing & Fulfillment
      value_proposition: Inventory proximity to customers and order accuracy that powers commerce.
      specific_value_streams:
        - Storage fee (per pallet, per sq ft, per unit)
        - Pick & pack fee (per order)
        - Receiving & inbound handling fee
        - Value-added services (kitting, labeling, returns processing)
        - Fulfillment management fee (3PL model)
        - Technology & WMS access fee

    - id: supply_chain_management
      label: Supply Chain Management
      value_proposition: End-to-end visibility, resilience, and cost optimization across complex supply networks.
      specific_value_streams:
        - Consulting & advisory fee
        - Technology platform subscription
        - Managed service fee (outsourced supply chain function)
        - Freight brokerage margin
        - Procurement optimization savings share

    - id: courier_and_postal_services
      label: Courier & Postal Services
      value_proposition: Reliable document and small parcel movement with tracked delivery confirmation.
      specific_value_streams:
        - Per-piece delivery fee
        - Express & overnight premium
        - International delivery fee
        - Certified & signature-required premium
        - Bulk mail & presort discount programs (sold to volume mailers)
        - PO box & mailbox rental income

    - id: port_operations
      label: Port Operations
      value_proposition: Gateway infrastructure that enables global trade — the node where ocean and land networks connect.
      specific_value_streams:
        - Terminal handling charge (per container)
        - Vessel docking & port dues
        - Stevedoring & labor service fee
        - Storage & demurrage income
        - Value-added logistics fee (cross-docking, stuffing/stripping)
        - Real estate lease income (port land to logistics operators)
```

---

### Sector: Retail & Wholesale Trade

```yaml
sector:
  id: retail_and_wholesale_trade
  label: Retail & Wholesale Trade
  sector_common_value_streams:
    - Product sale margin (retail price minus COGS)
    - Private label product margin (higher than branded)
    - Advertising & vendor marketing revenue
    - Financial product & credit revenue
    - Loyalty program monetization
    - Membership & subscription revenue
    - Data & shopper insight monetization

  sub_industries:

    - id: grocery_and_food_retail
      label: Grocery & Food Retail
      value_proposition: Convenient access to food and household essentials at a trusted price and quality.
      specific_value_streams:
        - Product sale margin (branded)
        - Private label product margin (premium margin)
        - Vendor slotting & promotional allowance income
        - Pharmacy dispensing revenue (where applicable)
        - Fuel station margin (large grocers)
        - Loyalty program data monetization
        - Financial services (store credit card income)
        - Prepared food & deli margin (higher than packaged)

    - id: general_merchandise_and_department_stores
      label: General Merchandise & Department Stores
      value_proposition: Wide assortment under one roof with the convenience of a single shopping trip.
      specific_value_streams:
        - Product sale margin across categories
        - Private label margin
        - Credit card & financial product income
        - Vendor marketing & cooperative advertising income
        - Loyalty program revenue

    - id: specialty_retail
      label: Specialty Retail
      value_proposition: Curated selection, expertise, and brand experience that commands a premium over mass retail.
      specific_value_streams:
        - Product sale margin (often higher than mass market)
        - Store brand or exclusive product margin
        - Repair & service revenue
        - Expert consultation & fitting fee (implicit or explicit)
        - Event & experience revenue

    - id: auto_dealers_and_parts
      label: Auto Dealers & Parts
      value_proposition: Vehicle access, trade-in simplicity, and total ownership support in one location.
      specific_value_streams:
        - New vehicle sale gross profit (front-end)
        - Used vehicle sale margin (often higher than new)
        - Finance & insurance (F&I) product income (very high margin)
        - Service & repair revenue (parts + labor)
        - Parts counter sales
        - Warranty & recall reimbursement from OEM

    - id: ecommerce
      label: E-Commerce
      value_proposition: Unlimited selection, price transparency, and home delivery without friction.
      specific_value_streams:
        - Product sale margin (first-party)
        - Marketplace take-rate / commission (third-party sellers)
        - Fulfillment fee income (logistics service to sellers)
        - Advertising & sponsored listing revenue
        - Subscription program revenue (free shipping, exclusive access)
        - Data & audience monetization
        - Private label margin

    - id: wholesale_distribution
      label: Wholesale Distribution
      value_proposition: Product availability, credit terms, and logistics that small buyers cannot access directly from manufacturers.
      specific_value_streams:
        - Product sale margin (distributor markup)
        - Volume rebate income from manufacturers
        - Freight & handling surcharge
        - Private label or house brand margin
        - Value-added service fee (kitting, label printing, special pack)
        - Financing & extended credit terms as a value-add (implicit)

    - id: convenience_and_drug_stores
      label: Convenience & Drug Stores
      value_proposition: Immediate access to essentials with minimal time investment — proximity and speed are the product.
      specific_value_streams:
        - Product sale margin (convenience premium over grocery)
        - Pharmacy dispensing fee & drug margin
        - Fuel margin (convenience stores)
        - Lottery & financial services transaction fee
        - Tobacco & restricted product margin
        - Private label margin

    - id: luxury_goods_retail
      label: Luxury Goods Retail
      value_proposition: Exclusivity, craftsmanship, heritage, and social signaling — price is a feature, not a barrier.
      specific_value_streams:
        - Premium product sale margin (high absolute gross profit)
        - Made-to-order & bespoke premium
        - Repair & restoration service revenue
        - Brand experience & event revenue
        - Secondary market authentication & resale revenue
        - Brand licensing income
```

---

### Sector: Finance & Insurance

```yaml
sector:
  id: finance_and_insurance
  label: Finance & Insurance
  sector_common_value_streams:
    - Interest income (spread between cost of funds and yield)
    - Fee income (transactional or advisory)
    - Premium income (insurance)
    - Trading & investment gain
    - Asset management fee
    - Commission income

  sub_industries:

    - id: commercial_and_retail_banking
      label: Commercial & Retail Banking
      value_proposition: Safe custody of deposits, access to credit, and financial infrastructure for individuals and businesses.
      specific_value_streams:
        - Net interest income (NII) — loan yield minus deposit cost
        - Service & account fee income
        - Card interchange & payment fee income
        - Origination & underwriting fee
        - Wealth management & advisory fee
        - Treasury & cash management fee
        - Foreign exchange & trade finance fee
        - Overdraft & penalty fee income

    - id: investment_banking_and_capital_markets
      label: Investment Banking & Capital Markets
      value_proposition: Access to capital markets, strategic advice, and liquidity for institutions and corporations.
      specific_value_streams:
        - M&A advisory fee
        - Underwriting fee (equity & debt issuance)
        - Trading revenue (bid-ask spread, proprietary)
        - Prime brokerage fee
        - Research subscription & commission
        - Restructuring advisory fee
        - Derivatives & structured product fee

    - id: asset_and_wealth_management
      label: Asset & Wealth Management
      value_proposition: Professionally managed growth and preservation of wealth over time.
      specific_value_streams:
        - AUM-based management fee (basis points on assets)
        - Performance fee / carried interest
        - Financial planning & advisory fee
        - Custodial & administrative fee
        - Fund distribution fee (12b-1)
        - Separately managed account (SMA) fee

    - id: venture_capital_and_private_equity
      label: Venture Capital & Private Equity
      value_proposition: Capital, expertise, and networks that accelerate growth or transform businesses.
      specific_value_streams:
        - Management fee (% of committed or invested capital)
        - Carried interest (share of investment gains)
        - Transaction & monitoring fee (from portfolio companies)
        - Co-investment fee
        - Fund-of-funds fee layer

    - id: insurance
      label: Insurance
      value_proposition: Financial protection against defined risks — converting uncertain large losses into certain small premiums.
      specific_value_streams:
        - Premium income (risk transfer payment from policyholder)
        - Investment income on float (premiums held before claims)
        - Fee income (policy admin, installment billing)
        - Reinsurance recoveries
        - Underwriting profit (premiums minus claims minus expense)

    - id: reinsurance
      label: Reinsurance
      value_proposition: Capacity and stability for primary insurers to write more business by transferring peak risk.
      specific_value_streams:
        - Reinsurance premium income
        - Investment income on float
        - Ceding commission income (in some structures)
        - Catastrophe bond & ILS coupon income

    - id: consumer_lending_and_credit
      label: Consumer Lending & Credit
      value_proposition: Access to credit that enables purchases, education, home ownership, or cash flow management.
      specific_value_streams:
        - Interest income on loans outstanding
        - Origination fee income
        - Late & penalty fee income
        - Credit card interchange income
        - Rewards program partnership income
        - Securitization gain on sale
        - Debt sale recovery income

    - id: payments_and_financial_infrastructure
      label: Payments & Financial Infrastructure
      value_proposition: Seamless, secure movement of money that enables commerce at scale.
      specific_value_streams:
        - Interchange fee income (merchant-funded)
        - Payment processing fee (per transaction)
        - Network access fee (card network model)
        - SaaS / platform subscription (payments software)
        - FX conversion fee
        - Fraud & risk management service fee
        - Data & analytics service fee

    - id: accounting_and_audit
      label: Accounting & Audit
      value_proposition: Financial accuracy, regulatory compliance, and stakeholder trust backed by professional certification.
      specific_value_streams:
        - Audit & assurance fee
        - Tax compliance & preparation fee
        - Advisory & consulting fee
        - Bookkeeping & accounting service fee
        - Payroll service fee

    - id: financial_data_and_analytics
      label: Financial Data & Analytics
      value_proposition: Decision advantage through proprietary data and analytical tools unavailable elsewhere.
      specific_value_streams:
        - Terminal or platform subscription fee
        - Data feed & API license fee
        - Index licensing fee
        - Research & report subscription
        - Custom analytics & advisory fee
        - Benchmark & rating service fee
```

---

### Sector: Healthcare & Life Sciences

```yaml
sector:
  id: healthcare_and_life_sciences
  label: Healthcare & Life Sciences
  sector_common_value_streams:
    - Clinical service fee (per visit, procedure, or episode)
    - Insurance reimbursement income (government & private payer)
    - Product sale (drug, device, supply)
    - Subscription or managed care capitation
    - Licensing & royalty income
    - Research & grant income

  sub_industries:

    - id: hospitals_and_health_systems
      label: Hospitals & Health Systems
      value_proposition: Acute care, complex procedures, and 24/7 clinical capability that cannot be provided in a lower-acuity setting.
      specific_value_streams:
        - Inpatient admission revenue (DRG-based reimbursement)
        - Outpatient & surgical procedure revenue
        - Emergency department revenue
        - Physician & professional service fee
        - Pharmacy dispensing revenue
        - Imaging & diagnostic revenue
        - Graduate medical education (GME) funding
        - Research grant income
        - Retail health & ambulatory service revenue

    - id: physician_and_specialist_practices
      label: Physician & Specialist Practices
      value_proposition: Expert clinical judgment, diagnosis, and treatment from a licensed specialist.
      specific_value_streams:
        - Office visit & consultation fee (E&M billing)
        - Procedure & surgical fee
        - Ancillary service revenue (imaging, lab in-house)
        - Telemedicine visit fee
        - Concierge / direct primary care subscription
        - Expert witness & consulting fee

    - id: outpatient_and_ambulatory_care
      label: Outpatient & Ambulatory Care
      value_proposition: Accessible, convenient care at lower cost than hospital-based settings.
      specific_value_streams:
        - Procedure & visit fee (lower cost code than hospital)
        - Imaging & diagnostic service revenue
        - Physical & occupational therapy billing
        - Infusion & medication administration fee
        - Ancillary testing revenue

    - id: mental_health_services
      label: Mental Health Services
      value_proposition: Treatment for behavioral health conditions that improves function, relationships, and quality of life.
      specific_value_streams:
        - Therapy session fee (per session billing)
        - Psychiatric evaluation & medication management fee
        - Intensive outpatient program (IOP) revenue
        - Employee assistance program (EAP) contract revenue
        - Telehealth session fee
        - Substance use disorder treatment reimbursement

    - id: home_health_and_long_term_care
      label: Home Health & Long-Term Care
      value_proposition: Care delivered where patients live — enabling independence and reducing institutionalization cost.
      specific_value_streams:
        - Medicare & Medicaid episode or per diem reimbursement
        - Private pay rate (above government rates)
        - Long-term care insurance reimbursement
        - Skilled nursing facility (SNF) daily rate
        - Home health aide visit fee
        - Hospice per diem revenue

    - id: dental_and_vision_services
      label: Dental & Vision Services
      value_proposition: Preventive and restorative oral and visual health care, often outside traditional medical insurance.
      specific_value_streams:
        - Preventive procedure revenue (exam, cleaning, vision test)
        - Restorative & cosmetic procedure revenue (high out-of-pocket)
        - Insurance reimbursement (dental / vision benefits)
        - Eyewear & contact lens product sale (optical retail)
        - Whitening & elective cosmetic premium
        - Membership plan / in-house discount plan subscription

    - id: pharmaceuticals_and_drug_development
      label: Pharmaceuticals & Drug Development
      value_proposition: Therapeutic outcomes backed by clinical evidence and regulatory approval.
      specific_value_streams:
        - Branded drug sale (innovator pricing)
        - Government & PBM contract pricing (net of rebates)
        - Licensing of drug compound or platform technology
        - Milestone payments from licensing or partnership deals
        - Royalty income on out-licensed drugs
        - Generic entry revenue (first-to-file exclusivity)
        - OTC product sale (consumer health)

    - id: biotechnology
      label: Biotechnology
      value_proposition: Breakthrough therapies, diagnostics, or tools derived from biological systems.
      specific_value_streams:
        - Drug or biologic product sale
        - Technology platform licensing fee
        - Research collaboration & milestone payment
        - Royalty stream on commercialized IP
        - Grant & non-dilutive funding income
        - Research tool & reagent sale

    - id: medical_diagnostics_and_labs
      label: Medical Diagnostics & Labs
      value_proposition: Accurate, fast test results that inform clinical decisions and drive better outcomes.
      specific_value_streams:
        - Per-test revenue (fee-for-service billing)
        - Insurance & Medicare/Medicaid reimbursement
        - Direct-to-consumer test revenue (consumer genetics, wellness)
        - Laboratory information system (LIS) platform fee
        - Reference lab & send-out testing revenue
        - Contract research & clinical trial testing revenue

    - id: health_insurance_and_managed_care
      label: Health Insurance & Managed Care
      value_proposition: Financial protection against health costs and access to a network of care.
      specific_value_streams:
        - Premium revenue (employer & individual)
        - Government program revenue (Medicare Advantage, Medicaid managed care capitation)
        - Risk adjustment & quality bonus income
        - Pharmacy benefit management (PBM) spread & rebate income
        - Administrative service fee (self-insured employer plans)
        - Specialty benefit management revenue
```

---

### Sector: Education

```yaml
sector:
  id: education
  label: Education
  sector_common_value_streams:
    - Tuition & enrollment fee
    - Government funding & subsidy
    - Grant & philanthropic income
    - Ancillary service revenue (housing, food, activities)
    - Licensing of curriculum or content
    - Placement & outcome-based fee

  sub_industries:

    - id: k12_education
      label: K–12 Education
      value_proposition: Foundational academic and social development that prepares children for adult life.
      specific_value_streams:
        - Public funding (per-pupil government allocation)
        - Tuition (private & independent schools)
        - Fees (activity, technology, athletics)
        - Fundraising & annual giving
        - Endowment distribution income
        - Extended care & after-school program revenue
        - Food service program revenue
        - Facility rental income (evenings, weekends)

    - id: higher_education
      label: Higher Education
      value_proposition: Credentialed expertise, career access, and intellectual development that commands a lifetime earnings premium.
      specific_value_streams:
        - Undergraduate & graduate tuition
        - Room & board revenue
        - Government research grant income
        - Private research contract & industry partnership income
        - Endowment income & fundraising
        - Alumni giving
        - Technology transfer & IP licensing income
        - Continuing education & professional development revenue
        - Athletics & licensing revenue

    - id: vocational_and_trade_training
      label: Vocational & Trade Training
      value_proposition: Job-ready skills that lead to measurable employment outcomes.
      specific_value_streams:
        - Tuition & enrollment fee
        - Government workforce development funding
        - Employer-sponsored training contract
        - Apprenticeship program fee
        - Certification & testing fee

    - id: early_childhood_and_childcare
      label: Early Childhood & Childcare
      value_proposition: Safe, nurturing, and developmentally appropriate care that enables parents to work.
      specific_value_streams:
        - Tuition & weekly care fee
        - Government subsidy (childcare vouchers, Head Start)
        - Employer-sponsored backup care contract
        - Extended hours & drop-in care premium
        - Summer camp & enrichment program revenue

    - id: online_and_continuing_education
      label: Online & Continuing Education
      value_proposition: Flexible, accessible learning that fits around work and life — at lower cost than campus programs.
      specific_value_streams:
        - Course or program enrollment fee
        - Subscription learning platform fee
        - Certificate & credential fee (verifiable outcome)
        - Corporate licensing of content library
        - Bootcamp & intensive program premium
        - Income share agreement (ISA) model

    - id: test_prep_and_tutoring
      label: Test Prep & Tutoring
      value_proposition: Measurable score improvement or grade outcomes with high personal stakes for the student.
      specific_value_streams:
        - Per-session tutoring fee
        - Course enrollment fee (group or self-paced)
        - Score guarantee program premium
        - Private school & college application consulting fee
        - School / district licensing of prep tools

    - id: corporate_training_and_workforce_development
      label: Corporate Training & Workforce Development
      value_proposition: Measurable skill improvement, compliance assurance, and talent retention for employers.
      specific_value_streams:
        - Per-seat or per-user training fee
        - Enterprise content library license
        - Custom content development fee
        - Learning management system (LMS) subscription
        - Certification & accreditation program fee
        - Training needs assessment consulting fee

    - id: educational_publishing_and_content
      label: Educational Publishing & Content
      value_proposition: Authoritative, curriculum-aligned content that reduces the burden on educators.
      specific_value_streams:
        - Textbook & course material sale
        - Digital platform & access code subscription
        - Institutional site license revenue
        - Custom curriculum development fee
        - Assessment & test item bank licensing
        - Professional educator resource sale
```

---

### Sector: Technology

```yaml
sector:
  id: technology
  label: Technology
  sector_common_value_streams:
    - Software subscription (SaaS / platform)
    - Usage-based or consumption revenue
    - Professional services & implementation fee
    - Data & API monetization
    - Marketplace & ecosystem take-rate
    - Hardware product sale
    - Licensing & royalty income

  sub_industries:

    - id: enterprise_software_saas
      label: Enterprise Software (SaaS)
      value_proposition: Business capability delivered as a continuously improving service — no hardware, no upgrades, predictable cost.
      specific_value_streams:
        - Recurring subscription revenue (ARR / MRR)
        - Seat or user-based pricing
        - Module or feature-tier upsell
        - Professional services & implementation fee
        - Training & certification revenue
        - Partner & marketplace ecosystem fee
        - Usage overage revenue

    - id: consumer_software_and_apps
      label: Consumer Software & Apps
      value_proposition: Utility, entertainment, or connection delivered instantly to any device.
      specific_value_streams:
        - Subscription fee (freemium → paid conversion)
        - In-app purchase revenue
        - Advertising revenue (free tier)
        - Premium tier / ad-free upgrade
        - Virtual goods & digital item sale
        - Content marketplace commission

    - id: cloud_computing_and_infrastructure
      label: Cloud Computing & Infrastructure
      value_proposition: On-demand access to world-class infrastructure with no capital commitment and infinite scalability.
      specific_value_streams:
        - Compute consumption revenue (per vCPU-hour)
        - Storage consumption revenue (per GB)
        - Network & data transfer fee
        - Managed service premium (over raw infrastructure)
        - Support tier subscription
        - Marketplace software listing commission
        - Reserved instance & commitment discount economics

    - id: cybersecurity
      label: Cybersecurity
      value_proposition: Risk reduction and compliance assurance — the cost of not buying is a potential catastrophe.
      specific_value_streams:
        - Software subscription (endpoint, network, identity)
        - Managed detection & response (MDR) service fee
        - Incident response & forensics project fee
        - Penetration testing & assessment fee
        - Compliance & certification advisory fee
        - Threat intelligence feed subscription
        - Professional services & deployment fee

    - id: artificial_intelligence_and_ml
      label: Artificial Intelligence & Machine Learning
      value_proposition: Automation of cognitive tasks and discovery of patterns at a scale and speed impossible for humans.
      specific_value_streams:
        - API call / token consumption revenue
        - Model access subscription
        - Enterprise license (on-premise or dedicated)
        - Fine-tuning & custom model development fee
        - AI application platform subscription
        - Data labeling & annotation service fee
        - Professional services & AI strategy consulting fee

    - id: hardware_and_computing_devices
      label: Hardware & Computing Devices
      value_proposition: Physical capability — compute power, portability, connectivity — that unlocks software value.
      specific_value_streams:
        - Device sale (consumer or enterprise)
        - Accessory & peripheral sale
        - Extended warranty & AppleCare-type plan
        - Trade-in & upgrade program revenue
        - Software & services attach revenue
        - Enterprise volume & deployment contract

    - id: semiconductors_and_chip_design
      label: Semiconductors & Chip Design
      value_proposition: The enabling layer of performance, efficiency, and intelligence in every electronic product.
      specific_value_streams:
        - Chip ASP × volume revenue
        - IP core & architecture licensing
        - Foundry service revenue (IDM model)
        - Royalty income (ARM-style licensing model)
        - Reference design & development kit revenue
        - NRE (non-recurring engineering) fee

    - id: networking_and_telecom_equipment
      label: Networking & Telecom Equipment
      value_proposition: Reliable, high-performance connectivity infrastructure that enables digital operations.
      specific_value_streams:
        - Hardware product sale
        - Software & operating system license
        - Maintenance & support contract (often 15–20% of hardware sale annually)
        - Managed network service fee
        - Upgrade & refresh cycle revenue

    - id: it_services_and_consulting
      label: IT Services & Consulting
      value_proposition: Expertise and execution capacity that organizations cannot cost-effectively maintain internally.
      specific_value_streams:
        - Time-and-materials billing
        - Managed service retainer fee
        - Project-based fixed fee
        - Staff augmentation billing rate
        - Outcome-based or shared savings fee
        - Software resale margin

    - id: data_and_analytics_platforms
      label: Data & Analytics Platforms
      value_proposition: Business intelligence that converts raw data into decisions and competitive advantage.
      specific_value_streams:
        - Platform subscription fee
        - Data consumption / query fee
        - Data marketplace revenue
        - Professional services & implementation
        - Embedded analytics OEM license

    - id: developer_tools_and_platforms
      label: Developer Tools & Platforms
      value_proposition: Productivity and capability multipliers that let developers build faster, better, and more reliably.
      specific_value_streams:
        - Free open-source → enterprise conversion revenue
        - Hosted / cloud version subscription
        - Seat-based IDE or tool license
        - Marketplace extension & plugin commission
        - Training & certification revenue
        - Enterprise support contract
```

---

### Sector: Telecommunications & Media

```yaml
sector:
  id: telecommunications_and_media
  label: Telecommunications & Media
  sector_common_value_streams:
    - Subscription / access fee
    - Usage & consumption revenue
    - Advertising revenue
    - Content licensing & syndication
    - Data & audience monetization
    - Wholesale network access fee

  sub_industries:

    - id: wireless_carriers
      label: Wireless Carriers
      value_proposition: Ubiquitous connectivity — voice, data, and messaging — wherever the customer goes.
      specific_value_streams:
        - Postpaid plan subscription revenue
        - Prepaid plan revenue
        - Device financing income
        - Roaming revenue
        - Enterprise & IoT connectivity contract
        - Spectrum & infrastructure leasing income
        - MVNO wholesale revenue

    - id: broadband_and_isps
      label: Broadband & ISPs
      value_proposition: Fast, reliable home or business internet — the essential utility of the digital age.
      specific_value_streams:
        - Monthly broadband subscription fee
        - Speed tier upsell (gigabit premium)
        - Equipment rental fee (modem/router)
        - Business & enterprise connectivity contract
        - Managed Wi-Fi & network service fee
        - Government subsidy income (rural broadband programs)

    - id: cable_and_satellite_tv
      label: Cable & Satellite TV
      value_proposition: Live television, sports, and local news bundled with internet access.
      specific_value_streams:
        - Pay-TV subscription revenue (declining)
        - Broadband bundled subscription
        - Premium channel add-on fee (HBO, sports packages)
        - Equipment rental fee
        - Advertising revenue (linear TV)
        - Video-on-demand & pay-per-view revenue

    - id: streaming_and_digital_media
      label: Streaming & Digital Media
      value_proposition: On-demand access to entertainment without schedules, ads, or physical media.
      specific_value_streams:
        - Streaming subscription fee (ad-free tier)
        - Ad-supported free or lower-cost tier revenue
        - Premium or 4K tier upsell
        - Live streaming & event pay-per-view
        - Content licensing & syndication income
        - Merchandise & fan product revenue

    - id: broadcast_television_and_radio
      label: Broadcast Television & Radio
      value_proposition: Free, over-the-air content reaching mass audiences — funded by advertising.
      specific_value_streams:
        - Advertising spot revenue (national & local)
        - Retransmission consent fee (paid by cable/satellite)
        - Syndication licensing income
        - Digital & streaming extension revenue
        - Event & sponsorship activation revenue

    - id: publishing
      label: Publishing
      value_proposition: Authoritative, curated content — information, narrative, or analysis — in trusted editorial form.
      specific_value_streams:
        - Book & periodical sale (physical & digital)
        - Digital subscription revenue
        - Institutional library license
        - Advertising revenue (magazines, newspapers)
        - Rights & translation licensing income
        - Sponsored content & branded partnership revenue

    - id: film_and_television_production
      label: Film & Television Production
      value_proposition: Compelling stories that audiences pay to experience and platforms pay to own.
      specific_value_streams:
        - Theatrical box office revenue
        - Streaming rights license fee
        - Home video / transactional VOD revenue
        - International rights sale
        - Merchandising & licensing royalty
        - Sequel, franchise & universe extension revenue
        - Tax credit & co-production incentive income

    - id: music_and_audio
      label: Music & Audio
      value_proposition: Emotional connection, identity expression, and cultural experience through sound.
      specific_value_streams:
        - Streaming royalty income (per stream)
        - Sync licensing fee (TV, film, advertising)
        - Live performance & touring revenue
        - Physical & digital album sale
        - Merchandise & brand partnership income
        - Master & publishing rights sale or licensing
        - Podcast sponsorship & advertising revenue

    - id: video_games_and_interactive_entertainment
      label: Video Games & Interactive Entertainment
      value_proposition: Interactive entertainment that offers agency, challenge, community, and ongoing novelty.
      specific_value_streams:
        - Game title sale (premium model)
        - In-game purchase & microtransaction revenue
        - Battle pass & season subscription revenue
        - DLC & expansion pack sale
        - Advertising revenue (free-to-play model)
        - Platform & storefront commission income
        - Esports event & media revenue
        - IP licensing (film, merchandise)

    - id: advertising_and_marketing_services
      label: Advertising & Marketing Services
      value_proposition: Measurable audience reach, brand building, and revenue growth for clients.
      specific_value_streams:
        - Retainer fee (ongoing agency relationship)
        - Project fee (campaign, rebrand, launch)
        - Media buying commission or markup
        - Performance marketing fee (tied to outcomes)
        - Creative production fee
        - Data & analytics consulting fee
        - PR & earned media fee

    - id: social_media_platforms
      label: Social Media Platforms
      value_proposition: Connection, self-expression, entertainment, and community at global scale — free for users, funded by advertisers.
      specific_value_streams:
        - Advertising revenue (dominant — CPM, CPC, CPA)
        - Subscription / verification tier revenue
        - Commerce & marketplace take-rate
        - Creator monetization program fee
        - Data licensing & API access fee
        - Virtual goods & gifting revenue
```

---

### Sector: Professional & Business Services

```yaml
sector:
  id: professional_and_business_services
  label: Professional & Business Services
  sector_common_value_streams:
    - Professional fee (time-based or fixed)
    - Retainer & ongoing advisory fee
    - Project & engagement revenue
    - Contingency or success fee
    - Platform or software access fee
    - Training & certification revenue

  sub_industries:

    - id: management_consulting
      label: Management Consulting
      value_proposition: Strategic clarity, implementation capability, and outside perspective at critical decision points.
      specific_value_streams:
        - Time-and-materials fee (blended rate × hours)
        - Fixed-price engagement fee
        - Success or performance-based fee
        - Retainer / ongoing advisory fee
        - Technology implementation fee (strategy-to-execution)
        - Proprietary benchmark & data product revenue

    - id: legal_services
      label: Legal Services
      value_proposition: Risk reduction, rights protection, and compliance assurance backed by professional privilege.
      specific_value_streams:
        - Hourly billing rate
        - Flat fee (transactional matters)
        - Contingency fee (percentage of recovery)
        - Retainer fee (standing advisory relationship)
        - Success fee (M&A, capital markets)
        - Court & filing fee recovery

    - id: staffing_and_recruitment
      label: Staffing & Recruitment
      value_proposition: Access to pre-screened talent, rapidly and without the burden of direct employment.
      specific_value_streams:
        - Temporary staffing markup (bill rate minus pay rate)
        - Permanent placement fee (% of first-year salary)
        - Executive search retained fee
        - Managed services provider (MSP) fee
        - Contract-to-hire conversion fee
        - RPO (recruitment process outsourcing) fee

    - id: marketing_and_pr_agencies
      label: Marketing & PR Agencies
      value_proposition: Creative and strategic capability that drives brand growth and business outcomes.
      specific_value_streams:
        - Monthly retainer fee
        - Project or campaign fee
        - Media commission or markup on spend
        - Performance-based or incentive fee
        - Production markup
        - Licensing of proprietary methodology or tool

    - id: research_and_market_intelligence
      label: Research & Market Intelligence
      value_proposition: Proprietary insight and data that reduces uncertainty in high-stakes decisions.
      specific_value_streams:
        - Syndicated report sale
        - Annual subscription to data platform
        - Custom research project fee
        - Advisory & analyst access subscription
        - Conference & event revenue
        - Licensing of data or index to third parties

    - id: human_resources_services
      label: Human Resources Services
      value_proposition: Compliance, efficiency, and talent outcomes without the overhead of full in-house HR.
      specific_value_streams:
        - HRIS platform subscription fee
        - Payroll processing fee (per employee per month)
        - Benefits administration fee
        - Compliance advisory retainer
        - HR consulting project fee
        - Training content license

    - id: facilities_management_and_cleaning
      label: Facilities Management & Cleaning
      value_proposition: A clean, functional, and compliant environment that lets occupants focus on their core work.
      specific_value_streams:
        - Fixed monthly service contract
        - Per-square-foot or per-visit billing
        - Specialty cleaning project fee (post-construction, remediation)
        - Integrated facilities management contract (bundled services)

    - id: security_services
      label: Security Services
      value_proposition: Deterrence, detection, and response to physical threats — protecting people, assets, and premises.
      specific_value_streams:
        - Guarding contract (per hour or fixed monthly)
        - Alarm monitoring subscription fee
        - Security technology installation project fee
        - Investigation & consulting fee
        - Event security project fee
```

---

### Sector: Hospitality & Food Service

```yaml
sector:
  id: hospitality_and_food_service
  label: Hospitality & Food Service
  sector_common_value_streams:
    - Room, table, or venue revenue (core transaction)
    - Food & beverage sale margin
    - Ancillary & add-on revenue
    - Event & group revenue
    - Loyalty & membership revenue
    - Distribution channel premium vs. OTA rate

  sub_industries:

    - id: hotels_and_lodging
      label: Hotels & Lodging
      value_proposition: A comfortable, reliable, and safe place to sleep when away from home — with the amenities of modern life.
      specific_value_streams:
        - Room revenue (ADR × occupancy)
        - Food & beverage outlet revenue
        - Meeting & event space rental
        - Spa & recreation revenue
        - Parking revenue
        - Loyalty redemption (funded by partner banks)
        - OTA vs. direct booking channel mix revenue
        - Resort & destination fee income

    - id: restaurants_and_fast_food
      label: Restaurants & Fast Food
      value_proposition: Prepared food and an experience (convenience, comfort, celebration) that customers value above home cooking.
      specific_value_streams:
        - Dine-in cover revenue
        - Takeout & carry-out revenue
        - Delivery platform revenue (third-party and first-party)
        - Catering & group order revenue
        - Alcohol & beverage margin (higher than food)
        - Private dining & event revenue
        - Franchise royalty income (for franchisors)
        - Merchandise & branded product revenue

    - id: bars_and_nightlife
      label: Bars & Nightlife
      value_proposition: Social experience, entertainment, and a venue for gathering — with alcohol as the enabler.
      specific_value_streams:
        - Beverage sale margin (alcohol)
        - Cover charge & entry fee
        - VIP table & bottle service premium
        - Private event rental revenue
        - Ticket & event revenue
        - Merchandise revenue

    - id: catering
      label: Catering
      value_proposition: High-quality food and service delivered to any location for any occasion.
      specific_value_streams:
        - Per-person catering contract revenue
        - Event coordination & service fee
        - Bar & beverage revenue
        - Equipment rental income
        - Gratuity & service charge income

    - id: event_venues
      label: Event Venues
      value_proposition: A flexible, equipped, and memorable space that brings events to life.
      specific_value_streams:
        - Venue rental fee (hourly, daily, per-event)
        - Exclusive catering & beverage contract revenue
        - AV & production service revenue
        - Accommodation block revenue (where attached to hotel)
        - Sponsorship & naming rights income

    - id: cruise_lines
      label: Cruise Lines
      value_proposition: An all-inclusive mobile resort that brings the destination to the passenger.
      specific_value_streams:
        - Cruise fare revenue (ticket price)
        - Onboard spending (beverage packages, spa, casino, specialty dining)
        - Shore excursion revenue
        - Air & pre/post cruise package revenue
        - Beverage & drinks package upsell
        - Wi-Fi & connectivity revenue
        - Loyalty program upgrade revenue

    - id: short_term_rentals
      label: Short-Term Rentals
      value_proposition: Home-like space with local character at a price point that hotel rooms cannot match for groups or longer stays.
      specific_value_streams:
        - Nightly rental rate revenue
        - Cleaning fee income
        - Premium for unique or distinctive property
        - Long-stay & monthly rate discount (occupancy trade-off)
        - Co-hosting income (managing others' properties)
        - Guest experience & add-on upsell (experiences, grocery delivery)
```

---

### Sector: Travel & Tourism

```yaml
sector:
  id: travel_and_tourism
  label: Travel & Tourism
  sector_common_value_streams:
    - Trip & package sale revenue
    - Commission & referral income from suppliers
    - Ancillary & upsell revenue
    - Membership & loyalty program revenue
    - Destination experience revenue

  sub_industries:

    - id: travel_agencies_and_booking_platforms
      label: Travel Agencies & Booking Platforms
      value_proposition: Curated choice, price transparency, and booking simplicity that saves time and reduces decision anxiety.
      specific_value_streams:
        - Supplier commission income (% of booking)
        - Booking fee (consumer-paid)
        - Advertising & sponsored placement revenue
        - Override & volume bonus from suppliers
        - Package margin (dynamic packaging markup)
        - Data & travel intelligence licensing
        - Financial product commission (travel insurance, forex)

    - id: tour_operators
      label: Tour Operators
      value_proposition: A fully organized, safe, and enriching travel experience in destinations where independent travel is difficult.
      specific_value_streams:
        - Tour package sale (all-inclusive price)
        - Single supplement & upgrade revenue
        - Optional excursion & add-on revenue
        - Travel insurance commission
        - Group charter revenue
        - Custom & private tour premium

    - id: destination_marketing
      label: Destination Marketing
      value_proposition: Economic development through visitor spending — funded by the accommodation & tourism tax base.
      specific_value_streams:
        - Government & hotel tax funding allocation
        - Membership dues from tourism businesses
        - Cooperative marketing fee from partners
        - Event hosting & convention bureau fee
        - Visitor research & data service revenue

    - id: adventure_and_eco_tourism
      label: Adventure & Eco-Tourism
      value_proposition: Transformative experiences in remote or natural settings with access and expertise the traveler cannot self-arrange.
      specific_value_streams:
        - Premium trip & experience fee (higher than mass market)
        - Conservation contribution or carbon offset fee
        - Guiding & instruction premium
        - Equipment rental revenue
        - Accommodation at remote lodges (captive pricing)

    - id: theme_parks_and_attractions
      label: Theme Parks & Attractions
      value_proposition: Immersive, memorable experiences that cannot be replicated at home — and that justify repeated visits.
      specific_value_streams:
        - Gate admission revenue (single-day & multi-day)
        - Annual pass & season membership revenue
        - Food & beverage in-park revenue (captive pricing)
        - Merchandise & branded product revenue
        - Hotel & on-site accommodation revenue
        - Premium experience & VIP upsell
        - IP licensing income (characters, brand)
        - Sponsorship & co-branding revenue
```

---

### Sector: Consumer & Personal Services

```yaml
sector:
  id: consumer_and_personal_services
  label: Consumer & Personal Services
  sector_common_value_streams:
    - Service fee per visit or session
    - Package & prepaid service bundle
    - Membership or subscription revenue
    - Product sale alongside service
    - Referral & partner revenue

  sub_industries:

    - id: personal_care_and_beauty
      label: Personal Care & Beauty
      value_proposition: Enhanced appearance, confidence, and self-care — delivered by a trusted professional with consistent results.
      specific_value_streams:
        - Service fee per appointment (haircut, color, facial, etc.)
        - Retail product sale (shampoo, skincare — high margin)
        - Package & prepaid service bundle
        - Membership or loyalty subscription
        - Booth rental income (from independent stylists)
        - Gift card revenue

    - id: fitness_and_wellness
      label: Fitness & Wellness
      value_proposition: Health outcomes, community, and accountability that drive sustained behavior change.
      specific_value_streams:
        - Monthly membership fee
        - Personal training session fee (premium)
        - Group class & specialty class fee
        - Day pass & drop-in revenue
        - Merchandise & apparel sale
        - Nutrition & supplement product revenue
        - Online / digital membership extension

    - id: dry_cleaning_and_laundry
      label: Dry Cleaning & Laundry
      value_proposition: Clean, pressed, and ready-to-wear garments without the time or skill investment.
      specific_value_streams:
        - Per-item cleaning fee
        - Rush & premium service surcharge
        - Subscription laundering service (recurring)
        - Alterations & tailoring revenue
        - Storage (seasonal garment storage)

    - id: pet_care_and_veterinary
      label: Pet Care & Veterinary Services
      value_proposition: The health, comfort, and happiness of a beloved animal — an emotionally high-stakes purchase.
      specific_value_streams:
        - Veterinary exam & procedure fee
        - Prescription medication sale
        - Boarding & kennel fee
        - Grooming service fee
        - Wellness plan subscription
        - Specialty & emergency care premium fee
        - Pet product & accessory sale

    - id: funeral_and_memorial_services
      label: Funeral & Memorial Services
      value_proposition: Dignified, meaningful farewell that provides comfort and closure — at a highly emotional and time-sensitive moment.
      specific_value_streams:
        - Funeral service package fee
        - Casket, urn & merchandise sale (high margin)
        - Cemetery plot & interment fee
        - Cremation service fee
        - Pre-need (pre-arrangement) plan revenue
        - Memorial product & keepsake sale
        - Live-stream memorial service fee (emerging)

    - id: repair_and_maintenance_services
      label: Repair & Maintenance Services
      value_proposition: Restoring function to something the customer depends on — often urgently, with expertise they lack.
      specific_value_streams:
        - Repair service fee (diagnosis + labor)
        - Parts sale (often at margin)
        - Preventive maintenance contract
        - Emergency & after-hours call premium
        - Warranty repair reimbursement
        - Service plan & extended coverage revenue
```

---

### Sector: Arts, Culture & Sports

```yaml
sector:
  id: arts_culture_and_sports
  label: Arts, Culture & Sports
  sector_common_value_streams:
    - Ticket & admission revenue
    - Media rights & broadcast revenue
    - Sponsorship & naming rights
    - Merchandise & licensed product revenue
    - Membership & loyalty revenue
    - IP & content licensing

  sub_industries:

    - id: professional_sports
      label: Professional Sports Leagues & Teams
      value_proposition: Live drama, tribal identity, and community belonging that no other entertainment replicates.
      specific_value_streams:
        - Gate & ticket revenue (single game, season, premium)
        - National & local media rights revenue (largest for major leagues)
        - Stadium naming rights & sponsorship revenue
        - Merchandise & licensing income
        - Food, beverage & parking revenue (in-stadium)
        - Premium seating (suites, club seats)
        - International & streaming rights income
        - Revenue sharing from league (centrally distributed)

    - id: live_events_and_concerts
      label: Live Events & Concerts
      value_proposition: A shared, unrepeatable, real-time experience — the scarcity of live drives the price premium.
      specific_value_streams:
        - Ticket sale revenue (face value)
        - Premium & VIP ticket tier revenue
        - Ticketing & service fee income (for promoters / platforms)
        - Merchandise sale (in-venue and online)
        - Sponsorship & branding revenue
        - Streaming & PPV broadcast revenue
        - Food & beverage in-venue revenue

    - id: museums_and_galleries
      label: Museums & Galleries
      value_proposition: Access to cultural heritage, artistic excellence, and educational enrichment in a curated environment.
      specific_value_streams:
        - General admission revenue
        - Membership & annual pass revenue
        - Special exhibition ticket premium
        - Retail & gift shop revenue
        - Food service & venue hire revenue
        - Corporate event rental revenue
        - Endowment & philanthropic income
        - Licensing of collection images & IP
        - Traveling exhibition loan fee

    - id: performing_arts
      label: Performing Arts
      value_proposition: Live artistic performance that creates emotion, cultural connection, and shared experience.
      specific_value_streams:
        - Ticket sale revenue
        - Subscription & season ticket revenue
        - Venue rental & touring fee income
        - Recording & broadcast licensing fee
        - Corporate sponsorship income
        - Endowment & philanthropic income
        - Educational program & workshop fee

    - id: gaming_and_esports
      label: Gaming & Esports
      value_proposition: Competitive spectacle and community — a sport built entirely in digital space.
      specific_value_streams:
        - Media rights & streaming revenue
        - Sponsorship & brand partnership revenue
        - Event ticket & gate revenue
        - Merchandise & team-branded product revenue
        - Game publisher licensing & revenue share
        - In-game cosmetic & team skin revenue

    - id: recreation_and_amusement_parks
      label: Recreation & Amusement Parks
      value_proposition: Fun, excitement, and family memory-making in a controlled, safe environment.
      specific_value_streams:
        - Admission & day pass revenue
        - Season pass & membership revenue
        - Food & beverage revenue (captive)
        - Merchandise & game revenue
        - Ride photo & upsell revenue
        - Corporate & private event revenue
        - Hotel & resort accommodation revenue (destination parks)
```

---

### Sector: Nonprofit & Social Sector

```yaml
sector:
  id: nonprofit_and_social_sector
  label: Nonprofit & Social Sector
  sector_common_value_streams:
    - Individual donations & major gifts
    - Foundation & grant income
    - Government contract & grant
    - Membership dues
    - Program service fee
    - Earned income from commercial activity

  sub_industries:

    - id: charitable_foundations
      label: Charitable Foundations
      value_proposition: Grant capital and strategic partnership that accelerates social impact beyond what individual donors achieve alone.
      specific_value_streams:
        - Endowment investment return (primary revenue source)
        - New donor contributions
        - Planned giving & bequest income
        - Program-related investment (PRI) return
        - Co-funding partnerships with other foundations

    - id: religious_organizations
      label: Religious Organizations
      value_proposition: Spiritual community, meaning-making, and pastoral care — with a self-reinforcing community of shared belief.
      specific_value_streams:
        - Tithes & regular congregation giving
        - Special campaign & capital appeal donations
        - Event & program fee income
        - Facility rental income
        - Endowment income
        - Bookstore & media product revenue

    - id: advocacy_and_policy_organizations
      label: Advocacy & Policy Organizations
      value_proposition: Policy change and systemic influence that individual members or donors cannot achieve alone.
      specific_value_streams:
        - Individual & major donor fundraising
        - Foundation grant income
        - Membership dues
        - Event & conference revenue
        - Publication & research product revenue
        - Coalition partner funding

    - id: social_services_and_community_organizations
      label: Social Services & Community Organizations
      value_proposition: Direct support that stabilizes lives and connects people to resources they cannot access on their own.
      specific_value_streams:
        - Government contract revenue (Medicaid, TANF, housing vouchers)
        - Foundation grant income
        - Individual donation income
        - Program fee (sliding scale or market rate)
        - United Way & federated campaign allocation
        - Social enterprise earned income

    - id: international_aid_and_development
      label: International Aid & Development
      value_proposition: Sustained development outcomes in underserved regions — education, health, economic opportunity — at scale.
      specific_value_streams:
        - Government bilateral aid contract (USAID, FCDO, etc.)
        - Multilateral institutional grant (World Bank, UN agencies)
        - Individual & major donor fundraising
        - Corporate partnership & CSR funding
        - Social impact bond & outcomes-based contract revenue
        - Local revenue generation (microfinance, social enterprise)

    - id: membership_associations_and_trade_groups
      label: Membership Associations & Trade Groups
      value_proposition: Industry representation, peer networks, shared resources, and collective voice that members cannot access independently.
      specific_value_streams:
        - Annual membership dues (tiered by size or type)
        - Conference & event registration revenue
        - Certification & credentialing program fee
        - Publication & content subscription revenue
        - Sponsorship & exhibit revenue
        - Advocacy & PAC-funded activities (where applicable)
        - Training program revenue
```

---

## Part 4: Value Stream Classification Reference

```yaml
value_classifications:

  by_revenue_model:
    - id: recurring
      label: Recurring / Subscription
      description: Revenue that repeats at regular intervals without requiring a new sales transaction. Highest-quality revenue — predictable, sticky, and valued at a premium multiple.
      examples: SaaS subscription, insurance premium, utility tariff, membership fee
    - id: transactional
      label: Transactional
      description: Revenue earned on discrete sales events. Volume and conversion-dependent.
      examples: Product sale, ticket purchase, one-time service fee, marketplace transaction
    - id: usage_based
      label: Usage-Based / Consumption
      description: Revenue that scales with how much the customer uses. Aligns price with value but creates forecast variability.
      examples: Cloud compute billing, utility metering, per-API-call pricing, pay-per-mile
    - id: project
      label: Project / Contract
      description: Revenue recognized over the life of a defined engagement with a clear start and end. Common in services and construction.
      examples: Construction contract, consulting engagement, government program, film production
    - id: asset_based
      label: Asset-Based / Lease
      description: Revenue generated by deploying owned assets over time. Capital-intensive but durable.
      examples: Real estate lease, equipment rental, IP royalty, infrastructure access fee
    - id: hybrid
      label: Hybrid
      description: Combination of two or more of the above models within the same offering.
      examples: SaaS with usage overage, hotel (room + F&B + events), car dealer (sale + F&I + service)

  by_value_driver:
    - id: access
      label: Access
      description: The customer pays for the right to use something — a network, platform, content library, or infrastructure.
    - id: outcome
      label: Outcome
      description: The customer pays for a specific result — a completed project, a cured condition, a delivered shipment.
    - id: asset
      label: Asset
      description: The customer acquires or uses a physical or digital asset that delivers utility over time.
    - id: service
      label: Service
      description: The customer pays for expertise, time, and effort applied to their benefit.
    - id: experience
      label: Experience
      description: The customer pays for how something makes them feel — entertainment, belonging, status, adventure.
    - id: risk_transfer
      label: Risk Transfer
      description: The customer pays to shift financial or operational risk to the provider.
    - id: information
      label: Information / Insight
      description: The customer pays for a decision advantage derived from data, analysis, or intelligence.
    - id: compliance
      label: Compliance
      description: The customer pays because they must — regulatory, contractual, or legal requirements drive the purchase.

  by_pricing_mechanism:
    - id: cost_plus
      label: Cost-Plus
      description: Price set as cost plus a defined margin. Common in government contracting, commodity distribution.
    - id: value_based
      label: Value-Based
      description: Price set relative to the economic value delivered to the customer. Premium pricing strategy.
    - id: market_rate
      label: Market / Competitive Rate
      description: Price set by what the market will bear relative to competitors. Common in commodities and retail.
    - id: regulated
      label: Regulated Rate
      description: Price set or approved by a government or regulatory body. Utilities, healthcare, and financial services.
    - id: auction_or_spot
      label: Auction / Spot Market
      description: Price determined in real-time by supply and demand. Commodities, energy, advertising.
    - id: dynamic
      label: Dynamic Pricing
      description: Price varies algorithmically based on demand, time, inventory, or customer segment. Airlines, hotels, ride-sharing.
    - id: freemium
      label: Freemium
      description: Core product free; revenue from converting users to a paid tier or monetizing with advertising.

  by_customer_type:
    - id: b2c
      label: Business-to-Consumer (B2C)
      description: End consumer is an individual or household. Emotional and aspirational drivers often significant.
    - id: b2b
      label: Business-to-Business (B2B)
      description: Customer is an organization. ROI, risk reduction, and total cost of ownership drive decisions.
    - id: b2g
      label: Business-to-Government (B2G)
      description: Customer is a government entity. Compliance, procurement rules, and political factors shape purchasing.
    - id: b2b2c
      label: B2B2C
      description: Business sells to another business that serves end consumers. Value must work at both levels.
    - id: marketplace
      label: Marketplace / Multi-Sided
      description: Platform serves two or more distinct customer groups whose participation creates value for each other.
```

---

## Part 5: App Implementation Notes

```yaml
implementation_guidance:

  template_construction:
    - When a user selects an industry + sub-industry, load:
        1. Universal value streams (always included as default line items)
        2. Near-universal value streams (included by default, toggleable off)
        3. Sector common value streams (included by default)
        4. Sub-industry specific value streams (included by default)
    - Allow users to add custom value streams not in the template.
    - Allow users to remove any pre-populated item.
    - Pair with cost profile (industry_cost_profiles.md) to build a complete business case.

  value_stream_schema:
    fields:
      - id: string (slug)
      - label: string (display name)
      - description: string (tooltip / help text)
      - value_proposition: string (what the customer is actually paying for)
      - revenue_type: enum [recurring, transactional, usage-based, project, asset-based, hybrid]
      - value_driver: enum [access, outcome, asset, service, experience, risk-transfer, information, compliance]
      - pricing_mechanism: enum [cost-plus, value-based, market-rate, regulated, auction, dynamic, freemium]
      - customer_type: enum [b2c, b2b, b2g, b2b2c, marketplace]
      - prevalence: enum [universal, near-universal, common, selective]
      - amount: number (user input)
      - unit: enum [annual, monthly, per-unit, percentage-of-revenue, per-transaction]
      - notes: string (user annotation)

  grouping_suggestions:
    - Group line items by: Core Revenue | Recurring / Subscription | Ancillary & Add-On |
        Financing & Financial Products | Platform & Marketplace | Licensing & IP | Other
    - Allow alternate grouping by: Revenue Type | Value Driver | Customer Type | Pricing Mechanism

  prioritization:
    - Surface recurring revenue streams first — they drive enterprise value and investor attention.
    - Flag high-margin ancillary streams that are often overlooked (F&I in auto, loyalty in airlines, aftermarket in industrial).
    - Highlight industry-defining revenue models (e.g. DRG reimbursement in hospitals, take-rate in marketplaces,
        net interest margin in banking) that non-experts may not think to include.
    - Cross-reference with cost profiles to surface gross margin by stream where possible.

  pairing_with_costs:
    - Gross margin = Value stream revenue − directly attributable COGS
    - Contribution margin = Gross margin − directly attributable variable OpEx
    - Each value stream should map to its primary cost drivers from industry_cost_profiles.md
    - Some value streams have near-zero incremental cost (IP licensing, data products, advertising on existing platform)
        and should be flagged as high-margin opportunities

  data_quality_notes:
    - All value items are qualitative categories, not amounts.
    - Amounts should be user-entered or connected to benchmarking data sources separately.
    - Sub-industry value streams inherit sector common streams — avoid double-counting in templates.
    - Not all streams apply to all business models within a sub-industry.
      Example: a small independent restaurant has no franchise royalty income; a franchisor does.
    - Revenue type and pricing mechanism may differ from the norm for innovative or disruptive entrants
      within an established industry.
```

---

## Part 6: Hybrid Industry Scenarios

Many businesses operate across sector boundaries. These hybrid profiles capture the most common cross-industry combinations and the value streams unique to each pairing. Use when a user's business does not fit cleanly into a single sector.

```yaml
hybrid_scenarios:

  - id: healthtech_digital_health
    label: Healthtech / Digital Health
    description: Technology companies operating in healthcare — combining software economics with clinical reimbursement.
    component_sectors: [technology, healthcare_and_life_sciences]
    hybrid_value_streams:
      - SaaS platform fee (EHR, practice management, telehealth)
      - Per-visit or per-consult telehealth billing (insurance reimbursement)
      - Remote patient monitoring (RPM) reimbursement
      - AI diagnostic tool licensing to providers
      - Population health management contract (value-based care)
      - Consumer wellness subscription (direct-to-consumer)
      - Clinical data licensing to pharma & research
      - Employer health benefit program contract
    key_tensions:
      - SaaS pricing logic vs. healthcare reimbursement codes
      - FDA regulatory pathway adds cost and timeline unlike pure software
      - Provider adoption is slow; sales cycles are long
      - Data privacy (HIPAA) constrains data monetization

  - id: fintech
    label: Fintech
    description: Technology companies delivering financial services — combining platform scalability with regulated financial products.
    component_sectors: [technology, finance_and_insurance]
    hybrid_value_streams:
      - Payment processing & interchange revenue
      - Consumer lending interest & fee income
      - Embedded finance API fee (BaaS model)
      - Insurance product distribution commission
      - Investment & brokerage fee (zero-commission model shifts to order flow)
      - Subscription financial management tool fee
      - B2B spend management platform fee
      - Data & credit score product licensing
    key_tensions:
      - Unit economics often negative at early scale; monetization lags user growth
      - Regulatory capital requirements limit leverage
      - Banking-as-a-Service (BaaS) partnerships add compliance risk
      - Customer acquisition cost (CAC) is high; LTV depends on product depth

  - id: agtech
    label: Agtech
    description: Technology companies serving agricultural producers — combining software and data with commodity-driven customers.
    component_sectors: [technology, agriculture_food_natural_resources]
    hybrid_value_streams:
      - Precision agriculture software subscription
      - Yield optimization & advisory service fee
      - Farm data platform & marketplace revenue
      - Drone & sensor service fee (SaaS + hardware)
      - Input procurement platform take-rate
      - Crop insurance integration & referral fee
      - Carbon credit aggregation & marketplace revenue
      - Equipment telematics subscription
    key_tensions:
      - Farmer CAC is high; ROI must be demonstrated in-season
      - Seasonal revenue concentration (planting / harvest)
      - Commodity price volatility affects farmer willingness to spend on software
      - Data ownership and privacy are sensitive with farm operators

  - id: edtech
    label: Edtech
    description: Technology companies delivering educational products — combining content economics with institutional and consumer sales.
    component_sectors: [technology, education]
    hybrid_value_streams:
      - Consumer subscription (self-paced learning platform)
      - Institutional / district license fee
      - Employer corporate training license
      - Certification & credential fee
      - Income share agreement (ISA) on outcomes
      - Tutoring & live instruction marketplace take-rate
      - Content licensing to traditional publishers
      - Government workforce development contract
    key_tensions:
      - Consumer churn is high without outcome accountability
      - Institutional sales cycles are long and procurement-driven
      - Credentialing legitimacy depends on employer recognition
      - ISA revenue is deferred and dependent on graduate employment outcomes

  - id: proptech
    label: Proptech
    description: Technology companies serving real estate — combining marketplace, SaaS, and asset-based revenue models.
    component_sectors: [technology, construction_and_real_estate]
    hybrid_value_streams:
      - Transaction marketplace commission (% of sale or lease)
      - SaaS property management platform subscription
      - Mortgage origination & referral fee
      - Title & escrow service fee
      - Short-term rental management platform take-rate
      - Construction technology & BIM software subscription
      - Real estate data & analytics subscription
      - iBuyer spread (buy-renovate-sell margin)
    key_tensions:
      - Real estate transaction volume is cyclical and rate-sensitive
      - iBuyer model requires significant capital and carries inventory risk
      - Agent and broker relationships are entrenched and resistant to disintermediation
      - Regulatory complexity varies by state and transaction type

  - id: mobility_and_transportation_tech
    label: Mobility & Transportation Tech
    description: Technology companies in transportation — combining logistics software, marketplace, and asset models.
    component_sectors: [technology, transportation_and_logistics]
    hybrid_value_streams:
      - Ride-hailing take-rate (% of fare)
      - Delivery marketplace commission
      - Fleet management SaaS subscription
      - Telematics data product licensing
      - EV charging network revenue (per kWh or subscription)
      - Autonomous vehicle licensing & data revenue (emerging)
      - Freight brokerage take-rate
      - Micro-mobility per-ride fee
    key_tensions:
      - Driver / contractor economics require subsidy at early scale
      - Regulatory status of gig workers is a structural cost risk
      - Vehicle utilization and downtime directly affect unit economics
      - Capital intensity of owning or leasing vehicles

  - id: media_and_commerce
    label: Media & Commerce (Shoppable Media / Retail Media)
    description: Media platforms that have integrated e-commerce, or retailers that have become media platforms.
    component_sectors: [telecommunications_and_media, retail_and_wholesale_trade]
    hybrid_value_streams:
      - Advertising revenue (media side)
      - Product sale margin (commerce side)
      - Affiliate & performance marketing commission
      - Branded content & sponsored editorial fee
      - Retail media network advertising revenue
      - Subscription content + commerce bundle fee
      - Creator revenue share & marketplace take-rate
      - Data & audience monetization (to advertisers)
    key_tensions:
      - Editorial credibility vs. commerce incentive creates tension
      - Advertising revenue is cyclical; product margin is operational
      - Audience trust can erode if commerce feels intrusive
      - Returns and logistics burden is foreign to pure-media operations

  - id: manufacturing_as_a_service
    label: Manufacturing-as-a-Service (MaaS)
    description: Manufacturers adding software, data, and service layers to physical product businesses.
    component_sectors: [manufacturing, technology]
    hybrid_value_streams:
      - Product sale (traditional model, declining share)
      - Aftermarket & consumable recurring revenue
      - Remote monitoring & predictive maintenance subscription
      - Outcome-based contract (uptime guarantee, pay-per-use)
      - Equipment-as-a-Service (EaaS) subscription replacing CapEx sale
      - Digital twin & simulation platform license
      - Data & operational analytics service fee
      - Training & certification platform revenue
    key_tensions:
      - Transitioning from CapEx sale to OpEx subscription reduces near-term revenue
      - Service model requires different sales and delivery capability
      - Connectivity and data infrastructure adds ongoing cost
      - Customer willingness to share operational data varies

  - id: energy_and_tech
    label: Energy Tech / Cleantech
    description: Technology companies building in the energy transition — combining software, hardware, and regulated utility economics.
    component_sectors: [energy_and_utilities, technology]
    hybrid_value_streams:
      - Software platform for grid management or energy optimization
      - Hardware product sale (inverters, meters, controls)
      - Energy storage as a service subscription
      - Virtual power plant (VPP) aggregation revenue
      - Carbon credit origination & marketplace revenue
      - Demand response & grid services revenue
      - EV charging network fee (per session or subscription)
      - Energy data & analytics platform subscription
    key_tensions:
      - Hardware margin is thin; software margin is the prize
      - Utility regulatory approval slows deployment timelines
      - Capital intensity of hardware + infrastructure is high
      - Revenue often depends on policy incentives that can change

  - id: direct_to_consumer_brand
    label: Direct-to-Consumer (DTC) Brand
    description: Consumer product brands that sell primarily through owned channels, bypassing wholesale.
    component_sectors: [manufacturing, retail_and_wholesale_trade, telecommunications_and_media]
    hybrid_value_streams:
      - DTC e-commerce product sale (higher margin than wholesale)
      - Subscription replenishment model
      - Brand community & membership revenue
      - Wholesale & retail channel revenue (secondary)
      - Marketplace channel revenue (Amazon, etc.)
      - Content & media revenue (brand-as-publisher)
      - Co-branded & collaboration product revenue
      - International DTC expansion revenue
    key_tensions:
      - Customer acquisition cost (CAC) on paid channels is high and rising
      - LTV depends on repeat purchase rate; one-time buyers destroy unit economics
      - Inventory risk sits with the brand (no wholesale buffer)
      - Wholesale channels offer reach but dilute brand margin and control

  - id: platform_marketplace
    label: Platform / Marketplace Business
    description: Two-sided or multi-sided platforms that create value by connecting supply and demand — across any industry.
    component_sectors: [technology, any]
    hybrid_value_streams:
      - Take-rate on transactions between buyers and sellers
      - Listing & subscription fee from supply side
      - Premium placement & advertising from supply side
      - Value-added services to supply side (financing, fulfillment, analytics)
      - Value-added services to demand side (protection, curation, search)
      - Data & insight product licensing
      - White-label / API access fee (platform-as-a-service)
    key_tensions:
      - Cold start problem requires subsidizing one or both sides to reach liquidity
      - Disintermediation risk — parties transact off-platform once connected
      - Network effects are hard to build and easy to fragment
      - Take-rate pressure as the market matures and alternatives emerge

  - id: social_enterprise
    label: Social Enterprise / Mission-Driven Business
    description: Organizations that pursue social or environmental missions alongside commercial revenue — blended models.
    component_sectors: [nonprofit_and_social_sector, any]
    hybrid_value_streams:
      - Commercial product or service revenue (earned income)
      - Grant & philanthropic income (mission-aligned)
      - Government contract for social service delivery
      - Impact investment & program-related investment (PRI) capital
      - Social impact bond revenue (outcomes-based)
      - B Corp & certification premium on product pricing
      - ESG reporting & advisory service fee
      - Carbon & social credit monetization
    key_tensions:
      - Mission drift risk when commercial revenue dominates decision-making
      - Grant income is non-recurring and requires constant renewal
      - Proving impact is costly and reduces resources available for programs
      - Commercial pricing must compete with non-mission alternatives

  - id: healthcare_and_insurance_convergence
    label: Healthcare & Insurance Convergence
    description: Health systems acquiring insurers, or insurers acquiring providers — vertically integrated value-based care.
    component_sectors: [healthcare_and_life_sciences, finance_and_insurance]
    hybrid_value_streams:
      - Insurance premium revenue (payer side)
      - Clinical service revenue (provider side)
      - Shared savings from risk contract (ACO, capitation)
      - Pharmacy benefit revenue
      - Population health management contract
      - Value-based care incentive & quality bonus
      - Data analytics service licensing
    key_tensions:
      - Regulatory scrutiny on vertical integration (antitrust, insurance regulation)
      - Cultural gap between insurance and clinical operations
      - Medical loss ratio requirements constrain insurance profitability
      - Provider independence and physician alignment are critical and fragile

  - id: food_and_tech
    label: Food Tech / Alternative Protein / Ag-Food Innovation
    description: Technology-driven food companies operating at the intersection of agriculture, manufacturing, and consumer brands.
    component_sectors: [agriculture_food_natural_resources, manufacturing, retail_and_wholesale_trade]
    hybrid_value_streams:
      - Consumer product sale (branded retail)
      - Foodservice & restaurant supply contract
      - Ingredient & B2B licensing to food manufacturers
      - Technology platform licensing (fermentation IP, cell ag process)
      - Co-manufacturing & toll processing revenue
      - Carbon credit & sustainability attribute premium
      - DTC e-commerce product sale
    key_tensions:
      - Consumer taste and adoption is the single biggest risk
      - Unit economics at early scale are poor; cost parity with conventional depends on volume
      - Regulatory approval timelines for novel foods (FDA GRAS, novel food)
      - IP protection in fast-moving scientific field is difficult
```

---

## Appendix: Value Stream × Cost Profile Cross-Reference

Use this to connect each value stream to its primary cost drivers for gross margin modeling.

```yaml
cross_reference:

  - value_stream: Product sale
    primary_costs: [raw_materials, manufacturing_labor, logistics_and_freight, packaging]
    margin_character: Thin to moderate; scale and procurement drive improvement

  - value_stream: SaaS subscription
    primary_costs: [engineering_labor, cloud_infrastructure, customer_success]
    margin_character: High gross margin (70–85%); improves with scale

  - value_stream: Service fee (professional)
    primary_costs: [professional_labor, overhead]
    margin_character: Moderate (30–50%); constrained by billable utilization

  - value_stream: Insurance premium
    primary_costs: [claims_loss_costs, reinsurance, underwriting_labor]
    margin_character: Volatile; combined ratio determines profitability

  - value_stream: Advertising revenue
    primary_costs: [content_or_platform_infrastructure, ad_sales_labor]
    margin_character: Very high incremental margin once platform exists

  - value_stream: Marketplace take-rate
    primary_costs: [technology_platform, trust_and_safety, payment_processing]
    margin_character: Very high once liquidity achieved; low incremental cost per transaction

  - value_stream: Licensing & royalty
    primary_costs: [RnD_amortization, legal_and_IP_defense]
    margin_character: Very high (near 100% incremental); pure IP monetization

  - value_stream: Real estate lease income
    primary_costs: [debt_service, property_management, maintenance, taxes_and_insurance]
    margin_character: Moderate; leverage amplifies both returns and risk

  - value_stream: Usage-based / consumption
    primary_costs: [infrastructure, energy, variable_operations]
    margin_character: Variable; margin compresses at low utilization

  - value_stream: Commodity product sale
    primary_costs: [raw_materials, extraction_or_production, logistics]
    margin_character: Thin and cyclical; price-taking, not price-setting

  - value_stream: Aftermarket parts & service
    primary_costs: [parts_inventory, service_labor, distribution]
    margin_character: High (40–60%); captive customer, less price sensitivity

  - value_stream: Data & information product
    primary_costs: [data_acquisition, technology_infrastructure, editorial_labor]
    margin_character: High; largely fixed cost base with low incremental delivery cost
```
