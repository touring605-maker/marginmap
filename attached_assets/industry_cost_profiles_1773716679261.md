# Industry Cost Profile Reference
**Purpose:** Machine-readable reference for populating cost templates in a business case builder app.
**Structure:** Universal cost categories → Industry sectors → Sub-industry cost profiles.
**Usage notes:**
- Each cost item represents a *category*, not a line-item amount.
- `prevalence` indicates how broadly a cost applies: `universal`, `near-universal`, `common`, `selective`.
- `cost_type` classifies the nature of the cost: `fixed`, `variable`, `semi-fixed`, or `capital`.
- `cogs_or_opex` indicates whether the cost typically sits above or below the gross profit line.
- Sub-industry profiles inherit sector-level common costs unless noted.

---

## Part 1: Universal Cost Categories

These categories appear across virtually all industries. Every business case template should include hooks for these regardless of industry selection.

```yaml
universal_costs:

  - id: labor
    label: Labor
    description: Wages, salaries, benefits, payroll taxes, and contractor payments for all personnel.
    prevalence: universal
    cost_type: semi-fixed
    cogs_or_opex: both
    sub_items:
      - Full-time employee wages & salaries
      - Part-time & seasonal wages
      - Employee benefits (health, dental, vision, retirement)
      - Payroll taxes (employer share)
      - Contractor & freelancer payments
      - Temporary staffing agency fees
      - Overtime & shift differentials
      - Bonuses & incentive compensation
      - Equity compensation (stock options, RSUs)

  - id: occupancy
    label: Occupancy & Facilities
    description: The cost of physical space — owned or leased — including associated operating expenses.
    prevalence: universal
    cost_type: fixed
    cogs_or_opex: opex
    sub_items:
      - Base rent or lease payments
      - Property taxes (if owned)
      - Common area maintenance (CAM) charges
      - Utilities (electricity, gas, water)
      - Janitorial & cleaning services
      - Security systems & monitoring
      - Facility insurance
      - Minor repairs & maintenance
      - Parking & access costs

  - id: technology_and_software
    label: Technology & Software
    description: All digital tools, platforms, infrastructure, and devices needed to operate.
    prevalence: universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - SaaS platform subscriptions
      - ERP & core business systems
      - Productivity & collaboration tools
      - Hardware & devices (computers, phones)
      - IT support & managed services
      - Cybersecurity tools & services
      - Data storage & backup
      - Domain, hosting & website
      - Telecommunications (phone, internet)

  - id: insurance
    label: Insurance
    description: Risk transfer costs covering liability, property, workers, and professional exposure.
    prevalence: universal
    cost_type: fixed
    cogs_or_opex: opex
    sub_items:
      - General liability insurance
      - Property insurance
      - Workers' compensation insurance
      - Professional liability / E&O insurance
      - Directors & officers (D&O) insurance
      - Cyber liability insurance
      - Vehicle / fleet insurance
      - Product liability insurance
      - Business interruption insurance

  - id: regulatory_compliance
    label: Regulatory & Compliance
    description: Costs of meeting legal, governmental, and industry-specific requirements.
    prevalence: universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - Business licenses & permits
      - Industry-specific regulatory fees
      - Legal counsel (ongoing compliance)
      - Compliance staff & officers
      - Audit & certification fees
      - Regulatory reporting & filings
      - Environmental compliance costs
      - Health & safety programs
      - Training for regulatory requirements

  - id: sales_and_marketing
    label: Sales & Marketing
    description: Costs of acquiring, retaining, and growing customers or revenue sources.
    prevalence: universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - Advertising spend (digital, print, broadcast)
      - Marketing agency & creative fees
      - Sales team compensation & commissions
      - CRM & sales enablement tools
      - Trade shows & events
      - Content marketing & SEO
      - Public relations
      - Customer loyalty & retention programs
      - Market research & competitive intelligence
      - Brand development & design

  - id: administration
    label: General & Administrative (G&A)
    description: Overhead costs of running the business entity itself.
    prevalence: universal
    cost_type: fixed
    cogs_or_opex: opex
    sub_items:
      - Executive & management labor
      - Finance & accounting staff
      - Human resources staff
      - Legal fees (general counsel)
      - Office supplies & consumables
      - Postage & shipping (admin)
      - Bank fees & payment processing
      - Corporate insurance
      - Board & governance costs
```

---

## Part 2: Near-Universal Cost Categories

These appear in the majority of industries but may be negligible or absent in some pure-service or digital businesses.

```yaml
near_universal_costs:

  - id: energy_and_utilities
    label: Energy & Utilities
    description: Power, fuel, gas, and water consumed in operations.
    prevalence: near-universal
    cost_type: variable
    cogs_or_opex: both
    notes: Negligible for pure software businesses. Dominant for manufacturers, utilities, and data centers.
    sub_items:
      - Electricity
      - Natural gas
      - Water & sewer
      - Fuel (vehicles, generators)
      - Waste disposal

  - id: logistics_and_freight
    label: Logistics & Freight
    description: Moving goods, materials, or people as part of core operations.
    prevalence: near-universal
    cost_type: variable
    cogs_or_opex: cogs
    notes: Absent for pure service businesses. A primary cost driver for goods-based industries.
    sub_items:
      - Inbound freight & receiving
      - Outbound shipping & delivery
      - Last-mile delivery costs
      - Freight brokerage fees
      - Customs & duties (international)
      - Packaging materials (shipping)
      - Returns & reverse logistics

  - id: maintenance_and_upkeep
    label: Maintenance & Upkeep
    description: Ongoing care of physical assets to preserve function and value.
    prevalence: near-universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - Scheduled preventive maintenance
      - Reactive/emergency repairs
      - Spare parts & consumable supplies
      - Maintenance labor (internal or contracted)
      - Service contracts & warranties

  - id: training_and_development
    label: Training & Development
    description: Building workforce capability through instruction, certification, and practice.
    prevalence: near-universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - Employee onboarding programs
      - Skills training & workshops
      - Professional certifications & licensing
      - Leadership development programs
      - LMS & e-learning platforms
      - Conference attendance & travel
      - Tuition reimbursement

  - id: customer_service_and_support
    label: Customer Service & Support
    description: Post-sale relationship costs including handling inquiries, issues, and returns.
    prevalence: near-universal
    cost_type: semi-fixed
    cogs_or_opex: opex
    sub_items:
      - Support staff labor
      - Help desk & ticketing software
      - Call center operations
      - Returns & warranty processing
      - Customer success management
      - Self-service tools & knowledge base

  - id: debt_service_and_financing
    label: Debt Service & Financing Costs
    description: Interest and fees on borrowed capital used to fund operations or assets.
    prevalence: near-universal
    cost_type: fixed
    cogs_or_opex: opex
    notes: Below-the-line in most P&L formats but critical to cash flow modeling.
    sub_items:
      - Interest on term loans
      - Interest on revolving credit / lines of credit
      - Equipment financing interest
      - Lease financing costs
      - Loan origination & bank fees
      - Floor plan financing interest (auto, equipment dealers)
```

---

## Part 3: Sector & Sub-Industry Cost Profiles

Each sector includes:
- `sector_common_costs`: Cost categories shared broadly across the sector.
- `sub_industries`: Individual sub-industry profiles with specific cost line items.

Sub-industry profiles include the sector common costs by inheritance unless marked `inherits_sector_costs: false`.

---

### Sector: Agriculture, Food & Natural Resources

```yaml
sector:
  id: agriculture_food_natural_resources
  label: Agriculture, Food & Natural Resources
  sector_common_costs:
    - Seeds & planting stock
    - Fertilizers & soil inputs
    - Pesticides & herbicides
    - Land (owned or leased)
    - Water & irrigation rights
    - Equipment ownership & depreciation
    - Equipment maintenance & repair
    - Fuel & energy (field operations)
    - Seasonal & migrant labor
    - Crop/livestock insurance
    - Storage & post-harvest handling
    - Environmental & water use compliance

  sub_industries:

    - id: crop_farming
      label: Crop Farming
      notes: Grains, produce, specialty crops, orchards, vineyards.
      specific_costs:
        - Seed & planting material (certified or proprietary)
        - Fertilizer & soil amendments
        - Pest & weed control (chemical or biological)
        - Land lease or purchase amortization
        - Irrigation infrastructure & water fees
        - Equipment depreciation (tractors, harvesters)
        - Harvest labor (seasonal, often contracted)
        - Crop insurance premiums
        - Post-harvest storage & conditioning
        - Grading, packing & packaging
        - Transportation to market or processor
        - Agronomist & technical advisory services

    - id: livestock_and_dairy
      label: Livestock & Dairy
      specific_costs:
        - Feed & forage (largest variable cost)
        - Veterinary care & medications
        - Animal purchase or breeding costs
        - Pasture & grazing land
        - Housing & barn infrastructure
        - Labor (daily care, milking, feeding)
        - Waste management & environmental compliance
        - Milking or processing equipment
        - Livestock & mortality insurance
        - Breeding & genetics programs

    - id: aquaculture_and_fishing
      label: Aquaculture & Fishing
      specific_costs:
        - Vessel ownership, lease & financing
        - Fuel (significant for offshore fishing)
        - Fishing licenses, quotas & permits
        - Nets, traps, lines & gear
        - Feed & water quality management (aquaculture)
        - Crew labor & safety compliance
        - Ice & cold-chain handling at sea
        - Docking & port fees
        - Processing & packaging
        - Marine insurance

    - id: forestry_and_timber
      label: Forestry & Timber
      specific_costs:
        - Timberland lease or ownership
        - Reforestation & seedling costs
        - Harvesting equipment (fellers, skidders)
        - Logging labor
        - Road construction & maintenance (access roads)
        - Timber certification (FSC, SFI)
        - Environmental & wildlife compliance
        - Transport to mill (log hauling)
        - Fire risk management

    - id: food_and_beverage_processing
      label: Food & Beverage Processing
      specific_costs:
        - Raw agricultural inputs (largest COGS item)
        - Processing & manufacturing equipment
        - Packaging materials (primary & secondary)
        - Labor (production line, QC, sanitation)
        - Energy (refrigeration, cooking, pasteurization)
        - Food safety compliance (HACCP, FDA, USDA)
        - Cold-chain logistics & refrigerated transport
        - Flavors, additives, preservatives & ingredients
        - Water usage & wastewater treatment
        - Waste & byproduct disposal
        - Third-party lab testing & certification

    - id: agricultural_inputs
      label: Agricultural Inputs
      notes: Seed companies, fertilizer, pesticide manufacturers, equipment OEMs.
      specific_costs:
        - R&D (seed genetics, chemistry, formulation)
        - Regulatory approval & testing (EPA, USDA)
        - Manufacturing of inputs
        - Raw chemical or biological inputs
        - Distribution & dealer network costs
        - Sales & agronomist field labor
        - Warehousing & logistics
        - Patent & IP maintenance
```

