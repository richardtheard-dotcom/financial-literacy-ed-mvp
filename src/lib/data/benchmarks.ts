export interface BenchmarkEntry {
  label: string;
  vulnerabilityIndex: string;
  emergencyFundRate: number;
  billStrainRate: number;
}

export interface StateMeta {
  stateName: string;
  strainLabel: string;
}

export interface BenchmarkMap {
  under35000: BenchmarkEntry;
  middle: BenchmarkEntry;
  "100000plus": BenchmarkEntry;
  states: Record<string, StateMeta>;
}

export const BENCHMARKS: BenchmarkMap = {
  under35000: {
    label: "Under $35,000 / year",
    vulnerabilityIndex: "High",
    emergencyFundRate: 18,
    billStrainRate: 52,
  },
  middle: {
    label: "$35,000–$99,999 / year",
    vulnerabilityIndex: "Moderate",
    emergencyFundRate: 38,
    billStrainRate: 31,
  },
  "100000plus": {
    label: "$100,000+ / year",
    vulnerabilityIndex: "Low",
    emergencyFundRate: 61,
    billStrainRate: 14,
  },
  states: {
    AL: { stateName: "Alabama", strainLabel: "moderate rural strain" },
    AK: { stateName: "Alaska", strainLabel: "high cost-of-living context" },
    AZ: { stateName: "Arizona", strainLabel: "moderate desert-region context" },
    AR: { stateName: "Arkansas", strainLabel: "moderate rural strain" },
    CA: { stateName: "California", strainLabel: "high cost-of-living strain" },
    CO: { stateName: "Colorado", strainLabel: "moderate urban pressure" },
    CT: { stateName: "Connecticut", strainLabel: "high housing cost pressure" },
    DE: { stateName: "Delaware", strainLabel: "moderate regional context" },
    FL: { stateName: "Florida", strainLabel: "moderate housing pressure" },
    GA: { stateName: "Georgia", strainLabel: "moderate urban-rural mix" },
    HI: { stateName: "Hawaii", strainLabel: "very high cost-of-living pressure" },
    ID: { stateName: "Idaho", strainLabel: "moderate growth-strain context" },
    IL: { stateName: "Illinois", strainLabel: "moderate urban context" },
    IN: { stateName: "Indiana", strainLabel: "moderate midwestern context" },
    IA: { stateName: "Iowa", strainLabel: "low regional strain" },
    KS: { stateName: "Kansas", strainLabel: "low regional strain" },
    KY: { stateName: "Kentucky", strainLabel: "moderate rural strain" },
    LA: { stateName: "Louisiana", strainLabel: "high vulnerability index" },
    ME: { stateName: "Maine", strainLabel: "moderate rural context" },
    MD: { stateName: "Maryland", strainLabel: "moderate DC-adjacent pressure" },
    MA: { stateName: "Massachusetts", strainLabel: "high housing cost pressure" },
    MI: { stateName: "Michigan", strainLabel: "moderate industrial context" },
    MN: { stateName: "Minnesota", strainLabel: "moderate northern context" },
    MS: { stateName: "Mississippi", strainLabel: "high vulnerability index" },
    MO: { stateName: "Missouri", strainLabel: "moderate midwestern context" },
    MT: { stateName: "Montana", strainLabel: "moderate rural context" },
    NE: { stateName: "Nebraska", strainLabel: "low regional strain" },
    NV: { stateName: "Nevada", strainLabel: "moderate desert-region context" },
    NH: { stateName: "New Hampshire", strainLabel: "moderate New England context" },
    NJ: { stateName: "New Jersey", strainLabel: "high housing cost pressure" },
    NM: { stateName: "New Mexico", strainLabel: "high vulnerability index" },
    NY: { stateName: "New York", strainLabel: "high housing cost pressure" },
    NC: { stateName: "North Carolina", strainLabel: "moderate growth-strain context" },
    ND: { stateName: "North Dakota", strainLabel: "low regional strain" },
    OH: { stateName: "Ohio", strainLabel: "moderate midwestern context" },
    OK: { stateName: "Oklahoma", strainLabel: "moderate regional context" },
    OR: { stateName: "Oregon", strainLabel: "moderate coastal pressure" },
    PA: { stateName: "Pennsylvania", strainLabel: "moderate urban-rural mix" },
    RI: { stateName: "Rhode Island", strainLabel: "moderate New England context" },
    SC: { stateName: "South Carolina", strainLabel: "moderate coastal context" },
    SD: { stateName: "South Dakota", strainLabel: "low regional strain" },
    TN: { stateName: "Tennessee", strainLabel: "moderate southern context" },
    TX: { stateName: "Texas", strainLabel: "moderate regional context" },
    UT: { stateName: "Utah", strainLabel: "moderate growth-strain context" },
    VT: { stateName: "Vermont", strainLabel: "moderate rural context" },
    VA: { stateName: "Virginia", strainLabel: "moderate DC-adjacent pressure" },
    WA: { stateName: "Washington", strainLabel: "high cost-of-living strain" },
    WV: { stateName: "West Virginia", strainLabel: "high vulnerability index" },
    WI: { stateName: "Wisconsin", strainLabel: "moderate midwestern context" },
    WY: { stateName: "Wyoming", strainLabel: "moderate rural context" },
    DC: { stateName: "Washington DC", strainLabel: "high cost-of-living strain" },
  },
};

export function getBenchmark(incomeBand: string): BenchmarkEntry {
  return (
    BENCHMARKS[incomeBand as keyof typeof BENCHMARKS] as BenchmarkEntry | undefined
  ) ?? BENCHMARKS.middle;
}

export function getStateMeta(stateCode: string): StateMeta {
  return (
    BENCHMARKS.states[stateCode.toUpperCase()] ?? {
      stateName: stateCode || "Unknown",
      strainLabel: "unmapped context",
    }
  );
}
