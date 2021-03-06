import { getWeb3 } from "../store/interactions/metamask";

export const multiplyBigNumbers = (a, b) => {
  const bn = getWeb3().utils.BN;
  return new bn(a).mul(new bn(b));
};

export const subBigNumbers = (a, b) => {
  const bn = getWeb3().utils.BN;
  return new bn(a).sub(new bn(b));
};
