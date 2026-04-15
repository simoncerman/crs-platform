import { getMembers } from '@/lib/api';
import Image from 'next/image';
import { EmptyHelmet } from '../components/EmptyStates';
import { PageTransition } from '../components/PageTransition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Náš tým | Czech Rocket Society',
  description: 'Poznejte členy týmu Czech Rocket Society',
};

export default async function ClenovePage() {
  const members = await getMembers({ active: true });

  return (
    <PageTransition className="min-h-screen bg-cosmic-black">
      {/* Hero sekce */}
      <div className="relative overflow-hidden bg-gradient-to-b from-deep-space via-cosmic-black to-cosmic-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-blue/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-24 relative">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-6">
            Náš tým
          </h1>
          <p className="text-xl text-stellar-white/80 max-w-2xl">
            Poznejte lidi, kteří stojí za českým raketovým programem
          </p>
        </div>
      </div>

      {/* Grid členů */}
      <div className="container mx-auto px-4 py-16">
        {members.length === 0 ? (
          <EmptyHelmet />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {members.map((member) => (
              <div
                key={member.id}
                className="group"
              >
                <div className="bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/20 rounded-xl overflow-hidden hover:border-cosmic-blue/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                  {/* Avatar */}
                  <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-cosmic-blue/20 to-deep-space">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-cosmic-blue/40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Informace */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-stellar-white mb-2 group-hover:text-cosmic-blue transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-cosmic-blue font-medium mb-3">
                      {member.role}
                    </p>

                    {member.bio && (
                      <p className="text-stellar-white/70 text-sm line-clamp-3 mb-4">
                        {member.bio}
                      </p>
                    )}

                    {/* Social links */}
                    {(member.linkedIn || member.github) && (
                      <div className="flex gap-3 mt-4">
                        {member.linkedIn && (
                          <a
                            href={member.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-cosmic-blue/20 hover:bg-cosmic-blue/30 rounded-lg transition-colors border border-cosmic-blue/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-5 h-5 text-stellar-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-cosmic-blue/20 hover:bg-cosmic-blue/30 rounded-lg transition-colors border border-cosmic-blue/50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg
                              className="w-5 h-5 text-stellar-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
