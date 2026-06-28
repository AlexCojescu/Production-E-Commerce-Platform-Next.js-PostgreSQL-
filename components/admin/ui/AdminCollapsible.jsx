'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminCollapsible({
  trigger,
  children,
  defaultOpen = false,
  className,
  contentClassName,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center text-left transition-colors hover:bg-slate-50/80 max-lg:min-h-14"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">{trigger}</div>
        <span className="flex shrink-0 items-center justify-center self-stretch px-3 max-lg:min-h-11 max-lg:min-w-11 lg:px-5">
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen && (
        <div className={cn('border-t border-slate-100', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