---

### Sector: Energy & Utilities

```yaml
sector:
  id: energy_and_utilities
  label: Energy & Utilities
  sector_common_costs:
    - Heavy capital equipment (owned & depreciated)
    - Infrastructure construction & maintenance
    - Skilled operations labor
    - Fuel or primary energy source
    - Environmental compliance & remediation
    - Regulatory & government relations
    - Safety systems & programs
    - Insurance (property, liability, environmental)
    - Long-term asset financing costs

  sub_industries:

    - id: oil_and_gas_extraction
      label: Oil & Gas Extraction
      specific_costs:
        - Exploration & seismic survey costs
        - Drilling & well completion costs
        - Well casing & downhole equipment
        - Royalties & mineral lease payments
        - Field operations labor
        - Produced water management
        - Pipeline access & gathering fees
        - Environmental compliance & spill liability
        - Asset retirement obligation (ARO) reserves
        - Oilfield services & contractor costs

    - id: coal_mining
      label: Coal Mining
      specific_costs:
        - Mine development & infrastructure
        - Heavy extraction equipment
        - Explosives & drilling consumables
        - Mine safety systems & compliance (MSHA)
        - Mining labor (unionized in many markets)
        - Reclamation & land remediation bonds
        - Rail & transport to power plants or ports
        - Water treatment & discharge compliance

    - id: petroleum_refining_and_distribution
      label: Petroleum Refining & Distribution
      specific_costs:
        - Crude oil feedstock (dominant cost)
        - Refinery equipment maintenance (turnarounds)
        - Energy (refining is highly energy-intensive)
        - Catalyst & chemical inputs
        - Skilled operations & engineering labor
        - Environmental compliance (emissions, EPA RFS)
        - Pipeline access & tariff fees
        - Product storage terminals
        - Blending & additive costs

    - id: electric_power_generation
      label: Electric Power Generation
      specific_costs:
        - Fuel (coal, natural gas, uranium by source)
        - Plant construction & long-term depreciation
        - Turbine & generation equipment maintenance
        - Grid interconnection & transmission access fees
        - Environmental permits & compliance (Clean Air Act)
        - Operations & engineering labor
        - Capacity market & ancillary service costs
        - Plant insurance

    - id: electric_grid_and_transmission
      label: Electric Grid & Transmission
      specific_costs:
        - Transmission line & substation infrastructure
        - Substation & switching equipment
        - Right-of-way land costs & easements
        - Line maintenance & vegetation management labor
        - Grid management & SCADA software
        - Regulatory compliance (NERC, FERC)
        - Storm response & outage restoration
        - Smart grid & metering infrastructure

    - id: natural_gas_distribution
      label: Natural Gas Distribution
      specific_costs:
        - Pipeline & distribution infrastructure
        - Compressor stations & equipment
        - Metering, pressure regulation & safety equipment
        - Leak detection & repair programs
        - Operations & maintenance labor
        - Gas sourcing & interstate pipeline costs
        - Underground storage costs
        - Regulatory compliance (PHMSA)

    - id: water_and_wastewater_utilities
      label: Water & Wastewater Utilities
      specific_costs:
        - Water source development & treatment plant
        - Pumping & distribution system infrastructure
        - Treatment chemicals (chlorine, fluoride, coagulants)
        - Operations & maintenance labor
        - Water source rights & permits
        - Regulatory compliance (Safe Drinking Water Act, Clean Water Act)
        - Pipe replacement & infrastructure renewal
        - Customer metering & billing systems

    - id: renewable_energy
      label: Renewable Energy
      notes: Solar, wind, hydro, geothermal.
      specific_costs:
        - Equipment (turbines, solar panels, inverters, racking)
        - Installation & construction (EPC costs)
        - Land lease or purchase
        - Grid interconnection studies & fees
        - Operations & maintenance (ongoing)
        - Insurance (equipment & project)
        - SCADA & remote monitoring software
        - Power purchase agreement (PPA) structuring costs
        - Battery storage integration (where applicable)

    - id: energy_storage_and_management
      label: Energy Storage & Management
      specific_costs:
        - Battery or storage system hardware (cells, modules)
        - Power electronics & inverters
        - Installation & commissioning
        - Software & grid integration / dispatch optimization
        - Ongoing maintenance & capacity degradation management
        - Site lease or land costs
        - Interconnection & utility coordination
```

---

### Sector: Mining & Materials

```yaml
sector:
  id: mining_and_materials
  label: Mining & Materials
  sector_common_costs:
    - Mine or site development & permitting
    - Heavy extraction & processing equipment
    - Skilled & safety-trained labor
    - Energy (high consumption operations)
    - Environmental compliance & reclamation
    - Processing & beneficiation
    - Transport & logistics to market
    - Royalties & mineral rights

  sub_industries:

    - id: metal_ore_mining
      label: Metal Ore Mining
      notes: Iron, copper, gold, silver, lithium, nickel, rare earths.
      specific_costs:
        - Exploration & resource assessment (drilling, surveys)
        - Mine development & infrastructure (shafts, haul roads)
        - Drilling & blasting consumables
        - Heavy equipment depreciation (shovels, haul trucks)
        - Ore processing & beneficiation (crushing, flotation)
        - Tailings & waste rock management
        - Water management & dewatering
        - Safety systems & compliance
        - Reclamation bonds & closure reserves
        - Concentrate transport & refining tolls

    - id: non_metallic_mineral_mining
      label: Non-Metallic Mineral Mining
      notes: Sand, gravel, limestone, potash, industrial minerals.
      specific_costs:
        - Site development, permitting & bonding
        - Extraction equipment (draglines, bulldozers, scrapers)
        - Blasting & consumables (where applicable)
        - Processing & crushing equipment
        - Dust control & environmental compliance
        - Transport to market (trucking, rail, barge)
        - Reclamation & site restoration
        - Labor

    - id: steel_and_metals_production
      label: Steel & Metals Production
      specific_costs:
        - Ore, scrap & raw material feedstock
        - Energy (electric arc furnace or blast furnace)
        - Alloying elements & additives
        - Furnace, rolling mill & casting equipment maintenance
        - Skilled operations & metallurgy labor
        - Environmental compliance (emissions, slag disposal)
        - Refractory & consumable materials
        - Logistics & finished product transport

    - id: chemicals_and_specialty_materials
      label: Chemicals & Specialty Materials
      specific_costs:
        - Feedstock chemicals & raw material inputs
        - Reactor & processing plant equipment
        - Energy (endothermic or exothermic processes)
        - Hazardous materials handling & safety systems
        - R&D & formulation development
        - Regulatory compliance (REACH, EPA, OSHA)
        - Packaging & distribution
        - Waste disposal & environmental remediation
        - Quality control & analytical lab

    - id: plastics_and_rubber
      label: Plastics & Rubber
      specific_costs:
        - Petrochemical feedstocks (ethylene, propylene, etc.)
        - Compounding & mixing equipment
        - Molding & extrusion equipment
        - Energy
        - Additives, colorants & stabilizers
        - Tooling & molds (capital item, amortized)
        - Waste & recycling compliance costs
        - Labor

    - id: glass_and_ceramics
      label: Glass & Ceramics
      specific_costs:
        - Raw minerals (silica sand, feldspar, soda ash, kaolin)
        - Kilns & furnace equipment
        - Energy (very high-heat processes)
        - Mold & forming equipment
        - Labor
        - Packaging (fragile goods require specialized packaging)
        - Quality control
        - Transport & breakage allowance

    - id: lumber_and_building_materials
      label: Lumber & Building Materials
      specific_costs:
        - Timber or raw material feedstock
        - Sawmill & planing equipment
        - Energy (drying kilns)
        - Drying & treatment processes
        - Labor
        - Environmental & forestry compliance
        - Transport & freight

    - id: textiles_and_fiber_materials
      label: Textiles & Fiber Materials
      specific_costs:
        - Raw fiber (cotton, wool, synthetic polymers)
        - Spinning, weaving & knitting equipment
        - Dyeing & finishing chemicals
        - Water use & effluent treatment
        - Labor (significant, especially in lower-cost markets)
        - Energy
        - Quality control & testing
        - Logistics & freight
```

