import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 20 20" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.742 1.859 4.583 3.425c-.958.359-1.741 1.492-1.741 2.509v6.192c0 .983.65 2.274 1.441 2.866l3.584 2.675c1.175.883 3.108.883 4.283 0l3.583-2.675c.792-.592 1.442-1.883 1.442-2.867V5.935c0-1.025-.783-2.159-1.742-2.517L11.276 1.86c-.708-.259-1.842-.259-2.533 0Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m7.542 9.892 1.341 1.342 3.584-3.584"
    />
  </Svg>
);
export default SvgComponent;
