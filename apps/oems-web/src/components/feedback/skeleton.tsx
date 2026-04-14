interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
  readonly className?: string;
}

export const Skeleton = ({ className, height = "1rem", width = "100%" }: SkeletonProps) => (
  <span
    aria-hidden
    className={`oems-skeleton${className ? ` ${className}` : ""}`}
    style={{ height, width }}
  />
);
