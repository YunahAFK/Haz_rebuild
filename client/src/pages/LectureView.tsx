import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Bookmark, Share, Printer, User, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLectures } from '@/context/LectureContext';
import { Lecture } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function LectureView() {
  const [match, params] = useRoute('/lecture/:id');
  const { fetchLectureById, lectures } = useLectures();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedLectures, setRelatedLectures] = useState<Lecture[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (match && params?.id) {
      loadLecture(params.id);
    }
  }, [match, params?.id]);

  useEffect(() => {
    if (lecture && lectures.length > 0) {
      const related = lectures
        .filter(l => l.id !== lecture.id && l.category === lecture.category && l.published)
        .slice(0, 2);
      setRelatedLectures(related);
    }
  }, [lecture, lectures]);

  async function loadLecture(id: string) {
    setLoading(true);
    try {
      const lectureData = await fetchLectureById(id);
      setLecture(lectureData);
    } catch (error) {
      console.error('Error loading lecture:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleShare = async () => {
    if (navigator.share && lecture) {
      try {
        await navigator.share({
          title: lecture.title,
          text: `Check out this lecture: ${lecture.title}`,
          url: window.location.href,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "The lecture link has been copied to your clipboard.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <div className="p-8 md:p-12">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!match || !lecture) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-error-title">
            Lecture not found
          </h1>
          <p className="text-muted-foreground mb-8" data-testid="text-error-description">
            The lecture you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground" data-testid="breadcrumb">
          <Link href="/">
            <a className="hover:text-primary transition" data-testid="link-home">Home</a>
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground" data-testid="text-current-page">{lecture.title}</span>
        </nav>

        {/* Lecture Header */}
        <article className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary to-secondary relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl text-white opacity-20">📚</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
              <span className="inline-block bg-white/90 text-primary text-sm font-semibold px-3 py-1 rounded mb-3 capitalize" data-testid="text-category">
                {lecture.category}
              </span>
              <h1 className="text-4xl font-bold text-white mb-2" data-testid="text-lecture-title">
                {lecture.title}
              </h1>
              <div className="flex items-center space-x-4 text-white/90 text-sm">
                <span className="flex items-center" data-testid="text-author">
                  <User className="w-4 h-4 mr-2" />
                  {lecture.author}
                </span>
                <span className="flex items-center" data-testid="text-created-date">
                  <Calendar className="w-4 h-4 mr-2" />
                  {lecture.createdAt.toLocaleDateString()}
                </span>
                <span className="flex items-center" data-testid="text-read-time">
                  <Clock className="w-4 h-4 mr-2" />
                  {Math.ceil(lecture.content.split(' ').length / 200)} min read
                </span>
              </div>
            </div>
          </div>

          {/* Lecture Content */}
          <div className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: lecture.content }}
              data-testid="lecture-content"
            />

            {/* Action Buttons */}
            <div className="mt-10 pt-8 border-t border-border flex flex-wrap gap-4">
              <Button 
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-save"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save for Later
              </Button>
              <Button 
                onClick={handleShare}
                className="flex-1 sm:flex-none bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-testid="button-share"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="flex-1 sm:flex-none"
                data-testid="button-print"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </article>

        {/* Related Lectures */}
        {relatedLectures.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-foreground mb-6" data-testid="text-related-title">
              Related Lectures
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="related-lectures">
              {relatedLectures.map((relatedLecture) => (
                <Link key={relatedLecture.id} href={`/lecture/${relatedLecture.id}`}>
                  <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer" data-testid={`card-related-${relatedLecture.id}`}>
                    <h4 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-related-title-${relatedLecture.id}`}>
                      {relatedLecture.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-related-description-${relatedLecture.id}`}>
                      {relatedLecture.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <span className="text-xs text-primary font-medium" data-testid={`text-related-meta-${relatedLecture.id}`}>
                      {relatedLecture.author} • {Math.ceil(relatedLecture.content.split(' ').length / 200)} min read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
