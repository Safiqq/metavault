import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const SvgComponent = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 16 16" {...props}>
    <Path
      stroke={props.color || "#000000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14 3.987a67.801 67.801 0 0 0-6.68-.334c-1.32 0-2.64.067-3.96.2L2 3.987M5.667 3.313l.146-.873C5.92 1.807 6 1.333 7.127 1.333h1.746c1.127 0 1.213.5 1.314 1.114l.146.866M12.566 6.093l-.433 6.714c-.073 1.046-.133 1.86-1.993 1.86H5.86c-1.86 0-1.92-.814-1.994-1.86l-.433-6.714M6.887 11h2.22M6.333 8.333h3.334"
    />
  </Svg>
);
export default SvgComponent;
