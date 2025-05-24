import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#ffffff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.667 8A6.669 6.669 0 0 1 8 14.666c-3.68 0-5.926-3.706-5.926-3.706m0 0h3.013m-3.013 0v3.333M1.334 8c0-3.68 2.96-6.667 6.666-6.667 4.447 0 6.667 3.707 6.667 3.707m0 0V1.706m0 3.334h-2.96"
    />
  </Svg>
);
export default SvgComponent;
