import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  route: string;
  emoji?: string;
}

export function GameCard({ title, description, route, emoji }: GameCardProps) {
  return (
    <Link
      to={route}
      className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-gray-300"
    >
      {emoji && <div className="text-3xl mb-3">{emoji}</div>}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}
