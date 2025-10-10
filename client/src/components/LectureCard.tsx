import { Link } from 'wouter';
import { BookOpen, User, Clock } from 'lucide-react';
import { Lecture } from '@shared/schema';
import { useLectures } from '@/context/LectureContext';

interface LectureCardProps {
  lecture: Lecture;
}

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

export function LectureCard({ lecture }: LectureCardProps) {
  const { incrementViews } = useLectures();
  
  const gradient = categoryColors[lecture.category as keyof typeof categoryColors] || categoryColors.other;
  
  const handleClick = () => {
    incrementViews(lecture.id);
  };

  const description = lecture.cardDescription || lecture.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...';

  return (
    <Link href={`/lecture/${lecture.id}`}>
      <div 
        className="lecture-card bg-card rounded-lg shadow-md overflow-hidden cursor-pointer"
        onClick={handleClick}
        data-testid={`card-lecture-${lecture.id}`}
      >
        <div className={`h-48 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          {lecture.cardImageUrl ? (
            <img src={lecture.cardImageUrl} alt={lecture.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="text-6xl text-white opacity-20" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-primary text-xs font-semibold px-2 py-1 rounded capitalize" data-testid={`text-category-${lecture.id}`}>
              {lecture.category}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2" data-testid={`text-title-${lecture.id}`}>
            {lecture.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-description-${lecture.id}`}>
            {description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center" data-testid={`text-author-${lecture.id}`}>
              <User className="w-3 h-3 mr-1" />
              {lecture.author}
            </span>
            <span className="flex items-center" data-testid={`text-date-${lecture.id}`}>
              {lecture.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}