import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Maximize, Minimize, ArrowRight } from 'lucide-react';

// Custom CSS animations and 3D styles
const customStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-delayed {
    0% { opacity: 0; transform: scale(0.8); }
    50% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes bounce-subtle {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-5px) scale(1.05); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2); }
    50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6), 0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
  }
  .animate-fade-in { animation: fade-in 1s ease-out; }
  .animate-slide-up { animation: slide-up 1.2s ease-out 0.3s both; }
  .animate-fade-in-delayed { animation: fade-in-delayed 1.5s ease-out 0.6s both; }
  .animate-bounce-gentle { animation: bounce-gentle 2s infinite; }
  .animate-bounce-subtle { animation: bounce-subtle 3s infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s infinite; }

  /* 3D Text Effects */
  .text-3d {
    text-shadow:
      0 1px 0 #ccc,
      0 2px 0 #c9c9c9,
      0 3px 0 #bbb,
      0 4px 0 #b9b9b9,
      0 5px 0 #aaa,
      0 6px 1px rgba(0,0,0,.1),
      0 0 5px rgba(0,0,0,.1),
      0 1px 3px rgba(0,0,0,.3),
      0 3px 5px rgba(0,0,0,.2),
      0 5px 10px rgba(0,0,0,.25),
      0 10px 10px rgba(0,0,0,.2),
      0 20px 20px rgba(0,0,0,.15);
  }

  /* 3D Card Effects */
  .card-3d {
    box-shadow:
      0 1px 3px rgba(0,0,0,0.12),
      0 1px 2px rgba(0,0,0,0.24),
      0 3px 6px rgba(0,0,0,0.15),
      0 6px 12px rgba(0,0,0,0.1),
      0 12px 24px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.3);
    transform: perspective(1000px) rotateX(2deg) rotateY(-1deg);
  }

  /* 3D Plastic Effects */
  .plastic-3d {
    background: linear-gradient(145deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1), rgba(0,0,0,0.1));
    border: 2px solid rgba(255,255,255,0.3);
    box-shadow:
      0 4px 8px rgba(0,0,0,0.2),
      0 8px 16px rgba(0,0,0,0.15),
      0 16px 32px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.6),
      inset 0 -1px 0 rgba(0,0,0,0.2),
      inset 0 0 20px rgba(255,255,255,0.1);
    position: relative;
  }
  .plastic-3d::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%);
    border-radius: inherit;
    pointer-events: none;
  }

  /* 3D Button Effects */
  .button-3d {
    box-shadow:
      0 1px 3px rgba(0,0,0,0.3),
      0 3px 6px rgba(0,0,0,0.2),
      0 6px 12px rgba(0,0,0,0.15),
      inset 0 1px 0 rgba(255,255,255,0.2),
      inset 0 -1px 0 rgba(0,0,0,0.1);
    transform: perspective(500px) rotateX(5deg);
    transition: all 0.3s ease;
  }
  .button-3d:hover {
    box-shadow:
      0 2px 4px rgba(0,0,0,0.4),
      0 4px 8px rgba(0,0,0,0.3),
      0 8px 16px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.3),
      inset 0 -1px 0 rgba(0,0,0,0.2);
    transform: perspective(500px) rotateX(2deg) translateY(-2px);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

interface ContentSlide {
    type: 'content';
    title: string;
    text: string;
    image: string;
    character?: string;
    isGamified?: boolean;
}

interface McqSlide {
    type: 'mcq';
    question: string;
    options: string[];
    correct: number;
    feedbackCorrect: string;
    feedbackIncorrect: string;
}

interface FillSlide {
    type: 'fill';
    sentence: string;
    blank: string;
    feedbackCorrect: string;
    feedbackIncorrect: string;
}

interface TfSlide {
    type: 'tf';
    question: string;
    correct: boolean;
    feedbackCorrect: string;
    feedbackIncorrect: string;
}

interface QuizSlide {
    type: 'quiz';
    questions: {
        question: string;
        options: string[];
        correct: number;
    }[];
}

