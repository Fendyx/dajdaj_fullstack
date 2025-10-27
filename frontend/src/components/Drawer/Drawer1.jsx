import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"

export function Drawer({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export const DrawerTrigger = Dialog.Trigger

export function DrawerContent({ children }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40" />
      <Dialog.Content
        className="
          fixed bottom-0 left-0 right-0 z-50
          rounded-t-2xl bg-white p-4 shadow-lg
          animate-[slideInUp_0.25s_ease-out]
        "
      >
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-300" />
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export const DrawerTitle = Dialog.Title
export const DrawerDescription = Dialog.Description
export const DrawerClose = Dialog.Close