---

### Sector: Manufacturing

```yaml
sector:
  id: manufacturing
  label: Manufacturing
  sector_common_costs:
    - Raw materials & components
    - Outsourced / contract manufacturing
    - Production labor
    - Factory & plant overhead
    - Capital equipment & depreciation
    - Quality control & testing
    - Logistics & inbound freight
    - Energy (production)
    - Tooling & molds
    - R&D & product development
    - Warranty reserves & after-sale costs
    - Environmental & safety compliance

  sub_industries:

    - id: automotive_manufacturing
      label: Automotive Manufacturing
      specific_costs:
        - Steel, aluminum & composite materials
        - Powertrain components (engine, transmission, battery)
        - Electronics & semiconductors
        - Interior & exterior components (seats, glass, trim)
        - Assembly labor
        - Robotics, automation & tooling
        - Factory overhead & plant depreciation
        - Supply chain & logistics management
        - Warranty reserves & recall costs
        - R&D (safety, emissions, EV development)
        - Dealer incentives & distribution costs

    - id: aerospace_and_defense_manufacturing
      label: Aerospace & Defense Manufacturing
      specific_costs:
        - Specialized alloys, composites & advanced materials
        - Avionics & mission-critical electronics
        - Highly skilled precision labor
        - Precision tooling, fixtures & jigs
        - Testing, certification & airworthiness compliance
        - Government audit & program oversight costs
        - Long-cycle R&D & non-recurring engineering (NRE)
        - Program management & earned value management (EVM)
        - Security clearance costs
        - Subcontractor management

    - id: electronics_and_semiconductors
      label: Electronics & Semiconductors
      specific_costs:
        - Wafer fabrication (fab costs — capital or outsourced)
        - Raw materials (silicon, rare earth elements, gases)
        - Chip design & EDA tool labor
        - Cleanroom facility costs
        - Assembly & test (often offshore contract manufacturing)
        - Intellectual property & licensing fees
        - Supply chain & component management
        - Packaging & interconnect
        - Yield loss & scrap

    - id: industrial_machinery_and_equipment
      label: Industrial Machinery & Equipment
      specific_costs:
        - Steel & structural materials
        - Machined & cast components
        - Motors, drives & hydraulics
        - Assembly labor
        - Engineering & design labor
        - Quality testing & calibration
        - Service & warranty infrastructure
        - Distribution & dealer network

    - id: consumer_goods_manufacturing
      label: Consumer Goods Manufacturing
      notes: Appliances, furniture, housewares, tools.
      specific_costs:
        - Raw materials or components
        - Contract manufacturing (often offshore)
        - Packaging & branding materials
        - Production labor
        - Quality control
        - Ocean & air freight
        - Marketing & retail placement fees
        - Returns & warranty

    - id: apparel_and_footwear
      label: Apparel & Footwear
      specific_costs:
        - Fabric, leather & materials
        - Cut-and-sew labor (usually outsourced to CMT factories)
        - Design & pattern development
        - Sampling & product development
        - Packaging & hangtags
        - Ocean freight & duties
        - Retail distribution & markups
        - Returns management & markdown reserves
        - Brand & marketing

    - id: medical_devices_and_equipment
      label: Medical Devices & Equipment
      specific_costs:
        - Precision components & biocompatible materials
        - Sterile or controlled manufacturing environment
        - Clinical trials & regulatory approval (FDA 510k, PMA)
        - Skilled assembly & inspection labor
        - Quality management systems (ISO 13485)
        - Service, repair & maintenance infrastructure
        - IP & patent defense
        - Clinical specialist & sales force costs

    - id: packaging_manufacturing
      label: Packaging Manufacturing
      specific_costs:
        - Raw materials (paperboard, corrugated, plastic resin, aluminum)
        - Printing & finishing equipment
        - Tooling & dies
        - Labor
        - Energy
        - Freight (bulky, low-margin product)
        - Sustainability compliance & recycled content

    - id: paper_and_printing
      label: Paper & Printing
      specific_costs:
        - Pulp & paper feedstock
        - Ink, coatings & chemistry
        - Press & finishing equipment depreciation
        - Energy
        - Labor
        - Binding & finishing
        - Freight & delivery

    - id: pharmaceuticals_and_biotech_manufacturing
      label: Pharmaceuticals & Biotech Manufacturing
      specific_costs:
        - Active pharmaceutical ingredients (APIs)
        - Excipients & formulation materials
        - Sterile or controlled manufacturing (GMP compliance)
        - Quality control & batch release testing
        - Regulatory compliance (FDA, EMA, cGMP)
        - Serialization & packaging
        - Cold-chain & specialty logistics
        - R&D amortization (allocated from development costs)
        - Product liability & recall reserves
```

---

### Sector: Construction & Real Estate

```yaml
sector:
  id: construction_and_real_estate
  label: Construction & Real Estate
  sector_common_costs:
    - Labor (trades & general labor)
    - Materials & supplies
    - Subcontractors
    - Equipment rental or ownership
    - Permits & compliance
    - Insurance & bonding
    - Project management
    - Design & engineering
    - Site safety programs

  sub_industries:

    - id: residential_construction
      label: Residential Construction
      specific_costs:
        - Land acquisition & entitlement
        - Site prep & grading
        - Foundation & structural materials (concrete, lumber, steel)
        - Framing labor & materials
        - Subcontractors (plumbing, electrical, HVAC, roofing)
        - Finishes & fixtures (cabinets, flooring, appliances)
        - Supervision & project management labor
        - Permits & inspections
        - Sales & marketing (model homes, commissions)
        - Warranty reserves & call-back repairs

    - id: commercial_industrial_construction
      label: Commercial & Industrial Construction
      specific_costs:
        - Structural steel & concrete
        - MEP systems (mechanical, electrical, plumbing)
        - Subcontractor coordination & management
        - Project management & superintendent labor
        - Equipment rental (cranes, lifts, excavation)
        - Permits & building code compliance
        - Safety programs & on-site safety officers
        - Bonding & performance guarantees
        - Insurance (builder's risk, liability)
        - Pre-construction & estimating costs

    - id: infrastructure_and_civil_engineering
      label: Infrastructure & Civil Engineering
      specific_costs:
        - Heavy equipment (graders, excavators, pavers)
        - Earthwork, grading & site preparation
        - Concrete, asphalt & aggregate materials
        - Specialized labor (operators, ironworkers)
        - Engineering & surveying
        - Environmental compliance & permitting
        - Government contracting overhead & compliance
        - Long project financing & bonding
        - Utility coordination

    - id: architecture_and_engineering_design
      label: Architecture & Engineering Design
      specific_costs:
        - Professional labor (architects, engineers, designers)
        - CAD & BIM software
        - Professional liability (E&O) insurance
        - Permitting & code review support
        - Subconsultant fees (structural, MEP, civil, geotech)
        - Project management & coordination
        - Model & prototype production
        - Business development & proposals

    - id: general_contracting_and_trades
      label: General Contracting & Trades
      specific_costs:
        - Trade labor (plumbing, electrical, HVAC, carpentry)
        - Materials & supplies
        - Subcontractor coordination
        - Tools & equipment
        - Licensing & continuing education
        - Vehicle fleet & fuel
        - Overhead (office, admin, estimating)
        - Bid & proposal costs

    - id: property_development
      label: Property Development
      specific_costs:
        - Land acquisition
        - Entitlement & permitting costs
        - Construction financing (interest carry during development)
        - Construction hard costs
        - Soft costs (architecture, engineering, legal, marketing)
        - Broker & sales commissions
        - Property management during lease-up
        - Holding costs (taxes, insurance, maintenance)
        - Market study & feasibility costs

    - id: commercial_real_estate
      label: Commercial Real Estate
      notes: Office, retail, industrial.
      specific_costs:
        - Property acquisition or construction cost
        - Debt service (mortgage payments, interest)
        - Property management fees or labor
        - Maintenance & capital improvements (CapEx)
        - Tenant improvement (TI) allowances
        - Leasing commissions & broker fees
        - Property taxes & insurance
        - Utilities (common areas)
        - Vacancy costs

    - id: residential_real_estate
      label: Residential Real Estate
      notes: Sales, rentals, investment properties.
      specific_costs:
        - Property acquisition cost
        - Debt service (mortgage)
        - Agent & brokerage commissions
        - Routine maintenance & repairs
        - Capital improvements
        - Property taxes & insurance
        - HOA fees (where applicable)
        - Vacancy costs & lost rent
        - Property management fees (if third-party)

    - id: property_management_and_facilities
      label: Property Management & Facilities Services
      specific_costs:
        - Property manager & maintenance staff labor
        - Vendor & contractor coordination
        - Liability & property insurance
        - Utilities management
        - Property management software
        - Compliance inspections & certifications
        - Landscaping & grounds keeping
        - Cleaning & janitorial services
```

---

### Sector: Transportation & Logistics

