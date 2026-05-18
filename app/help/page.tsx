import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help & FAQ | Love Island Nigeria",
  description: "Frequently asked questions, voting help, and competition support for Love Island Nigeria.",
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
      <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">Help &amp; FAQ</h1>
      <p className="mt-3 text-muted-foreground">
        Quick links for common questions. For anything else,{" "}
        <Link href="/contact" className="font-medium text-li-magenta underline-offset-4 hover:underline">
          contact us
        </Link>
        .
      </p>

      <section className="mt-10 space-y-6" aria-labelledby="faq-voting">
        <h2 id="faq-voting" className="font-display text-xl font-semibold">
          Voting
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Cast votes on the{" "}
            <Link href="/vote" className="text-foreground underline-offset-4 hover:underline">
              Vote
            </Link>{" "}
            page during an open voting period.
          </li>
          <li>
            Having trouble? Email us via{" "}
            <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
              Contact
            </Link>{" "}
            and choose <strong className="text-foreground">Support</strong> with subject line details.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-6" aria-labelledby="faq-competitions">
        <h2 id="faq-competitions" className="font-display text-xl font-semibold">
          Competitions
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Browse active competitions on the{" "}
            <Link href="/competitions" className="text-foreground underline-offset-4 hover:underline">
              Competitions
            </Link>{" "}
            page.
          </li>
          <li>
            For entry or results questions, use{" "}
            <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
              Contact
            </Link>{" "}
            — subject <strong className="text-foreground">Support</strong> or{" "}
            <strong className="text-foreground">General Inquiry</strong>.
          </li>
        </ul>
      </section>
    </div>
  )
}
