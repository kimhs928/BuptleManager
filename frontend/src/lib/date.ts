const pad = (n: number) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD HH:mm' */
export function formatDateTime(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 'YYYY-MM-DD HH:mm:ss' */
export function formatDateTimeSec(d: Date = new Date()): string {
  return `${formatDateTime(d)}:${pad(d.getSeconds())}`
}

/** 'HH:mm:ss' */
export function formatTime(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
