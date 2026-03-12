import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export default function BottomSheet({ isOpen, onClose, children, title }) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="bottom"
        className="rounded-t-xl px-0 pb-8 max-h-[90%] overflow-y-auto"
      >
        <div className="flex justify-center pt-1 pb-2">
          <div className="w-9 h-1 bg-muted rounded-full" />
        </div>
        {title && (
          <SheetHeader className="px-4 pb-3 border-b border-border text-left">
            <SheetTitle className="text-[18px] font-semibold text-foreground">{title}</SheetTitle>
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  )
}
