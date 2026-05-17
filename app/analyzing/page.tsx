import { redirect } from "next/navigation";
import { AnalyzingExperience } from "@/components/analyzing/experience";
import { validateAndNormalizeUrl } from "@/lib/url";

type Props = {
  searchParams: { url?: string };
};

export default function AnalyzingPage({ searchParams }: Props) {
  const raw = searchParams.url ?? "";
  const validation = validateAndNormalizeUrl(raw);
  if (!validation.ok) redirect("/");

  return <AnalyzingExperience url={validation.normalized} />;
}