type Slide = ContentSlide | McqSlide | FillSlide | TfSlide | QuizSlide;

const EarthquakeHazardLecture = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [fillInput, setFillInput] = useState('');
    const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Reset states when slide changes
    useEffect(() => {
        setShowFeedback(false);
        setFillInput('');
        if (currentSlide.type === 'quiz') {
            const slide = currentSlide as QuizSlide;
            setQuizAnswers(Array(slide.questions.length).fill(null));
        }
    }, [currentIndex]);

    const slides = [
        // Slide 0: Welcome
        {
            type: 'content',
            title: 'EARTHQUAKE HAZARDS! 🌍',
            text: 'Identify various potential earthquake hazards & analyze the effects of the different earthquake hazards.',
            image: 'https://i.ytimg.com/vi/dJpIU1rSOFY/sddefault.jpg',
            character: 'https://example.com/teacher-character.png', // Placeholder for teacher character image
            isGamified: true
        },
        // Slide 1: Introduction Interactive - MCQ
        {
            type: 'mcq',
            question: 'What is an Earthquake?',
            options: ['a big wave in the ocean', 'when the ground shakes', 'a sunny day', 'a type of dance'],
            correct: 1,
            feedbackCorrect: 'Good Job!',
            feedbackIncorrect: 'Oops! Try again.'
        },
        // Slide 2: Ground Shaking
        {
            type: 'content',
            title: 'Introduction',
            text: 'Earthquakes are among the most destructive natural hazards on Earth. Their impacts go beyond ground shaking—they can trigger multiple secondary hazards that pose threats to human life, infrastructure, and the environment. Understanding these potential hazards is essential for developing predictive skills and effective disaster preparedness.',
            image: 'https://thumbs.dreamstime.com/b/witness-chaotic-aftermath-cartoon-earthquake-vibrant-illustration-portrays-landscape-dramatically-altered-373525477.jpg'
        },
        // Slide 3: Ground Shaking Interactive - Fill-in
        {
            type: 'fill',
            sentence: 'Ground shaking can make buildings _____.',
            blank: 'collapse',
            feedbackCorrect: 'Super! Buildings can collapse during shaking. 👍',
            feedbackIncorrect: 'Not quite. Try again!'
        },
        // Slide 4: Ground Rupture
        {
            type: 'content',
            title: 'Ground Rupture 🕳️',
            text: 'Imagine the ground cracking open like a giant zipper! This happens along faults and can break houses, bridges, and pipes in two.',
            image: 'https://previews.123rf.com/images/greenskystudio/greenskystudio2212/greenskystudio221200258/196963300-cartoon-earthquake-natural-disaster-earth-crust-break-environment-damage-catastrophe-earthquake.jpg'
        },
        // Slide 5: Ground Rupture Interactive - MCQ
        {
            type: 'mcq',
            question: 'What does ground rupture do to buildings?',
            options: ['Makes them fly', 'Tears them apart', 'Paints them', 'Cleans them'],
            correct: 1,
            feedbackCorrect: 'Right on! It tears things apart. 😎',
            feedbackIncorrect: 'Nope! Try again.'
        },
        // Slide 6: Liquefaction
        {
            type: 'content',
            title: 'Liquefaction 🏖️',
            text: 'When the ground shakes, wet soil turns into quicksand! Houses and bridges can sink or tilt over. It\'s like the ground becomes soup!',
            image: 'https://i.ytimg.com/vi/-7JMq2Abn9w/maxresdefault.jpg'
        },
        // Slide 7: Liquefaction Interactive - Fill-in
        {
            type: 'fill',
            sentence: 'Liquefaction happens in _____ soil.',
            blank: 'wet',
            feedbackCorrect: 'Awesome! Wet soil turns liquidy. 🌟',
            feedbackIncorrect: 'Not quite. Try again!'
        },
        // Slide 8: Landslides
        {
            type: 'content',
            title: 'Landslides ⛰️',
            text: 'Shaking can make rocks and dirt slide down hills super fast! It can cover houses and block roads. Be careful on mountains!',
            image: 'https://i.ytimg.com/vi/krJLnXpemtQ/maxresdefault.jpg'
        },
        // Slide 9: Landslides Interactive - Mini-game (True/False as simple game)
        {
            type: 'tf',
            question: 'Landslides only happen on flat ground. True or False?',
            correct: false,
            feedbackCorrect: 'Correct! They happen on steep hills. 🏆',
            feedbackIncorrect: 'False! Try again.'
        },
        // Slide 10: Tsunami
        {
            type: 'content',
            title: 'Tsunami 🌊',
            text: 'Big earthquakes under the sea can make giant waves! They crash on the beach and flood everything. Run to high ground if you hear a warning!',
            image: 'https://i.ytimg.com/vi/MfsugkikLJI/sddefault.jpg'
        },
        // Slide 11: Tsunami Interactive - MCQ
        {
            type: 'mcq',
            question: 'What causes a tsunami?',
            options: ['Eating too much ice cream', 'Earthquakes under the sea', 'Flying birds', 'Running fast'],
            correct: 1,
            feedbackCorrect: 'Yes! Underwater earthquakes make big waves. 🌈',
            feedbackIncorrect: 'No, try again.'
        },
        // Slide 12: Fire and Infrastructure Failures
        {
            type: 'content',
            title: 'Fires and Broken Things 🔥',
            text: 'Earthquakes can break gas pipes and start fires. Power lines fall, and water pipes burst. It makes everything messier!',
            image: 'https://www.shutterstock.com/image-vector/graphic-flat-design-drawing-burning-600nw-2289273415.jpg'
        },
        // Slide 13: Fire Interactive - Fill-in
        {
            type: 'fill',
            sentence: 'Earthquakes can cause _____ from broken gas lines.',
            blank: 'fires',
            feedbackCorrect: 'Great job! Fires are dangerous after quakes. 🚒',
            feedbackIncorrect: 'Not quite. Try again!'
        },
        // Slide 14: Final Quiz
        {
            type: 'quiz',
            questions: [
                {
                    question: 'What is ground shaking?',
                    options: ['The earth dancing', 'Vibration from earthquake energy', 'Rain falling', 'Wind blowing'],
                    correct: 1
                },
                {
                    question: 'Liquefaction makes soil act like what?',
                    options: ['Rock', 'Liquid', 'Ice', 'Candy'],
                    correct: 1
                },
                {
                    question: 'Tsunamis are big what?',
                    options: ['Mountains', 'Waves', 'Trees', 'Cars'],
                    correct: 1
                },
                {
                    question: 'Landslides happen because of?',
                    options: ['Shaking on hills', 'Flat ground', 'Swimming', 'Eating'],
                    correct: 0
                }
            ]
        }
    ];

    const totalSlides = slides.length;

    const handleNext = () => {
        if (currentIndex < totalSlides - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowFeedback(false);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowFeedback(false);
        }
    };

    const handleMcqAnswer = (selected: number) => {
        const slide = slides[currentIndex] as McqSlide;
        setAnswers({ ...answers, [currentIndex]: selected });
        setShowFeedback(true);
    };

    const handleFillAnswer = (input: string) => {
        const slide = slides[currentIndex] as FillSlide;
        setAnswers({ ...answers, [currentIndex]: input });
        setShowFeedback(true);
    };

    const handleTfAnswer = (selected: boolean) => {
        const slide = slides[currentIndex] as TfSlide;
        setAnswers({ ...answers, [currentIndex]: selected });
        setShowFeedback(true);
    };

    const handleTryAgain = () => {
        setShowFeedback(false);
        setAnswers({ ...answers, [currentIndex]: undefined });
        setFillInput('');
    };

    const handleQuizSubmit = (quizAnswers: (number | null)[]) => {
        const slide = slides[currentIndex] as QuizSlide;
        let score = 0;
        slide.questions.forEach((q, i) => {
            if (q.correct === quizAnswers[i]) score++;
        });
        setQuizScore(score);
    };

    const progress = ((currentIndex + 1) / totalSlides) * 100;

    const currentSlide = slides[currentIndex];

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const isInteractive = ['mcq', 'fill', 'tf'].includes(currentSlide.type);
    const hasAnswered = answers.hasOwnProperty(currentIndex);
    const isCorrect = () => {
        if (currentSlide.type === 'mcq') {
            const slide = currentSlide as McqSlide;
            return answers[currentIndex] === slide.correct;
        } else if (currentSlide.type === 'tf') {
            const slide = currentSlide as TfSlide;
            return answers[currentIndex] === slide.correct;
        } else if (currentSlide.type === 'fill') {
            const slide = currentSlide as FillSlide;
            return (answers[currentIndex] as string).toLowerCase() === slide.blank.toLowerCase();
        }
        return false;
    };

    const getFeedbackCorrect = () => {
        if (currentSlide.type === 'mcq') return (currentSlide as McqSlide).feedbackCorrect;
        if (currentSlide.type === 'fill') return (currentSlide as FillSlide).feedbackCorrect;
        if (currentSlide.type === 'tf') return (currentSlide as TfSlide).feedbackCorrect;
        return '';
    };

    const getFeedbackIncorrect = () => {
        if (currentSlide.type === 'mcq') return (currentSlide as McqSlide).feedbackIncorrect;
        if (currentSlide.type === 'fill') return (currentSlide as FillSlide).feedbackIncorrect;
        if (currentSlide.type === 'tf') return (currentSlide as TfSlide).feedbackIncorrect;
        return '';
    };

    const renderContent = () => {
        const slide = currentSlide as ContentSlide;
        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-9xl text-white font-black mb-8 text-3d animate-bounce-gentle">
                        {slide.title}
                    </h1>
                </div>
                <div className="text-center mb-16 animate-slide-up">
                    <p className="text-3xl text-white leading-relaxed p-10 rounded-3xl max-w-5xl plastic-3d">
                        {slide.text}
                    </p>
                </div>
                {slide.isGamified && (
                    <div className="text-center animate-fade-in-delayed">
                        <Button
                            onClick={handleNext}
                            className="text-white font-black py-12 px-24 text-5xl rounded-full button-3d"
                        >
                            Start Adventure!
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderMcq = () => {
        const slide = currentSlide as McqSlide;
        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-8xl text-white font-black mb-8 text-3d animate-bounce-gentle">
                        {slide.question}
                    </h2>
                </div>
                <div className="grid grid-cols-4 gap-12 mb-12 max-w-full animate-slide-up px-8">
                    {slide.options.map((opt, idx) => {
                        const colors = [
                            'bg-red-600 hover:bg-red-700',
                            'bg-blue-600 hover:bg-blue-700',
                            'bg-green-600 hover:bg-green-700',
                            'bg-yellow-600 hover:bg-yellow-700'
                        ];
                        return (
                            <Button
                                key={idx}
                                onClick={() => handleMcqAnswer(idx)}
                                className={`text-5xl font-bold py-16 px-12 rounded-3xl plastic-3d text-white hover:scale-105 transition-all duration-300 animate-fade-in h-auto min-h-[160px] ${colors[idx]}`}
                                style={{ animationDelay: `${idx * 0.2}s` }}
                                disabled={showFeedback}
                            >
                                {opt}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderFill = () => {
        const slide = currentSlide as FillSlide;
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-primary">{slide.sentence.replace('_____', '________')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="text"
                        value={fillInput}
                        onChange={(e) => setFillInput(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={showFeedback}
                        className="text-lg"
                    />
                    <Button
                        onClick={() => handleFillAnswer(fillInput)}
                        disabled={showFeedback || !fillInput}
                        className="w-full"
                    >
                        Check Answer
                    </Button>
                </CardContent>
            </Card>
        );
    };

    const renderTf = () => (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">{currentSlide.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <Button
                        onClick={() => handleTfAnswer(true)}
                        variant="outline"
                        className="flex-1"
                        disabled={showFeedback}
                    >
                        True
                    </Button>
                    <Button
                        onClick={() => handleTfAnswer(false)}
                        variant="outline"
                        className="flex-1"
                        disabled={showFeedback}
                    >
                        False
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderQuiz = () => {
        const slide = currentSlide as QuizSlide;
        const handleSelect = (qIdx: number, optIdx: number) => {
            const newAnswers = [...quizAnswers];
            newAnswers[qIdx] = optIdx;
            setQuizAnswers(newAnswers);
        };

        const isComplete = quizAnswers.every(a => a !== null);

        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl text-primary text-center">Final Quiz Time! 🧠</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {slide.questions.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-4">
                            <h3 className="text-xl font-semibold text-foreground">{q.question}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => (
                                    <Button
                                        key={optIdx}
                                        onClick={() => handleSelect(qIdx, optIdx)}
                                        variant={quizAnswers[qIdx] === optIdx ? "default" : "outline"}
                                        className="justify-start text-left h-auto py-4 px-6"
                                        disabled={quizScore !== null}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {quizScore === null && (
                        <Button
                            onClick={() => handleQuizSubmit(quizAnswers)}
                            disabled={!isComplete}
                            className="w-full"
                            size="lg"
                        >
                            Submit Quiz
                        </Button>
                    )}
                    {quizScore !== null && (
                        <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                            <p className="text-2xl font-bold text-primary">
                                You got {quizScore} out of {slide.questions.length} correct!
                            </p>
                            <p className="text-lg text-muted-foreground mt-2">
                                {quizScore === 4 ? 'Perfect! 🎉' : 'Good try! Keep learning! 📚'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div
            className={`h-screen w-screen ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
            style={{
                backgroundImage: 'url(https://i.postimg.cc/D0YKhSJ9/a-colorful-suburban-town-set-in-a-wide-valley-surr.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="h-full w-full flex flex-col bg-black/30 relative">
                <div className="flex justify-end items-center p-8">
                    <Button
                        onClick={toggleFullscreen}
                        className="text-white font-black py-12 px-12 text-5xl rounded-full button-3d mr-8"
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    {currentSlide.type === 'content' && renderContent()}
                    {currentSlide.type === 'mcq' && renderMcq()}
                    {currentSlide.type === 'fill' && renderFill()}
                    {currentSlide.type === 'tf' && renderTf()}
                    {currentSlide.type === 'quiz' && renderQuiz()}
                </div>

                {showFeedback && isInteractive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 animate-fade-in">
                        <div className={`p-12 rounded-3xl max-w-4xl ${isCorrect() ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            <div className="flex flex-col items-center justify-center space-y-8">
                                <div className="flex items-center justify-center space-x-4">
                                    {isCorrect() ? (
                                        <CheckCircle className="w-16 h-16 text-white" />
                                    ) : (
                                        <XCircle className="w-16 h-16 text-white" />
                                    )}
                                    <p className="text-4xl font-bold">
                                        {isCorrect() ? getFeedbackCorrect() : getFeedbackIncorrect()}
                                    </p>
                                </div>
                                {isCorrect() ? (
                                    <Button
                                        onClick={handleNext}
                                        className="text-white font-black py-6 px-12 text-3xl rounded-full button-3d bg-white text-green-500 hover:bg-gray-100 flex items-center space-x-2"
                                    >
                                        <span>Continue</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleTryAgain}
                                        className="text-white font-black py-6 px-12 text-3xl rounded-full button-3d bg-white text-red-500 hover:bg-gray-100"
                                    >
                                        Try Again
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentIndex !== 0 && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
                        <Button
                            onClick={handleBack}
                            disabled={currentIndex === 0}
                            size="lg"
                            className="text-white font-black py-10 px-20 text-4xl rounded-full button-3d"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={currentIndex === totalSlides - 1 || (isInteractive && !hasAnswered)}
                            size="lg"
                            className="text-white font-black py-10 px-20 text-4xl rounded-full button-3d"
                        >
                            {currentIndex === totalSlides - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};


export default EarthquakeHazardLecture;