import { FloatingAstronaut, RocketOnPad, BlueprintDrawing, EmptyHelmet, OrbitingSatellite, LoadingRocket } from '../components/EmptyStates';

export const metadata = {
  title: 'Easter Eggs Demo | CRS',
};

export default function EasterEggsDemo() {
  return (
    <div className="min-h-screen bg-deep-space pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-stellar-white mb-2 text-center">
          Easter Eggs Demo
        </h1>
        <p className="text-stellar-white/50 text-center mb-16">Všechny prázdné stavy na jednom místě</p>

        <div className="space-y-20">
          <section>
            <h2 className="font-heading text-2xl font-bold text-aurora-cyan mb-2 text-center">Aktuality — prázdný stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden">
              <FloatingAstronaut message="Zatím nejsou k dispozici žádné aktuality." />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-crs-ignition mb-2 text-center">Události — prázdný stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden">
              <RocketOnPad />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-aurora-blue mb-2 text-center">Projekty — prázdný stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden">
              <BlueprintDrawing />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-purple-400 mb-2 text-center">Členové — prázdný stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden">
              <EmptyHelmet />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-crs-ignition mb-2 text-center">Partneři — prázdný stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden">
              <OrbitingSatellite />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-stellar-white mb-2 text-center">Loading stav</h2>
            <div className="border border-stellar-white/10 rounded-2xl bg-stellar-white/[0.02] overflow-hidden h-[400px] flex items-center justify-center">
              <LoadingRocket />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