```yaml
sector:
  id: transportation_and_logistics
  label: Transportation & Logistics
  sector_common_costs:
    - Fuel
    - Fleet ownership, lease or charter
    - Driver & operator labor
    - Insurance (vehicle, cargo, liability)
    - Fleet maintenance
    - Tolls, fees & infrastructure access
    - Technology & tracking systems
    - Safety & regulatory compliance (DOT, FAA, etc.)

  sub_industries:

    - id: trucking_and_freight
      label: Trucking & Freight
      specific_costs:
        - Fuel (largest operating expense)
        - Driver wages, benefits & per diem
        - Truck ownership or lease payments
        - Tire costs & maintenance
        - Insurance (cargo, liability, physical damage)
        - Tolls & road user fees
        - Dispatch & routing software
        - DOT compliance, licensing & drug testing
        - Broker fees (if load brokering)

    - id: rail_freight
      label: Rail Freight
      specific_costs:
        - Track ownership, maintenance & capital renewal
        - Locomotive & railcar fleet (owned or leased)
        - Fuel (diesel or electric)
        - Labor (engineers, conductors, track maintenance)
        - Safety systems & FRA compliance
        - Terminal & intermodal facility operations
        - Crew hotel & travel expenses
        - Regulatory compliance costs

    - id: air_cargo
      label: Air Cargo
      specific_costs:
        - Jet fuel (significant & volatile)
        - Aircraft ownership, lease & financing
        - Airport landing fees & ground handling
        - Crew labor (pilots, loadmasters)
        - Cargo handling & ULD equipment
        - Maintenance, repair & overhaul (MRO)
        - Ground support equipment
        - Customs & regulatory compliance
        - Route authority & operating permits

    - id: ocean_and_inland_shipping
      label: Ocean & Inland Shipping
      specific_costs:
        - Vessel ownership, financing or charter hire
        - Bunker fuel (IFO, MGO, LNG)
        - Port & docking fees
        - Crew labor & crew change costs
        - Cargo insurance
        - Maintenance & drydock costs
        - Canal & waterway tolls
        - Customs, port agent & compliance costs
        - Container leasing or ownership

    - id: passenger_airlines
      label: Passenger Airlines
      specific_costs:
        - Jet fuel (25–30% of operating costs)
        - Aircraft lease or ownership & depreciation
        - Pilot & cabin crew labor
        - Airport gate fees & landing charges
        - Maintenance, repair & overhaul (MRO)
        - Distribution & ticketing platform fees
        - Ground operations & handling
        - Customer service infrastructure
        - Loyalty program liability & redemption costs
        - Sales & marketing

    - id: rail_and_bus_transit
      label: Rail & Bus Transit
      specific_costs:
        - Vehicle fleet (buses, railcars, locomotives)
        - Fuel or electricity (traction power)
        - Labor (drivers, operators, maintenance, stations)
        - Infrastructure maintenance (tracks, stations, platforms)
        - Station operations
        - Fare collection & payment systems
        - Safety & regulatory compliance
        - Capital program debt service

    - id: last_mile_delivery
      label: Last-Mile Delivery
      specific_costs:
        - Driver labor or independent contractor payments
        - Vehicle fleet or daily rental costs
        - Fuel
        - Routing & dispatch software
        - Packaging & handling materials
        - Failed delivery re-attempt costs
        - Customer service & tracking
        - Proof of delivery technology

    - id: warehousing_and_fulfillment
      label: Warehousing & Fulfillment
      specific_costs:
        - Facility lease or ownership
        - Labor (pickers, packers, supervisors, loaders)
        - Racking, shelving & storage equipment
        - Warehouse management system (WMS)
        - Utilities (especially refrigerated)
        - Shrinkage, damage & inventory loss
        - Inbound & outbound freight
        - Materials handling equipment (forklifts, conveyors)
        - Returns processing

    - id: supply_chain_management
      label: Supply Chain Management
      specific_costs:
        - Labor (planners, analysts, procurement)
        - Supply chain & visibility software
        - Vendor onboarding & management
        - Inventory carrying costs (financing, storage, obsolescence)
        - Risk mitigation & safety stock
        - Freight brokerage & third-party logistics (3PL) fees
        - Customs & trade compliance

    - id: courier_and_postal_services
      label: Courier & Postal Services
      specific_costs:
        - Carrier & delivery labor
        - Vehicle fleet & fuel
        - Sort facility operations
        - Package tracking technology
        - Failed delivery & returns handling
        - Customs & international compliance
        - Retail acceptance point costs

    - id: port_operations
      label: Port Operations
      specific_costs:
        - Crane & heavy materials handling equipment
        - Longshoreman & supervisor labor (often union)
        - Dredging & navigational channel maintenance
        - Terminal management system (TOS)
        - Security & customs compliance
        - Utilities & lighting
        - Land lease from port authority
        - Vessel scheduling & coordination
```

---

### Sector: Retail & Wholesale Trade

```yaml
sector:
  id: retail_and_wholesale_trade
  label: Retail & Wholesale Trade
  sector_common_costs:
    - Cost of goods sold (COGS / merchandise)
    - Labor (store, warehouse, or fulfillment)
    - Occupancy (rent or lease)
    - Inventory shrinkage & markdowns
    - Marketing & promotions
    - Technology (POS, e-commerce, inventory)
    - Logistics & inbound freight
    - Payment processing fees

  sub_industries:

    - id: grocery_and_food_retail
      label: Grocery & Food Retail
      specific_costs:
        - Perishable & non-perishable inventory (COGS)
        - Labor (checkout, stocking, deli, bakery)
        - Store occupancy (high-traffic locations)
        - Refrigeration & energy (major fixed cost)
        - Shrinkage & spoilage
        - Private label product costs
        - Distribution center & inbound freight
        - Marketing & loyalty program costs
        - Slotting fees (paid to vendors, or received from them)

    - id: general_merchandise_and_department_stores
      label: General Merchandise & Department Stores
      specific_costs:
        - Merchandise inventory (diversified COGS)
        - Labor (floor staff, supervisors, management)
        - Large-format store occupancy
        - Markdowns & promotional discounts
        - Distribution center operations
        - Visual merchandising & store fit-out
        - Returns processing
        - Credit card & payment processing fees

    - id: specialty_retail
      label: Specialty Retail
      notes: Electronics, apparel, sporting goods, home goods, books, toys.
      specific_costs:
        - Specialty merchandise (COGS)
        - Labor (product-knowledgeable staff)
        - Occupancy (mall or high-street premium)
        - Visual display & store design
        - Returns & exchange processing
        - Brand & category marketing
        - Inventory management systems

    - id: auto_dealers_and_parts
      label: Auto Dealers & Parts
      specific_costs:
        - Vehicle floor plan financing (interest on inventory loan — largest unique cost)
        - Parts & accessories inventory
        - Service department labor (technicians)
        - Facility & lot costs
        - Sales labor & commissions
        - Warranty & recall cost participation
        - Marketing & advertising
        - Finance & insurance (F&I) products

    - id: ecommerce
      label: E-Commerce
      specific_costs:
        - Merchandise or product COGS
        - Fulfillment & warehousing
        - Outbound shipping & last-mile
        - Returns & reverse logistics
        - Customer acquisition (paid search, social, affiliate)
        - E-commerce platform & hosting
        - Payment processing fees
        - Customer service operations
        - Fraud & chargebacks

    - id: wholesale_distribution
      label: Wholesale Distribution
      specific_costs:
        - Inventory acquisition (COGS)
        - Warehousing & distribution centers
        - Freight & logistics (inbound & outbound)
        - Labor (warehouse, inside sales, drivers)
        - Credit terms & accounts receivable float
        - Fleet & delivery
        - Customer service & order management
        - Inventory carrying costs

    - id: convenience_and_drug_stores
      label: Convenience & Drug Stores
      specific_costs:
        - Merchandise COGS
        - Labor
        - High-traffic location occupancy
        - Pharmacy labor & dispensing costs (drug stores)
        - Shrinkage & loss prevention
        - Refrigeration & utilities
        - Lottery & financial services processing fees

    - id: luxury_goods_retail
      label: Luxury Goods Retail
      specific_costs:
        - High-cost merchandise or handcrafted goods (COGS)
        - Prime real estate occupancy
        - Highly trained & experienced sales staff
        - Bespoke store design & visual presentation
        - Brand marketing, events & PR
        - Authentication & quality control
        - Loss prevention & security
        - After-sale service & repair programs
```

---

### Sector: Finance & Insurance

