interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

function getInitials(name: string): string {
  const chars = Array.from(name)
  if (chars.length === 0) return '?'
  return chars.slice(0, 2).join('')
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
}

export default function InitialAvatar({ name, size = 'md' }: Props) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}
