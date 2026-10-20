import { readLogo } from '../../lib/brandLogo'
import { texts } from '../../texts'

type LogoProps = {
  size?: number
  shadow?: boolean
  /** 보여 줄 로고 이미지. 없으면 사이드바에서 올려 둔 로고를, 그것도 없으면 기본 로고를 보여 준다 */
  src?: string
}

/** 서비스 로고. 모든 화면에서 같은 로고를 쓴다 */
export function Logo({ size = 28, shadow = false, src }: LogoProps) {
  const image = src ?? readLogo()
  if (image) {
    return (
      <img
        src={image}
        alt={texts.common.logoAlt}
        width={size}
        height={size}
        className="shrink-0 object-cover"
        style={{ width: size, height: size, borderRadius: size * 0.22, ...(shadow ? { filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.14))' } : undefined) }}
      />
    )
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      role="img"
      aria-label={texts.common.logoAlt}
      className="shrink-0"
      style={shadow ? { filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.14))' } : undefined}
    >
      <rect x="4" y="4" width="80" height="80" rx="19" fill="var(--color-navy)" />
      <path
        d="M31 24h17c7.2 0 12 4 12 10 0 3.8-2 6.6-5.2 8 4.6 1.4 7.2 4.8 7.2 9.4 0 6.6-5 10.6-13 10.6H31V24zm8 8v8.8h8.2c3 0 4.8-1.8 4.8-4.4S50.2 32 47.2 32H39zm0 15.2V56h9.2c3.4 0 5.4-1.8 5.4-4.6 0-2.8-2-4.2-5.4-4.2H39z"
        fill="#fff"
      />
    </svg>
  )
}
