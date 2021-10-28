export const ZERO_ACCOUNT = "0x0000000000000000000000000000000000000000";

export const SEASON_STATE = {
  0: "DEFAULT",
  1: "OPEN",
  2: "CLOSED",
  DEFAULT: {
    label: "Default",
  },
  OPEN: {
    label: "Open",
  },
  CLOSED: {
    label: "Closed",
  },
};

export const REGIONS_HASHES = {
  "0xe71fecfa275a7836d52f097836b6b052b220d4521a9d382fca4ee4c28783760c": "REGA",
  "0x21290c1673114a467f359bea4acbd275ebb6a625b8e396fcc2f31aa1156ee9da": "REGB",
  "0xfd7390ed5edb709a122c8fa5e94118faa5b2e11e1714c700c6cb99a82e5315c4": "REGC",
};

export const REGIONS = {
  REGA: {
    label: "Region A",
    hash: "0xe71fecfa275a7836d52f097836b6b052b220d4521a9d382fca4ee4c28783760c",
    keyName: "REGA",
  },
  REGB: {
    label: "Region B",
    hash: "0x21290c1673114a467f359bea4acbd275ebb6a625b8e396fcc2f31aa1156ee9da",
    keyName: "REGB",
  },
  REGC: {
    label: "Region C",
    hash: "0xfd7390ed5edb709a122c8fa5e94118faa5b2e11e1714c700c6cb99a82e5315c4",
    keyName: "REGC",
  },
};

export const SEVERITY = {
  D: {
    label: "Default",
    value: "0",
    keyName: "D",
  },
  D0: {
    label: "Abnormally Dry",
    value: "1",
    keyName: "D0",
  },
  D1: {
    label: "Moderate Drought",
    value: "2",
    keyName: "D1",
  },
  D2: {
    label: "Severe Drought",
    value: "3",
    keyName: "D2",
  },
  D3: {
    label: "Extreme Drought",
    value: "4",
    keyName: "D3",
  },
  D4: {
    label: "Exceptional Drought",
    value: "5",
    keyName: "D4",
  },
};

export const SEVERITY_VALUES = {
  0: "D",
  1: "D0",
  2: "D1",
  3: "D2",
  4: "D3",
  5: "D4",
};

export const FARMS_HASHES = {
  "0xca5bb4a9f0619904f63c1dac333b02f34b02642811721ac526f4eb679203b35d": "FARM1",
  "0x3ee3946d8cd7a8eea7e658c0a01f5c2512634303de54e9f177ef97c269d403cf": "FARM2",
  "0x12388371dbdb706b9475443244a3705c3fe47f3dc791c2d40a023fba03f35915": "FARM3",
  "0x92c07225f38425966baa97330cf41cecf622e7424d347b72474e3e8cbf3c5898": "FARM4",
  "0x8fc641594078f7bb5dec106ae04d315ad9a8e72c06fea8fcd8946bf7d35e5cc6": "FARM5",
};

export const FARMS = {
  FARM1: {
    label: "FARM 1",
    hash: "0xca5bb4a9f0619904f63c1dac333b02f34b02642811721ac526f4eb679203b35d",
    keyName: "FARM1",
  },
  FARM2: {
    label: "FARM 2",
    hash: "0x3ee3946d8cd7a8eea7e658c0a01f5c2512634303de54e9f177ef97c269d403cf",
    keyName: "FARM2",
  },
  FARM3: {
    label: "FARM 3",
    hash: "0x12388371dbdb706b9475443244a3705c3fe47f3dc791c2d40a023fba03f35915",
    keyName: "FARM3",
  },
  FARM4: {
    label: "FARM 4",
    hash: "0x92c07225f38425966baa97330cf41cecf622e7424d347b72474e3e8cbf3c5898",
    keyName: "FARM4",
  },
  FARM5: {
    label: "FARM 5",
    hash: "0x8fc641594078f7bb5dec106ae04d315ad9a8e72c06fea8fcd8946bf7d35e5cc6",
    keyName: "FARM5",
  },
};

export const CONTRACT = {
  DEFAULT: {
    label: "Default",
    value: "0",
    keyName: "DEFAULT",
  },
  REGISTERED: {
    label: "Registered",
    value: "1",
    keyName: "REGISTERED",
  },
  VALIDATED: {
    label: "Validated",
    value: "2",
    keyName: "VALIDATED",
  },
  INSURED: {
    label: "Insured",
    value: "3",
    keyName: "INSURED",
  },
  CLOSED: {
    label: "Closed",
    value: "4",
    keyName: "CLOSED",
  },
  COMPENSATED: {
    label: "Compensated",
    value: "5",
    keyName: "COMPENSATED",
  },
};

export const CONTRACT_VALUES = {
  0: "DEFAULT",
  1: "REGISTERED",
  2: "VALIDATED",
  3: "INSURED",
  4: "CLOSED",
  5: "COMPENSATED",
};

export const CONTRACT_ACTIONS = {
  NONE: {
    keyName: "NONE",
  },
  VALIDATE: {
    keyName: "VALIDATE",
    label: "Validate",
  },
  ACTIVATE: {
    keyName: "ACTIVATE",
    label: "Activate",
  },
};
