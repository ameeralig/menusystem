
import { EyesLoader } from "./eyes-loader";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({ size = "sm", ...props }: SpinnerProps) => {
  return <EyesLoader size={size} {...props} />;
};
