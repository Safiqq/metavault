import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.336 10.75v3.5c0 2.917-1.167 4.084-4.083 4.084h-3.5c-2.917 0-4.084-1.167-4.084-4.084v-3.5c0-2.916 1.167-4.083 4.084-4.083h3.5c2.916 0 4.083 1.167 4.083 4.083Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.336 5.75v3.5c0 2.917-1.167 4.084-4.083 4.084h-.917V10.75c0-2.916-1.167-4.083-4.083-4.083H6.669V5.75c0-2.916 1.167-4.083 4.084-4.083h3.5c2.916 0 4.083 1.167 4.083 4.083Z"
    />
  </Svg>
);
export default SvgComponent;