```yaml
sector:
  id: finance_and_insurance
  label: Finance & Insurance
  sector_common_costs:
    - Professional labor (highly compensated)
    - Technology & data systems
    - Regulatory compliance & legal
    - Risk & loss provisions
    - Marketing & customer acquisition
    - Capital costs & funding

  sub_industries:

    - id: commercial_and_retail_banking
      label: Commercial & Retail Banking
      specific_costs:
        - Cost of funds (interest paid on deposits & borrowings)
        - Credit losses & loan loss provisions (ALLL/ACL)
        - Labor (branch, underwriting, compliance, back office)
        - Branch network & ATM infrastructure
        - Core banking technology
        - Regulatory compliance (OCC, FDIC, BSA/AML)
        - Marketing & customer acquisition
        - Payment processing infrastructure

    - id: investment_banking_and_capital_markets
      label: Investment Banking & Capital Markets
      specific_costs:
        - Professional compensation (bankers, traders, analysts — dominant cost)
        - Compliance & legal (significant burden)
        - Technology (trading systems, Bloomberg, data terminals)
        - Premium office occupancy
        - Research production costs
        - Regulatory capital costs
        - Travel & deal-related expenses
        - Clearing & settlement costs

    - id: asset_and_wealth_management
      label: Asset & Wealth Management
      specific_costs:
        - Investment professional labor
        - Compliance & regulatory reporting (SEC, FINRA)
        - Portfolio management & trading systems
        - Fund administration & custody fees
        - Client servicing & relationship management
        - Marketing & distribution (12b-1 fees, RIA marketing)
        - Research & data subscriptions

    - id: venture_capital_and_private_equity
      label: Venture Capital & Private Equity
      specific_costs:
        - Investment professional labor
        - Deal sourcing & due diligence costs
        - Legal & advisory fees (transaction costs)
        - Portfolio company monitoring & support
        - Fund administration & audit
        - LP reporting & investor relations
        - Management company overhead

    - id: insurance
      label: Insurance
      notes: Life, health, property & casualty.
      specific_costs:
        - Claims payouts (loss costs — largest cost category)
        - Reinsurance premiums
        - Underwriting labor & systems
        - Actuarial & risk modeling
        - Sales & broker/agent commissions
        - Policy administration systems
        - Regulatory compliance & reserve requirements
        - Fraud investigation & special investigations unit

    - id: reinsurance
      label: Reinsurance
      specific_costs:
        - Catastrophe & tail-risk exposure (claims)
        - Actuarial & catastrophe modeling
        - Treaty & facultative deal structuring costs
        - Claims management
        - Regulatory capital & solvency requirements
        - Compliance

    - id: consumer_lending_and_credit
      label: Consumer Lending & Credit
      specific_costs:
        - Cost of capital & funding (warehouse lines, securitization)
        - Credit losses & charge-offs (allowance)
        - Origination labor & systems
        - Credit underwriting & scoring
        - Collections & recovery operations
        - Marketing & customer acquisition
        - Regulatory compliance (CFPB, fair lending, TILA, RESPA)
        - Servicing costs

    - id: payments_and_financial_infrastructure
      label: Payments & Financial Infrastructure
      specific_costs:
        - Network infrastructure & transaction processing
        - Fraud detection systems & loss absorption
        - Interchange & settlement costs
        - Technology & security (PCI-DSS compliance)
        - Customer acquisition & rewards program funding
        - Engineering & product labor
        - Regulatory compliance

    - id: accounting_and_audit
      label: Accounting & Audit
      specific_costs:
        - Professional labor (CPAs, auditors, tax professionals)
        - Audit & tax software platforms
        - Professional liability insurance
        - Continuing education & CPE
        - Office & administration
        - Business development & client marketing

    - id: financial_data_and_analytics
      label: Financial Data & Analytics
      specific_costs:
        - Data acquisition & licensing (key input cost)
        - Technology infrastructure & data engineering
        - Labor (data scientists, engineers, analysts)
        - Sales & account management
        - Compliance & data privacy (GDPR, CCPA)
        - Content production & editorial (for research products)
```

---

### Sector: Healthcare & Life Sciences

```yaml
sector:
  id: healthcare_and_life_sciences
  label: Healthcare & Life Sciences
  sector_common_costs:
    - Clinical labor (physicians, nurses, technicians)
    - Administrative & billing labor
    - Medical supplies & consumables
    - Regulatory compliance (FDA, CMS, HIPAA)
    - Malpractice & liability insurance
    - Technology & EHR systems
    - Facility & equipment

  sub_industries:

    - id: hospitals_and_health_systems
      label: Hospitals & Health Systems
      specific_costs:
        - Clinical labor (physicians, nurses, allied health — 50–60% of costs)
        - Medical supplies, drugs & consumables
        - Facility & capital equipment depreciation
        - Administrative & billing labor (revenue cycle)
        - Malpractice insurance
        - EHR & health IT systems
        - Utilities & facility management
        - Bad debt & uncompensated care
        - Graduate medical education costs

    - id: physician_and_specialist_practices
      label: Physician & Specialist Practices
      specific_costs:
        - Physician & clinical staff labor
        - Malpractice insurance
        - Medical supplies & exam consumables
        - Office lease & medical equipment
        - Billing & coding services (often outsourced)
        - EHR software
        - Credentialing & licensing fees
        - Prior authorization staff

    - id: outpatient_and_ambulatory_care
      label: Outpatient & Ambulatory Care
      specific_costs:
        - Clinical labor
        - Diagnostic & treatment equipment
        - Supplies & sterile consumables
        - Facility lease
        - Billing & insurance administration
        - Scheduling & practice management software
        - Lab & imaging costs (in-house or referred)

    - id: mental_health_services
      label: Mental Health Services
      specific_costs:
        - Therapist & psychiatrist labor
        - Telehealth platform costs
        - Office space or telework infrastructure
        - Credentialing & licensing
        - Billing & insurance administration
        - Crisis intervention staffing & protocols

    - id: home_health_and_long_term_care
      label: Home Health & Long-Term Care
      specific_costs:
        - Caregiver & home health aide labor (dominant cost)
        - Transportation & mileage reimbursement
        - Medical supplies & durable medical equipment (DME)
        - Scheduling & care management software
        - CMS & state compliance costs
        - Workers' compensation insurance (high rate)

    - id: dental_and_vision_services
      label: Dental & Vision Services
      specific_costs:
        - Dentist or optometrist labor
        - Specialized equipment (chairs, X-ray, OCT)
        - Supplies & consumables
        - Dental lab fees (crowns, dentures, prosthetics)
        - Facility lease
        - Billing & insurance administration

    - id: pharmaceuticals_and_drug_development
      label: Pharmaceuticals & Drug Development
      specific_costs:
        - R&D (clinical trials, preclinical studies — very large)
        - Regulatory submission & approval costs (FDA, EMA)
        - API sourcing & manufacturing
        - Sales force & medical affairs detailing
        - Medical education & conference costs
        - IP management & patent defense
        - Distribution, specialty pharmacy & 3PL
        - Rebates & government pricing compliance (Medicaid, Medicare)

    - id: biotechnology
      label: Biotechnology
      specific_costs:
        - R&D & discovery labor (scientists, researchers)
        - Lab equipment & reagents (significant consumables)
        - Clinical trial design, conduct & CRO costs
        - Regulatory affairs
        - IP protection & patent prosecution
        - Manufacturing scale-up (biologics are complex)
        - Partnership & licensing fees
        - Investor & scientific communications

    - id: medical_diagnostics_and_labs
      label: Medical Diagnostics & Labs
      specific_costs:
        - Lab equipment & analyzers
        - Reagents, controls & calibrators (ongoing consumable)
        - Lab technician & pathologist labor
        - Sample collection & logistics (specimen transport)
        - Accreditation & quality control (CAP, CLIA)
        - EHR & LIMS integration
        - Billing & insurance administration

    - id: health_insurance_and_managed_care
      label: Health Insurance & Managed Care
      specific_costs:
        - Medical loss ratio / claims paid (largest cost)
        - Provider network management & contracting
        - Actuarial & underwriting
        - Member services & call center
        - Pharmacy benefit management (PBM) costs
        - Care management & utilization review programs
        - Regulatory compliance & quality reporting (NCQA, HEDIS)
```

---

### Sector: Education

```yaml
sector:
  id: education
  label: Education
  sector_common_costs:
    - Instructional labor (teachers, faculty, instructors)
    - Administrative labor
    - Facilities
    - Technology & educational software
    - Curriculum & content
    - Compliance & accreditation

  sub_industries:

    - id: k12_education
      label: K–12 Education
      specific_costs:
        - Teacher & instructional staff labor
        - Benefits & pension obligations (often significant)
        - Facilities maintenance & operations
        - Curriculum & textbooks
        - Technology (devices, software licenses)
        - Student transportation (buses, drivers)
        - Special education services & aides
        - Food service programs
        - Extra-curricular & athletics

    - id: higher_education
      label: Higher Education
      specific_costs:
        - Faculty & research staff labor
        - Administrative staff
        - Facilities (academic buildings, residence halls, labs)
        - Research infrastructure & equipment
        - Student financial aid (institutional aid)
        - Athletics programs
        - IT & library systems
        - Marketing & enrollment management
        - Accreditation & compliance

    - id: vocational_and_trade_training
      label: Vocational & Trade Training
      specific_costs:
        - Instructor labor (often industry practitioners)
        - Shop equipment & specialized tools
        - Consumable training supplies
        - Curriculum development
        - Facility lease & safety compliance
        - Accreditation fees
        - Job placement services

    - id: early_childhood_and_childcare
      label: Early Childhood & Childcare
      specific_costs:
        - Caregiver & teacher labor (dominant cost)
        - Facility lease & childproofing compliance
        - Curriculum & developmental materials
        - Food & nutrition programs
        - Licensing, background checks & inspections
        - Insurance (high liability)

    - id: online_and_continuing_education
      label: Online & Continuing Education
      specific_costs:
        - Content development & instructional design
        - LMS & e-learning platform costs
        - Instructor labor or licensing fees
        - Marketing & student acquisition (often significant)
        - Student support services
        - Accreditation & quality assurance
        - Payment processing & enrollment systems

    - id: test_prep_and_tutoring
      label: Test Prep & Tutoring
      specific_costs:
        - Tutor or instructor labor
        - Content & curriculum development
        - Marketing & student acquisition
        - Platform or facility costs
        - Curriculum licensing or development amortization

    - id: corporate_training_and_workforce_development
      label: Corporate Training & Workforce Development
      specific_costs:
        - Instructional design & content development
        - LMS & delivery platform
        - Facilitator or trainer labor
        - Travel & logistics (in-person delivery)
        - Assessment & certification tools
        - Client account management
        - Translation & localization (global clients)

    - id: educational_publishing_and_content
      label: Educational Publishing & Content
      specific_costs:
        - Author advances & editorial labor
        - Content design & production
        - IP licensing
        - Print or digital production costs
        - Distribution
        - Sales force & adoption marketing
        - Platform & digital delivery infrastructure
```

