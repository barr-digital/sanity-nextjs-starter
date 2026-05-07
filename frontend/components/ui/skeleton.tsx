import { cn } from '@/utils/cn'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-neutral-100', className)}
      {...props}
    />
  )
}
