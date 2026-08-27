import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/config/site-config";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-primary">404</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold">That table is empty</h1>
      <p className="mt-3 text-muted-foreground">
        The page or event you wanted is not on the board.
      </p>
      <ButtonLink href="/" className="mt-8 rounded-full">
        Back to {siteConfig.product.name}
      </ButtonLink>
    </div>
  );
}
