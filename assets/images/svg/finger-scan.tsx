import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={60} height={60} fill="none" viewBox="0 0 60 60" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M30 37.2a4.13 4.13 0 0 1-4.125-4.125V26.9A4.13 4.13 0 0 1 30 22.775a4.13 4.13 0 0 1 4.125 4.125v6.175A4.13 4.13 0 0 1 30 37.2Z"
      opacity={0.4}
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M42.45 33.675c-.5 6.45-5.9 11.5-12.45 11.5-6.9 0-12.5-5.6-12.5-12.5v-5.35c0-6.9 5.6-12.5 12.5-12.5 6.475 0 11.8 4.925 12.425 11.225"
      opacity={0.4}
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M37.5 5h5C50 5 55 10 55 17.5v5M5 22.5v-5C5 10 10 5 17.5 5h5M37.5 55h5C50 55 55 50 55 42.5v-5M5 37.5v5C5 50 10 55 17.5 55h5"
    />
  </Svg>
);
export default SvgComponent;
