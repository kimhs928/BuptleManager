export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className="inline-block animate-spin rounded-full border-2 border-white/40 border-t-white"
      style={{ width: size, height: size }}
    />
  )
}
