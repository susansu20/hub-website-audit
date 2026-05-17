import { Hero } from "@/components/landing/hero";
import { WhatYouGet } from "@/components/landing/what-you-get";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FrameworkTeaser } from "@/components/landing/framework-teaser";
import { SocialProof } from "@/components/landing/social-proof";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <WhatYouGet />
      <HowItWorks />
      <FrameworkTeaser />
      <SocialProof />
      <Faq />
      <FinalCta />
    </>
  );
}
