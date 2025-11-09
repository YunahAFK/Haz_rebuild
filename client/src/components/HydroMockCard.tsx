import { BookOpen, User, Clock, Star, CloudRain } from 'lucide-react';

const categoryColors = {
  mathematics: 'from-primary to-secondary',
  science: 'from-secondary to-accent',
  programming: 'from-accent to-primary',
  geography: 'from-primary via-secondary to-accent',
  art: 'from-secondary to-primary',
  biology: 'from-accent to-secondary',
  language: 'from-primary to-accent',
  economics: 'from-secondary via-accent to-primary',
  other: 'from-primary to-secondary'
};

const categoryIcons = {
  mathematics: BookOpen, // Placeholder, not used
  science: CloudRain,
  programming: BookOpen, // Placeholder, not used
  geography: BookOpen, // Placeholder, not used
  art: BookOpen, // Placeholder, not used
  biology: BookOpen, // Placeholder, not used
  language: BookOpen, // Placeholder, not used
  economics: BookOpen, // Placeholder, not used
  other: BookOpen
};

export function HydroMockCard() {
  const mockLecture = {
    id: 'hydro-mock-lecture',
    title: 'HYDROMETEOROLOGICAL HAZARDS',
    category: 'science',
    author: 'Haz Team',
    createdAt: new Date(),
    cardDescription: 'Learn about hydrometeorological hazards including floods, storms, hurricanes, and other weather-related disasters to enhance preparedness and safety.',
    cardImageUrl: 'https://i.postimg.cc/gJ6xMLbB/hydrometeorologicalhazard-cover.jpg',
    featured: false
  };

  const gradient = categoryColors[mockLecture.category as keyof typeof categoryColors] || categoryColors.other;
  const Icon = categoryIcons[mockLecture.category as keyof typeof categoryIcons] || BookOpen;

  const handleClick = () => {
    window.open('https://hydrometeorological-hazard-edu.web.app/', '_blank');
  };

  const description = mockLecture.cardDescription || 'Mock description...';

  return (
    <div
      className="lecture-card bg-card rounded-lg shadow-md overflow-hidden cursor-pointer h-96"
      onClick={handleClick}
      data-testid="hydro-mock-lecture-card"
    >
      <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {mockLecture.cardImageUrl ? (
          <img src={mockLecture.cardImageUrl} alt={mockLecture.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="text-6xl text-white opacity-20" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {mockLecture.featured && (
            <div className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}
          <span className="bg-white/90 text-primary text-xs font-semibold px-2 py-1 rounded capitalize flex items-center gap-1" data-testid="hydro-text-category">
            <Icon className="w-3 h-3" />
            {mockLecture.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1" data-testid="hydro-text-title">
          {mockLecture.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-16" data-testid="hydro-text-description">
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center" data-testid="hydro-text-author">
            <User className="w-3 h-3 mr-1" />
            {mockLecture.author}
          </span>
          <span className="flex items-center" data-testid="hydro-text-date">
            {mockLecture.createdAt.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}