---

### Sector: Technology

```yaml
sector:
  id: technology
  label: Technology
  sector_common_costs:
    - Engineering & product labor (largest cost)
    - Cloud infrastructure & hosting
    - Sales & marketing
    - R&D & product development
    - Customer support & success
    - Security & compliance

  sub_industries:

    - id: enterprise_software_saas
      label: Enterprise Software (SaaS)
      specific_costs:
        - Engineering & product labor
        - Cloud hosting (AWS, GCP, Azure)
        - Sales force & enterprise account management
        - Marketing & demand generation
        - Customer success & onboarding
        - Professional services & implementation
        - Security & compliance (SOC 2, ISO 27001)
        - Support infrastructure

    - id: consumer_software_and_apps
      label: Consumer Software & Apps
      specific_costs:
        - Engineering & product labor
        - Cloud infrastructure
        - User acquisition (paid social, search, app store)
        - App store fees (30% cut from Apple/Google)
        - Customer support
        - Content or data licensing
        - Influencer & partner marketing

    - id: cloud_computing_and_infrastructure
      label: Cloud Computing & Infrastructure
      specific_costs:
        - Data center construction & equipment (massive CapEx)
        - Energy (power & cooling — significant ongoing)
        - Hardware (servers, networking, storage)
        - Labor (data center engineers, site reliability)
        - Physical & cybersecurity
        - Regulatory & compliance (SOC 2, FedRAMP, ISO)
        - Depreciation of physical assets
        - Network & bandwidth costs

    - id: cybersecurity
      label: Cybersecurity
      specific_costs:
        - Engineering & threat research labor
        - Threat intelligence data subscriptions
        - Infrastructure & testing environments
        - Sales & channel partner programs
        - Compliance certifications (Common Criteria, FedRAMP)
        - Incident response team costs
        - Conference & community presence (DEF CON, RSA)

    - id: artificial_intelligence_and_ml
      label: Artificial Intelligence & Machine Learning
      specific_costs:
        - Engineering & research labor (highly specialized, expensive)
        - Compute costs (GPU/TPU training — can be very large)
        - Data acquisition, cleaning & labeling
        - Cloud infrastructure for inference
        - Model licensing or API costs (third-party models)
        - Compliance & AI safety programs
        - Research publication & talent attraction costs

    - id: hardware_and_computing_devices
      label: Hardware & Computing Devices
      specific_costs:
        - Component procurement (chips, displays, batteries, sensors)
        - Contract manufacturing (CM/ODM)
        - Industrial design & engineering R&D
        - Tooling & molds (amortized CapEx)
        - Quality control & testing
        - Warranty reserves & returns
        - Ocean freight & import duties
        - Retail channel & distribution costs
        - Technical support infrastructure

    - id: semiconductors_and_chip_design
      label: Semiconductors & Chip Design
      specific_costs:
        - Chip design labor (RTL engineers, physical design, verification)
        - EDA & design tool software licensing
        - Foundry (fab) costs (TSMC, Samsung, etc.)
        - IP licensing & royalties
        - Mask sets & NRE costs
        - Testing & validation (ATE equipment or services)
        - Sales & field application engineer (FAE) support

    - id: networking_and_telecom_equipment
      label: Networking & Telecom Equipment
      specific_costs:
        - Component sourcing & supply chain
        - Hardware manufacturing (own or contracted)
        - Firmware & embedded software development
        - Testing & standards certification
        - Field service & support infrastructure
        - Sales & channel programs

    - id: it_services_and_consulting
      label: IT Services & Consulting
      specific_costs:
        - Consultant & engineer labor (dominant cost)
        - Subcontractor costs (staff augmentation)
        - Training & certifications
        - Travel & on-site delivery expenses
        - Sales & account management
        - Software tools & development environments
        - Practice area development

    - id: data_and_analytics_platforms
      label: Data & Analytics Platforms
      specific_costs:
        - Engineering & data science labor
        - Data acquisition & licensing
        - Cloud storage & compute infrastructure
        - Sales & marketing
        - Customer success & enablement
        - Security & compliance

    - id: developer_tools_and_platforms
      label: Developer Tools & Platforms
      specific_costs:
        - Engineering labor
        - Cloud infrastructure (often absorbed in free tier)
        - Open source community & documentation investment
        - Developer relations & events
        - Security & uptime SLA infrastructure
        - Enterprise sales (converting OSS users to paid)
```

---

### Sector: Telecommunications & Media

```yaml
sector:
  id: telecommunications_and_media
  label: Telecommunications & Media
  sector_common_costs:
    - Network or content infrastructure
    - Labor
    - Content acquisition or production
    - Customer acquisition & retention
    - Regulatory & spectrum costs
    - Technology platforms

  sub_industries:

    - id: wireless_carriers
      label: Wireless Carriers
      specific_costs:
        - Spectrum license costs (auction or renewal)
        - Tower leases & network infrastructure
        - Network equipment & upgrades (5G buildout)
        - Handset subsidies or device financing programs
        - Customer acquisition & retention marketing
        - Customer service labor & call centers
        - Roaming & interconnect costs
        - Regulatory compliance (FCC)

    - id: broadband_and_isps
      label: Broadband & Internet Service Providers
      specific_costs:
        - Network infrastructure (fiber, coax, fixed wireless)
        - Last-mile installation labor
        - CPE equipment (modems, routers — owned or subsidized)
        - Network maintenance & upgrade
        - Customer acquisition & install labor
        - Customer service
        - Regulatory compliance & universal service contributions

    - id: cable_and_satellite_tv
      label: Cable & Satellite TV
      specific_costs:
        - Content licensing fees (programming costs — very large)
        - Network & headend infrastructure
        - Set-top box hardware & maintenance
        - Customer service & technician labor
        - Satellite or distribution infrastructure
        - Customer acquisition & retention
        - Churn management programs

    - id: streaming_and_digital_media
      label: Streaming & Digital Media
      specific_costs:
        - Content licensing or original production
        - Technology platform & CDN infrastructure
        - Customer acquisition & marketing
        - Payment processing
        - Content moderation (if user-generated content)
        - Rights management & royalty tracking
        - Subtitling & localization

    - id: broadcast_television_and_radio
      label: Broadcast Television & Radio
      specific_costs:
        - Content production or licensing
        - Transmission infrastructure (towers, satellite uplink)
        - On-air talent compensation
        - Ad sales & operations
        - FCC licensing & compliance
        - Studio facilities & equipment

    - id: publishing
      label: Publishing
      notes: Books, magazines, newspapers, trade publications.
      specific_costs:
        - Author advances & royalties
        - Editorial & production labor
        - Printing & physical distribution
        - Digital platform & subscription technology
        - Marketing & publicity
        - Returns from booksellers (physical)
        - Rights & licensing management

    - id: film_and_television_production
      label: Film & Television Production
      specific_costs:
        - Talent (actors, directors, writers)
        - Crew labor (DP, grips, gaffers, art department, etc.)
        - Set construction, dressing & location fees
        - Equipment rental
        - Post-production (editing, VFX, color, sound)
        - Prints & advertising (P&A)
        - Insurance (completion bond, production)
        - Distribution fees

    - id: music_and_audio
      label: Music & Audio
      specific_costs:
        - Artist royalties & advances
        - Recording & studio costs
        - Distribution & streaming royalty splits
        - Marketing & promotion
        - Touring & live performance logistics
        - Music video production
        - Label overhead & A&R scouting

    - id: video_games_and_interactive_entertainment
      label: Video Games & Interactive Entertainment
      specific_costs:
        - Game development labor (engineers, artists, designers, QA)
        - Game engine licensing (Unity, Unreal)
        - Server & online infrastructure (live service games)
        - Marketing & launch spend
        - Platform fees (30% store cut from Apple, Google, Steam, console)
        - QA & localization
        - Post-launch updates & live operations

    - id: advertising_and_marketing_services
      label: Advertising & Marketing Services
      specific_costs:
        - Creative & account labor (dominant cost)
        - Media buying spend (passed through at margin)
        - Technology tools & ad platforms
        - Research & strategy
        - Production (video shoots, photography, design)
        - Client management & new business pitching

    - id: social_media_platforms
      label: Social Media Platforms
      specific_costs:
        - Engineering & product labor
        - Server & data center infrastructure (massive scale)
        - Content moderation labor & AI tools
        - Ad sales & operations
        - User acquisition & growth marketing
        - Legal & regulatory compliance (privacy, antitrust)
        - Creator programs & incentive payments
```

