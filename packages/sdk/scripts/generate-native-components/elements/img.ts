import {
  attr,
  createSchema,
  CROSS_ORIGIN_VALUES,
  DECODING_VALUES,
  FETCH_PRIORITY_VALUES,
  LOADING_VALUES,
  numberOrString,
  REFERRER_POLICY_VALUES,
} from "./globals";

export const imgSchema = createSchema<HTMLImageElement>("img", {
  alt: attr.string,
  crossOrigin: attr.enum(...CROSS_ORIGIN_VALUES),
  decoding: attr.enum(...DECODING_VALUES),
  fetchPriority: attr.enum(...FETCH_PRIORITY_VALUES),
  height: numberOrString,
  isMap: attr.boolean,
  loading: attr.enum(...LOADING_VALUES),
  referrerPolicy: attr.enum(...REFERRER_POLICY_VALUES),
  sizes: attr.string,
  src: attr.string,
  srcSet: attr.string,
  useMap: attr.string,
  width: numberOrString,
});
