import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-background shadow-lg rounded-2xl p-8 border">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground">
          Désolé, la page que vous recherchez n’existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90 transition"
          >
            Retour à l’accueil
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 font-medium hover:bg-muted transition"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    </main>
  )
}