---

### Sector: Professional & Business Services

```yaml
sector:
  id: professional_and_business_services
  label: Professional & Business Services
  sector_common_costs:
    - Professional labor (dominant)
    - Office occupancy
    - Technology & software tools
    - Sales & business development
    - Liability insurance
    - Training & professional development

  sub_industries:

    - id: management_consulting
      label: Management Consulting
      specific_costs:
        - Consultant labor (by far the largest cost)
        - Travel & lodging (client-site delivery)
        - Research & data tool subscriptions
        - Office & infrastructure
        - Business development & proposals
        - Recruiting & training pipeline
        - Professional liability insurance

    - id: legal_services
      label: Legal Services
      specific_costs:
        - Attorney labor
        - Paralegal & support staff
        - Malpractice insurance
        - Legal research tools (Westlaw, Lexis)
        - Office occupancy
        - Court & filing fees (passed through to clients)
        - Business development & referral management

    - id: staffing_and_recruitment
      label: Staffing & Recruitment
      specific_costs:
        - Recruiter & account manager labor
        - Job board & sourcing platform subscriptions
        - Payroll burden for placed workers (temporary staffing)
        - Benefits administration (temp workers)
        - Applicant tracking & CRM systems
        - Employment law compliance

    - id: marketing_and_pr_agencies
      label: Marketing & PR Agencies
      specific_costs:
        - Creative & account labor
        - Media buying (often passed through)
        - Production costs (shoots, design, print)
        - Technology & analytics tools
        - Office & infrastructure
        - New business pitch costs

    - id: research_and_market_intelligence
      label: Research & Market Intelligence
      specific_costs:
        - Analyst & researcher labor
        - Data acquisition, surveys & panel costs
        - Publishing & distribution platform
        - Sales & client management
        - Methodology & quality assurance
        - Conference & event production

    - id: human_resources_services
      label: Human Resources Services
      specific_costs:
        - HR specialist & consultant labor
        - Payroll & HRIS technology
        - Compliance & employment law advisory
        - Training content & delivery platforms
        - Client implementation & onboarding
        - Benefits administration infrastructure

    - id: facilities_management_and_cleaning
      label: Facilities Management & Cleaning
      specific_costs:
        - Cleaning & maintenance crew labor (dominant)
        - Cleaning supplies & chemicals
        - Equipment (vacuums, floor scrubbers)
        - Supervision & scheduling
        - Insurance & bonding
        - Subcontractor specialty services (HVAC, elevator, pest)

    - id: security_services
      label: Security Services
      specific_costs:
        - Guard & patrol officer labor
        - Training, licensing & background checks
        - Uniforms & equipment
        - Technology (cameras, monitoring systems, access control)
        - Insurance & bonding
        - Scheduling & dispatch systems
```

---

### Sector: Hospitality & Food Service

```yaml
sector:
  id: hospitality_and_food_service
  label: Hospitality & Food Service
  sector_common_costs:
    - Labor (service, kitchen, front desk, housekeeping)
    - Food & beverage COGS
    - Facility occupancy
    - Utilities (energy-intensive)
    - Marketing & distribution / OTA fees
    - Insurance

  sub_industries:

    - id: hotels_and_lodging
      label: Hotels & Lodging
      specific_costs:
        - Labor (front desk, housekeeping, maintenance, F&B)
        - OTA & booking platform commissions (Booking.com, Expedia)
        - Utilities
        - Facility maintenance & capital improvements (PIP)
        - Food & beverage COGS
        - Franchise fees & brand standards costs (branded hotels)
        - Sales & marketing
        - Loyalty program liability & redemption
        - Property taxes & insurance

    - id: restaurants_and_fast_food
      label: Restaurants & Fast Food
      specific_costs:
        - Food & beverage COGS (28–35% of revenue typically)
        - Kitchen & front-of-house labor
        - Occupancy (prime locations command premium rent)
        - Utilities (gas, electricity, water)
        - Equipment maintenance
        - Delivery platform fees (Uber Eats, DoorDash — 15–30%)
        - Marketing & local promotions
        - Waste & spoilage
        - Franchise fees (franchised concepts)

    - id: bars_and_nightlife
      label: Bars & Nightlife
      specific_costs:
        - Beverage COGS (alcohol)
        - Labor (bartenders, servers, door staff)
        - Music licensing (ASCAP, BMI, SESAC)
        - Entertainment & talent fees
        - Security
        - Occupancy
        - Liquor license & compliance
        - Late-night operational costs

    - id: catering
      label: Catering
      specific_costs:
        - Food & beverage COGS
        - Event labor (chefs, servers, coordinators)
        - Equipment (owned or rented)
        - Transportation & vehicle costs
        - Venue coordination
        - Waste & spoilage management

    - id: event_venues
      label: Event Venues
      specific_costs:
        - Facility ownership or lease
        - Maintenance & setup labor
        - AV & production equipment
        - Sales & event management labor
        - Utilities
        - Liability insurance
        - Catering equipment (if in-house)

    - id: cruise_lines
      label: Cruise Lines
      specific_costs:
        - Vessel ownership & financing (massive CapEx)
        - Bunker fuel
        - Labor (officers, crew, hospitality staff)
        - Food & beverage COGS
        - Port fees & excursion costs
        - Entertainment & programming
        - Maintenance & drydock
        - Marketing & travel agent commissions

    - id: short_term_rentals
      label: Short-Term Rentals
      specific_costs:
        - Property acquisition or lease cost
        - OTA commissions (Airbnb, VRBO — 3–15%)
        - Cleaning labor between stays
        - Furnishing, décor & maintenance
        - Utilities
        - Dynamic pricing & channel management tools
        - Insurance (short-term rental specific)
        - Property management fees (if third-party managed)
```

---

### Sector: Travel & Tourism

```yaml
sector:
  id: travel_and_tourism
  label: Travel & Tourism
  sector_common_costs:
    - Supplier costs (air, hotel, ground transport)
    - Labor (agents, guides, coordinators)
    - Technology platform & booking systems
    - Marketing & customer acquisition
    - Commission & referral economics

  sub_industries:

    - id: travel_agencies_and_booking_platforms
      label: Travel Agencies & Booking Platforms
      specific_costs:
        - Technology & booking infrastructure
        - Supplier content & contract management
        - Customer acquisition & marketing
        - Labor (agents, customer support)
        - Payment processing
        - GDS (global distribution system) fees
        - Commission economics & override management

    - id: tour_operators
      label: Tour Operators
      specific_costs:
        - Ground transport & logistics
        - Guide labor (local & specialist)
        - Accommodation block bookings
        - Attraction & entry fees
        - Insurance & liability
        - Marketing & travel agent commissions
        - Currency & foreign exchange risk management

    - id: destination_marketing
      label: Destination Marketing
      specific_costs:
        - Marketing & advertising spend
        - Tourism board labor
        - Event sponsorship & activation
        - Visitor research & data analytics
        - Agency & creative production costs
        - Stakeholder & industry relations

    - id: adventure_and_eco_tourism
      label: Adventure & Eco-Tourism
      specific_costs:
        - Specialized guide labor & certification
        - Safety equipment & maintenance
        - Insurance & liability (higher risk activities)
        - Permits & conservation fees
        - Remote logistics & transportation
        - Off-grid accommodation costs

    - id: theme_parks_and_attractions
      label: Theme Parks & Attractions
      specific_costs:
        - Facility maintenance & capital refresh (rides, shows)
        - Labor (ride operators, entertainment, safety)
        - Energy & utilities (large consumption)
        - Entertainment licensing (IP, characters)
        - Marketing & media spend
        - Food & merchandise COGS
        - Insurance (accident liability)
        - Seasonal staffing ramp costs
```

---

### Sector: Consumer & Personal Services

```yaml
sector:
  id: consumer_and_personal_services
  label: Consumer & Personal Services
  sector_common_costs:
    - Service labor
    - Supplies & consumables
    - Occupancy
    - Scheduling & booking technology
    - Insurance
    - Local marketing & referrals

  sub_industries:

    - id: personal_care_and_beauty
      label: Personal Care & Beauty
      specific_costs:
        - Stylist or esthetician labor (or booth rental revenue share)
        - Product & supply COGS (color, treatments, tools)
        - Equipment (chairs, stations, dryers)
        - Facility lease
        - Booking & salon management software
        - Marketing & social media presence
        - Continuing education & certifications

    - id: fitness_and_wellness
      label: Fitness & Wellness
      specific_costs:
        - Trainer & instructor labor
        - Large facility lease (significant for gyms)
        - Equipment purchase & maintenance
        - Member management & class booking software
        - Marketing & referral programs
        - Utilities (showers, climate control)
        - Towel service & amenities

    - id: dry_cleaning_and_laundry
      label: Dry Cleaning & Laundry
      specific_costs:
        - Cleaning chemicals & solvents (PERC or alternatives)
        - Dry cleaning & pressing equipment
        - Labor
        - Facility lease
        - Utilities (water, gas, electricity)
        - Packaging materials (bags, hangers)
        - Environmental compliance (solvent handling)

    - id: pet_care_and_veterinary
      label: Pet Care & Veterinary Services
      specific_costs:
        - Veterinarian & technician labor
        - Medications, vaccines & supplies
        - Diagnostic equipment (X-ray, ultrasound)
        - Facility lease
        - Malpractice & liability insurance
        - Boarding & grooming supplies
        - Marketing & appointment management

    - id: funeral_and_memorial_services
      label: Funeral & Memorial Services
      specific_costs:
        - Funeral director labor
        - Caskets, urns & merchandise (COGS)
        - Preparation & embalming supplies
        - Facility (chapel, preparation room, crematory)
        - Vehicle fleet (hearse, family car)
        - Regulatory licensing
        - Pre-need sales & trust management

    - id: repair_and_maintenance_services
      label: Repair & Maintenance Services
      notes: Home, auto, electronics, appliance repair.
      specific_costs:
        - Technician labor
        - Parts & components (COGS)
        - Tools & diagnostic equipment
        - Service vehicle & fuel
        - Warranty & rework costs
        - Dispatch & scheduling software
        - Insurance
```

