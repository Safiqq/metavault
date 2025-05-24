import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={160} height={160} fill="none" viewBox="0 0 160 160" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M139.4 74.133c0 32.6-23.667 63.134-56 72.067-2.2.6-4.6.6-6.8 0-32.333-8.933-56-39.467-56-72.067V44.867c0-5.467 4.133-11.667 9.267-13.734L67 15.933a34.582 34.582 0 0 1 26.067 0l37.133 15.2c5.067 2.067 9.267 8.267 9.267 13.734l-.067 29.266Z"
    />
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={4}
      d="M80 83.333c7.364 0 13.333-5.97 13.333-13.333 0-7.364-5.97-13.333-13.333-13.333-7.364 0-13.333 5.97-13.333 13.333 0 7.364 5.97 13.333 13.333 13.333ZM80 83.333v20"
    />
  </Svg>
);
export default SvgComponent;
