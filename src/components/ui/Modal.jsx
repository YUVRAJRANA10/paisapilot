import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
}) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    full: 'max-w-full',
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6',
          sizes[size],
          className
        )}
      >
        <div className="bg-surface-container-lowest rounded-xl border border-outline/30 shadow-modal flex flex-col">
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-outline/30">
              <h3 className="headline-lg text-headline-lg text-on-surface font-semibold">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className={cn('p-6', title ? 'pb-6' : '')}>{children}</div>
          {footer && <div className="p-6 border-t border-outline/30 bg-surface-container-low">{footer}</div>}
        </div>
      </div>
    </>,
    document.body
  )
}