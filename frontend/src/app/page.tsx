import { CommandBar } from "@/components/CommandBar";
import { Hero } from "@/components/Hero";
import { DashboardArtifacts } from "@/components/DashboardArtifacts";
import { SchemaVisualizer } from "@/components/SchemaVisualizer";
import { RepositoryArchive } from "@/components/RepositoryArchive";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen selection:bg-emerald/30 selection:text-emerald text-silver bg-obsidian font-sans">
      <CommandBar />
      <Hero />
      <DashboardArtifacts />
      <SchemaVisualizer />
      <RepositoryArchive />
      <CallToAction />
      <Footer />
    </main>
  );
}
