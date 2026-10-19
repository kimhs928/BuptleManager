const pad = (n: number) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD HH:mm' */
export function formatDateTime(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 'HH:mm:ss' */
export function formatTime(d: Date = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