---

### Sector: Arts, Culture & Sports

```yaml
sector:
  id: arts_culture_and_sports
  label: Arts, Culture & Sports
  sector_common_costs:
    - Talent & creative labor
    - Venue or facility
    - Production costs
    - Marketing & ticket/audience development
    - Rights & licensing
    - Insurance

  sub_industries:

    - id: professional_sports
      label: Professional Sports Leagues & Teams
      specific_costs:
        - Player salaries & contracts (dominant cost)
        - Coaching & front office labor
        - Facility lease or arena/stadium ownership costs
        - Travel (charter flights, hotels)
        - Medical, training & sports science staff
        - Marketing & game operations
        - Revenue sharing & league fees
        - Player development & minor league costs
        - Scouting & analytics

    - id: live_events_and_concerts
      label: Live Events & Concerts
      specific_costs:
        - Talent fees & guarantees
        - Venue rental
        - Production (stage, sound, lighting, rigging)
        - Marketing & promotion
        - Ticketing platform fees
        - Security & crowd management
        - Insurance (event cancellation, liability)
        - Merchandise & concession COGS

    - id: museums_and_galleries
      label: Museums & Galleries
      specific_costs:
        - Curatorial & educational labor
        - Facility maintenance & operations
        - Collection care & conservation
        - Insurance (collection & liability)
        - Exhibition production & touring loan fees
        - Marketing & membership development
        - Retail & food service COGS
        - Grant administration & fundraising costs

    - id: performing_arts
      label: Performing Arts
      notes: Theater, opera, dance, symphony.
      specific_costs:
        - Performer & production labor
        - Venue lease or ownership
        - Set, costume & production design
        - Rehearsal costs
        - Marketing, PR & box office
        - Touring logistics
        - Rights & licensing (scripts, scores)
        - Fundraising & development

    - id: gaming_and_esports
      label: Gaming & Esports
      specific_costs:
        - Prize pools & player contracts
        - Event production & broadcast
        - Streaming & broadcast infrastructure
        - Sponsorship & rights management
        - Marketing & fan engagement
        - Team operations & facilities
        - League fees & sanction costs

    - id: recreation_and_amusement_parks
      label: Recreation & Amusement Parks
      specific_costs:
        - Facility & ride maintenance
        - Labor (operations, entertainment, safety)
        - Ride inspection & compliance costs
        - Insurance (accident liability — significant)
        - Food & merchandise COGS
        - Marketing & seasonal promotion
        - Seasonal staffing ramp & training
```

---

### Sector: Nonprofit & Social Sector

```yaml
sector:
  id: nonprofit_and_social_sector
  label: Nonprofit & Social Sector
  sector_common_costs:
    - Program labor
    - Fundraising & development costs
    - Administrative overhead
    - Facilities
    - Technology & CRM systems
    - Grant compliance & reporting

  sub_industries:

    - id: charitable_foundations
      label: Charitable Foundations
      specific_costs:
        - Grant-making administration
        - Investment management fees
        - Program officer labor
        - Legal & compliance (Form 990, IRS)
        - Donor relations & stewardship
        - Operating overhead

    - id: religious_organizations
      label: Religious Organizations
      specific_costs:
        - Clergy & pastoral staff labor
        - Facility maintenance & capital
        - Programming & outreach costs
        - Benevolence & direct community services
        - Utilities
        - Communications & media

    - id: advocacy_and_policy_organizations
      label: Advocacy & Policy Organizations
      specific_costs:
        - Policy research & analyst labor
        - Lobbying & government affairs costs
        - Communications & media relations
        - Fundraising & donor development
        - Coalition management
        - Events & convenings

    - id: social_services_and_community_organizations
      label: Social Services & Community Organizations
      specific_costs:
        - Caseworker & program staff labor
        - Direct client services & aid (cash, vouchers, goods)
        - Facility lease
        - Transportation for clients or staff
        - Fundraising & donor outreach
        - Government contract compliance & reporting

    - id: international_aid_and_development
      label: International Aid & Development
      specific_costs:
        - Field program labor (expatriate & local national)
        - Local partner grants & subcontracts
        - Logistics (often remote or difficult terrain)
        - Security in conflict zones
        - Compliance & audit (USAID, UN, EU requirements)
        - Communications infrastructure & reporting

    - id: membership_associations_and_trade_groups
      label: Membership Associations & Trade Groups
      specific_costs:
        - Staff labor (executive, programs, communications)
        - Conference & event production
        - Member communications & publications
        - Government affairs & lobbying
        - Technology (member portal, LMS, CRM)
        - Volunteer coordination & governance
```

---

## Part 4: Cost Classification Reference

Use this table to tag each cost item in the app with standardized classification metadata.

```yaml
cost_classifications:

  by_nature:
    - id: cogs
      label: Cost of Goods Sold (COGS)
      description: Direct costs incurred in producing goods or delivering services. Sits above gross profit line.
    - id: opex
      label: Operating Expense (OpEx)
      description: Ongoing costs of running the business. Sits below gross profit line.
    - id: capex
      label: Capital Expenditure (CapEx)
      description: Investment in long-lived assets. Capitalized and depreciated over time, not expensed immediately.

  by_behavior:
    - id: fixed
      label: Fixed
      description: Does not vary with output or revenue in the short run. Examples: rent, base salaries, insurance premiums.
    - id: variable
      label: Variable
      description: Scales directly with output or revenue. Examples: raw materials, sales commissions, delivery costs.
    - id: semi_fixed
      label: Semi-Fixed (Step Cost)
      description: Fixed within a range, then steps up when capacity thresholds are crossed. Examples: adding a shift, a new facility, a new sales team.

  by_controllability:
    - id: discretionary
      label: Discretionary
      description: Can be reduced or eliminated in the short term without immediately impairing operations. Examples: marketing, training, travel.
    - id: committed
      label: Committed
      description: Difficult to reduce without restructuring. Examples: lease obligations, debt service, core headcount.
    - id: mandated
      label: Mandated
      description: Required by law, contract, or regulation. Examples: payroll taxes, environmental permits, licensing fees.

  by_cash_timing:
    - id: cash_on_delivery
      label: Cash on Delivery
      description: Paid as incurred. Examples: utilities, supplies, contractor fees.
    - id: prepaid
      label: Prepaid
      description: Paid in advance, recognized over time. Examples: annual software licenses, insurance premiums.
    - id: accrued
      label: Accrued
      description: Recognized before cash payment. Examples: earned but unpaid wages, warranty reserves, legal contingencies.
    - id: deferred
      label: Deferred / Depreciated
      description: Capital expenditure recognized over asset life. Examples: equipment depreciation, amortization of IP.
```

---

## Part 5: App Implementation Notes

```yaml
implementation_guidance:

  template_construction:
    - When a user selects an industry + sub-industry, load:
        1. Universal costs (always included as default line items)
        2. Near-universal costs (included by default, toggleable off)
        3. Sector common costs (included by default)
        4. Sub-industry specific costs (included by default)
    - Allow users to add custom cost line items not in the template.
    - Allow users to remove any pre-populated item.

  cost_item_schema:
    fields:
      - id: string (slug)
      - label: string (display name)
      - description: string (tooltip / help text)
      - category: string (which group it belongs to)
      - cost_type: enum [fixed, variable, semi-fixed, capital]
      - cogs_or_opex: enum [cogs, opex, capex, both]
      - prevalence: enum [universal, near-universal, common, selective]
      - amount: number (user input)
      - unit: enum [annual, monthly, per-unit, percentage-of-revenue]
      - notes: string (user annotation)

  grouping_suggestions:
    - Group line items by: Labor | Facilities & Occupancy | Technology | Materials & COGS |
        Marketing & Sales | Compliance & Legal | Capital & Financing | Other
    - Allow alternate grouping by: Fixed vs. Variable | COGS vs. OpEx | Discretionary vs. Committed

  prioritization:
    - Surface labor, occupancy, and COGS first — they are the dominant costs in most industries.
    - Flag items with high industry-specific prevalence so users don't miss them.
    - Highlight unique costs (e.g. floor plan financing for auto dealers, spectrum for telcos)
        that differentiate the economics of that industry.

  data_quality_notes:
    - All cost items are qualitative categories, not amounts.
    - Amounts should be user-entered or connected to benchmarking data sources separately.
    - Sub-industry costs inherit sector common costs — avoid double-counting in templates.
    - Some costs appear in both COGS and OpEx depending on business model
        (e.g. labor is COGS for a services firm, OpEx for a SaaS company).
```
