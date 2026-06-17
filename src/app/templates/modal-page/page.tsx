import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ModalPageTemplate() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modal Page Template</h1>
      <Dialog>
        <DialogTrigger className="vx-cta">Open Modal</DialogTrigger>
        <DialogContent className="sm:max-w-[640px] bg-background border-white/10">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
          <DialogHeader>
            <DialogTitle>Modal Title</DialogTitle>
            <DialogDescription>
              This is a modal dialog. You can use it for forms, information, or confirmations.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <p>Modal content goes here.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary">Cancel</Button>
            <Button type="button" className="vx-cta">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
