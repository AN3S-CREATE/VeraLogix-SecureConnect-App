import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/icons/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');

  return (
    <div className="min-h-screen w-full bg-background font-body">
      <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden flex-col bg-muted p-10 text-white lg:flex">
          {loginImage && (
            <Image
                src={loginImage.imageUrl}
                alt={loginImage.description}
                fill
                quality={100}
                className="object-cover"
                data-ai-hint={loginImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="relative z-20 flex items-center text-lg font-medium font-headline">
            <Logo className="h-8 w-8 mr-2" />
            VeraLogix SecureConnect™
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-xl">
                “This platform has revolutionized our security operations. The
                level of detail and control is unparalleled.”
              </p>
              <footer className="text-sm font-medium text-muted-foreground">
                Jane Doe, Chief Security Officer
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="flex items-center justify-center p-4">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
