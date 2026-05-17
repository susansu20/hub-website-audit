import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedAnalysis } from "@/lib/cache";
import { ResultsView } from "@/components/results/results-view";

type Props = { params: { hash: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getCachedAnalysis(params.hash).catch(() => null);
  if (!result) {
    return { title: "Audit not found" };
  }
  return {
    title: `${result.host} · UX score ${result.score.toFixed(1)}/10`,
    description: `${result.era.verdict} ${result.bracketVerdict}`,
    openGraph: {
      title: `${result.host} · ${result.bracketLabel} · ${result.score.toFixed(1)}/10`,
      description: result.era.verdict,
      images: [{ url: `/api/og/${params.hash}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${result.host} · ${result.bracketLabel}`,
      description: result.era.verdict,
      images: [`/api/og/${params.hash}`],
    },
  };
}

export default async function ResultsByHashPage({ params }: Props) {
  const result = await getCachedAnalysis(params.hash).catch(() => null);
  if (!result) notFound();
  return <ResultsView result={result} />;
}
