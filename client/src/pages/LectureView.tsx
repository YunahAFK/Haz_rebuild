import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import {
  Share,
  ChevronLeft,
  User,
  Calendar,
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  BrainCircuit,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useLectures } from '@/context/LectureContext';
import { Lecture, QuizQuestion, Simulation, SimulationStep } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { EarthquakeMiniGame } from '@/components/EarthquakeMiniGame';

// helper component for the quiz interface
const QuizComponent = ({
  quiz,
  onComplete,
}: {
  quiz: QuizQuestion[];
  onComplete: (score: number, total: number, answers: (number | null)[]) => void;
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(quiz.length).fill(null));

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.forEach((q, index) => {
      if (q.correctAnswer === userAnswers[index]) {
        score++;
      }
    });
    onComplete(score, quiz.length, userAnswers);
  };

  const currentQuestion = quiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Lecture Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-6" />
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Question {currentQuestionIndex + 1}/{quiz.length}: {currentQuestion.question}
          </h3>
          <RadioGroup
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            value={userAnswers[currentQuestionIndex]?.toString()}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2 p-3 rounded-md border border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {currentQuestionIndex < quiz.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// helper component for quiz results
const QuizResultsComponent = ({
  quiz,
  score,
  total,
  userAnswers,
  onRetake,
}: {
  quiz: QuizQuestion[];
  score: number;
  total: number;
  userAnswers: (number | null)[];
  onRetake: () => void;
}) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <Card className="mt-8">
      <CardHeader className="text-center">
        <CardTitle>Quiz Results</CardTitle>
        <p className="text-4xl font-bold mt-4">
          {score} / {total}
        </p>
        <p className="text-lg text-muted-foreground">({percentage}%)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {quiz.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = q.correctAnswer === userAnswer;
            return (
              <div key={index}>
                <h4 className="font-semibold flex items-center">
                  {isCorrect ? <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> : <XCircle className="w-5 h-5 mr-2 text-destructive" />}
                  Question {index + 1}: {q.question}
                </h4>
                <p className="text-sm text-muted-foreground pl-7">
                  Your answer: {userAnswer !== null ? q.options[userAnswer] : 'Not answered'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-green-600 pl-7">
                    Correct answer: {q.options[q.correctAnswer]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={onRetake}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// helper component for the simulation
const SimulationComponent = ({
  simulation,
  isOpen,
  onOpenChange,
}: {
  simulation: Simulation;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [currentStepId, setCurrentStepId] = useState(simulation.startStepId);

  const currentStep = simulation.steps.find(s => s.id === currentStepId);

  const handleChoice = (nextStepId: string | null) => {
    if (nextStepId) {
      setCurrentStepId(nextStepId);
    } else {
      // handle end of simulation path
      setCurrentStepId('__END__');
    }
  };

  const handleRestart = () => {
    setCurrentStepId(simulation.startStepId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Story Simulation</DialogTitle>
          <DialogDescription>Make choices to navigate the scenario.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {currentStep ? (
            <>
              <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{currentStep.scenario}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStep.choices.map(choice => (
                  <Button key={choice.id} onClick={() => handleChoice(choice.nextStepId)}>
                    {choice.text}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-6">You've reached the end of this path.</p>
              <Button onClick={handleRestart}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Simulation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function LectureView() {
  const [match, params] = useRoute('/lecture/:id');
  const { fetchLectureById, lectures } = useLectures();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedLectures, setRelatedLectures] = useState<Lecture[]>([]);
  const { toast } = useToast();

  // state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; answers: (number | null)[] } | null>(null);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isEarthquakeGameOpen, setIsEarthquakeGameOpen] = useState(false);


  useEffect(() => {
    if (match && params?.id) {
      setShowQuiz(false);
      setQuizResult(null);
      setIsSimOpen(false);
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

  const handleQuizComplete = (score: number, total: number, answers: (number | null)[]) => {
    setQuizResult({ score, total, answers });
  };

  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setShowQuiz(true);
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

  const hasQuiz = lecture.quiz && lecture.quiz.length > 0;
  const hasSimulation = lecture.simulation && lecture.simulation.steps.length > 0;
  const hasEarthquakeGame = lecture.earthquakeMiniGame;
  
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground" data-testid="breadcrumb">
          <Link href="/"><a className="hover:text-primary transition">Home</a></Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{lecture.title}</span>
        </nav>

        {/* Lecture Header */}
        <article className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary to-secondary relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl text-white opacity-20">📚</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
              {/* Flex container to position content */}
              <div className="flex justify-between items-end">
                {/* Left side content */}
                <div>
                  <span className="inline-block bg-white/90 text-primary text-sm font-semibold px-3 py-1 rounded mb-3 capitalize">
                    {lecture.category}
                  </span>
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {lecture.title}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4 text-white/90 text-sm">
                    <span className="flex items-center"><User className="w-4 h-4 mr-2" />{lecture.author}</span>
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{lecture.createdAt.toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-2" />{Math.ceil(lecture.content.split(' ').length / 200)} min read</span>
                  </div>
                </div>

                {/* Right side content (Simulation Button) */}
                <div className="flex items-center gap-2">
                  {hasSimulation && (
                    <Button onClick={() => setIsSimOpen(true)} variant="outline" size="sm" className="shrink-0">
                      <BrainCircuit className="w-4 h-4 mr-2" />
                      Story Simulation
                    </Button>
                  )}
                  {hasEarthquakeGame && (
                    <Button onClick={() => setIsEarthquakeGameOpen(true)} variant="outline" size="sm" className="shrink-0">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Earthquake Game
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lecture Content */}
          <div className="p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: lecture.content }}
            />

            {/* Action Buttons */}
            <div className="mt-10 pt-8 border-t border-border flex flex-wrap gap-4">
              {hasQuiz && (
                <Button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  {showQuiz ? 'Hide Quiz' : 'Take Quiz'}
                </Button>
              )}
              <Button onClick={handleShare} variant="outline" className="flex-1 sm:flex-none">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </article>

        {/* Quiz Section */}
        {showQuiz && hasQuiz && !quizResult && (
          <QuizComponent quiz={lecture.quiz!} onComplete={handleQuizComplete} />
        )}
        {showQuiz && hasQuiz && quizResult && (
          <QuizResultsComponent
            quiz={lecture.quiz!}
            score={quizResult.score}
            total={quizResult.total}
            userAnswers={quizResult.answers}
            onRetake={handleRetakeQuiz}
          />
        )}

        {/* Simulation Modal */}
        {hasSimulation && (
          <SimulationComponent
            simulation={lecture.simulation!}
            isOpen={isSimOpen}
            onOpenChange={setIsSimOpen}
          />
        )}

        {/* Earthquake Mini-Game Modal */}
        {hasEarthquakeGame && (
          <EarthquakeMiniGame
            isOpen={isEarthquakeGameOpen}
            onOpenChange={setIsEarthquakeGameOpen}
          />
        )}

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