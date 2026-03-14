import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function DrawerPageTemplate() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drawer Page Template</h1>
      <Sheet>
        <SheetTrigger className="vx-cta">Open Drawer</SheetTrigger>
        <SheetContent className="bg-background border-l border-white/10">
           <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-2)] to-transparent"></div>
          <SheetHeader>
            <SheetTitle>Drawer Title</SheetTitle>
            <SheetDescription>
              This is a drawer component. You can place any content here.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <p>Drawer content goes here.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
