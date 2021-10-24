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
  },
  REGB: {
    label: "Region B",
    hash: "0x21290c1673114a467f359bea4acbd275ebb6a625b8e396fcc2f31aa1156ee9da",
  },
  REGC: {
    label: "Region C",
    hash: "0xfd7390ed5edb709a122c8fa5e94118faa5b2e11e1714c700c6cb99a82e5315c4",
  },
};

export const SEVERITY = {
  D0: {
    label: "Abnormally Dry",
  },
  D1: {
    label: "Moderate Drought",
  },
  D2: {
    label: "Severe Drought",
  },
  D3: {
    label: "Extreme Drought",
  },
  D4: {
    label: "Exceptional Drought",
  },
};
