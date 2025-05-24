import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={60} height={60} fill="none" viewBox="0 0 60 60" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 25v-5c0-8.275 2.5-15 15-15s15 6.725 15 15v5M30 46.25a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5Z"
      opacity={0.4}
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M42.5 55h-25C7.5 55 5 52.5 5 42.5v-5C5 27.5 7.5 25 17.5 25h25c10 0 12.5 2.5 12.5 12.5v5c0 10-2.5 12.5-12.5 12.5Z"
    />
  </Svg>
);
export default SvgComponent;
