/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error boundary:", error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-background shadow-lg rounded-2xl p-8 border space-y-4 text-center">
          <div className="text-5xl font-bold text-primary">Oops</div>
          <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
          <p className="text-muted-foreground">
            Nous avons rencontré un problème inattendu. Vous pouvez réessayer ou revenir à l’accueil.
          </p>
          {error?.digest && <p className="text-xs text-muted-foreground">Code : {error.digest}</p>}
          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90 transition"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 font-medium hover:bg-muted transition"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
