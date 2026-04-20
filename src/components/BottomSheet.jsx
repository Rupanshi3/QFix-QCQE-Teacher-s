import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { X } from '@phosphor-icons/react'

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  floatingCloseButton = true,
}) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="bottom"
        showCloseButton={!floatingCloseButton}
        className="rounded-t-xl px-0 pb-8 max-h-[90%] overflow-visible"
      >
        {floatingCloseButton && (
          <SheetClose
            className="absolute right-4 top-0 z-10 flex h-11 w-11 -translate-y-[calc(100%+12px)] items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform active:scale-95"
            aria-label="Close"
          >
            <X size={20} weight="bold" />
          </SheetClose>
        )}
        <div className="max-h-[90vh] overflow-y-auto">
          {title && (
            <SheetHeader className="sticky top-0 z-10 bg-background px-4 pb-3 border-b border-border text-left">
              <SheetTitle className="text-[18px] font-semibold text-foreground">{title}</SheetTitle>
              {subtitle && (
                <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
              )}
            </SheetHeader>
          )}
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
