import { GameCard } from './components/GameCard';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fun Folder</h1>
        <p className="text-gray-500 mb-10">A collection of daily word puzzles.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <GameCard
            title="Trisect"
            description="Place 7 words into a Venn diagram. Three hidden themes, seven zones — can you reconstruct the diagram?"
            route="/trisect"
            emoji="⭕"
          />
        </div>
      </div>
    </div>
  );
}
