import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={60} height={60} fill="none" viewBox="0 0 60 60" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5 22.5v-6.25C5 10.025 10.025 5 16.25 5h6.25M37.5 5h6.25C49.975 5 55 10.025 55 16.25v6.25M55 40v3.75C55 49.975 49.975 55 43.75 55H40M22.5 55h-6.25A11.235 11.235 0 0 1 5 43.75V37.5"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M21.25 27.5a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5ZM18.75 45a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM41.25 22.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM38.75 45a6.25 6.25 0 1 0 0-12.5 6.25 6.25 0 0 0 0 12.5Z"
      opacity={0.4}
    />
  </Svg>
);
export default SvgComponent;
