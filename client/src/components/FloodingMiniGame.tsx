import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Droplets, AlertTriangle, CheckCircle2, X, Home, Car, Zap } from 'lucide-react';

interface Item {
    id: number;
    text: string;
    isSafe: boolean;
    icon: 'home' | 'car' | 'power';
    emoji: string;
}

const gameItems: Item[] = [
    { id: 1, text: 'Move to higher ground', isSafe: true, icon: 'home', emoji: '⛰️' },
    { id: 2, text: 'Drive through flooded road', isSafe: false, icon: 'car', emoji: '🚗' },
    { id: 3, text: 'Turn off electricity', isSafe: true, icon: 'power', emoji: '💡' },
    { id: 4, text: 'Walk through deep water', isSafe: false, icon: 'home', emoji: '🚶' },
    { id: 5, text: 'Store emergency supplies', isSafe: true, icon: 'home', emoji: '🎒' },
    { id: 6, text: 'Touch electrical equipment', isSafe: false, icon: 'power', emoji: '⚡' },
    { id: 7, text: 'Listen to weather alerts', isSafe: true, icon: 'home', emoji: '📻' },
    { id: 8, text: 'Return home too quickly', isSafe: false, icon: 'home', emoji: '🏃' },
];

const getIconComponent = (icon: string) => {
    switch (icon) {
        case 'home': return Home;
        case 'car': return Car;
        case 'power': return Zap;
        default: return Home;
    }
};

export function FloodingMiniGame({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    const [items, setItems] = useState<Item[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [waterLevel, setWaterLevel] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [currentItem, setCurrentItem] = useState<Item | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    useEffect(() => {
        if (isOpen) {
            startNewGame();
        }
    }, [isOpen]);

    useEffect(() => {
        if (feedback === 'correct' || feedback === 'wrong') {
            const timer = setTimeout(() => {
                setFeedback(null);

                if (feedback === 'correct') {
                    const nextIndex = score + 1;
                    if (nextIndex < gameItems.length) {
                        setCurrentItem(items[nextIndex]);
                    } else {
                        setGameWon(true);
                        setShowConfetti(true);
                    }
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [feedback]);


    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const startNewGame = () => {
        const shuffled = [...gameItems].sort(() => Math.random() - 0.5);
        setItems(shuffled);
        setScore(0);
        setLives(3);
        setWaterLevel(0);
        setGameOver(false);
        setGameWon(false);
        setCurrentItem(shuffled[0]);
    };

    const handleChoice = (choice: 'safe' | 'unsafe') => {
        if (!currentItem || gameOver || gameWon) return;

        const isCorrect =
            (choice === 'safe' && currentItem.isSafe) ||
            (choice === 'unsafe' && !currentItem.isSafe);

        if (isCorrect) {
            setFeedback('correct');
            setScore((prev) => prev + 1);
        } else {
            setFeedback('wrong');
            setLives((prev) => {
                const newLives = prev - 1;
                if (newLives === 0) setGameOver(true);
                return newLives;
            });
            setWaterLevel((prev) => prev + 33.33);
        }
    };

    const IconComponent = currentItem ? getIconComponent(currentItem.icon) : Home;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          
          @keyframes wave {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes zoom-fade {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
                    
          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            top: -10px;
            z-index: 9999;
            animation: confetti-fall 3s linear forwards;
          }
          
          .wave-animation {
            animation: wave 2s ease-in-out infinite;
          }
          
          .pulse-correct {
            animation: pulse-ring 1s ease-in-out;
          }
            
          .animate-in.zoom-in {
              animation: zoom-fade 0.6s ease-out;
          }
        `}</style>

                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center wave-animation">
                            <Droplets className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl">Flooding Safety Challenge</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Choose whether each action is SAFE or UNSAFE during a flood. You have 3 lives!
                    </DialogDescription>
                </DialogHeader>

                <Card className="border-2 shadow-lg overflow-hidden relative">
                    {/* Water Level Indicator */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500 pointer-events-none opacity-40"
                        style={{ height: `${waterLevel}%` }}
                    />

                    <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 relative z-10">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">💧</span>
                                Flood Safety Quiz
                            </CardTitle>
                            <div className="flex gap-4 items-center">
                                <div className="text-sm font-semibold">
                                    Score: <span className="text-blue-600 text-lg">{score}/{gameItems.length}</span>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${i < lives ? 'bg-red-500' : 'bg-gray-300'
                                                } transition-all duration-300`}
                                        >
                                            <span className="text-white text-lg">❤️</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 pb-6 relative z-10">
                        {!gameOver && !gameWon && currentItem && (
                            <div className="space-y-4">
                                {/* Current Item Display */}
                                <div className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 min-h-[200px] relative overflow-hidden ${feedback === 'correct' ? 'pulse-correct' : ''
                                    }`}>
                                    {/* Feedback Overlay */}
                                    {feedback && (
                                        <div className={`absolute inset-0 flex items-center justify-center z-20 ${feedback === 'correct' ? 'bg-green-500/95' : 'bg-red-500/95'
                                            } animate-in fade-in zoom-in duration-300`}>
                                            <div className="text-center">
                                                {feedback === 'correct' ? (
                                                    <>
                                                        <CheckCircle2 className="w-20 h-20 text-white mx-auto mb-3 animate-pulse" />
                                                        <p className="text-3xl font-bold text-white">Correct!</p>
                                                        <p className="text-white text-lg mt-2">Great Job! ✓</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="w-20 h-20 text-white mx-auto mb-3 animate-pulse" />
                                                        <p className="text-3xl font-bold text-white">Wrong!</p>
                                                        <p className="text-white text-lg mt-2">Try Again! ✗</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 relative">
                                        <IconComponent className="w-10 h-10 text-blue-600" />
                                        <div className="absolute -top-1 -right-1 text-3xl">{currentItem.emoji}</div>
                                    </div>
                                    <p className="text-xl font-bold text-gray-800 text-center max-w-md">
                                        {currentItem.text}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-center">
                                    <Button
                                        onClick={() => handleChoice('safe')}
                                        disabled={feedback !== null}
                                        className="flex-1 max-w-[200px] bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        SAFE ✓
                                    </Button>
                                    <Button
                                        onClick={() => handleChoice('unsafe')}
                                        disabled={feedback !== null}
                                        className="flex-1 max-w-[200px] bg-red-600 hover:bg-red-700 text-white text-lg py-6 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="w-5 h-5 mr-2" />
                                        UNSAFE ✗
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Game Over */}
                        {gameOver && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h3>
                                    <p className="text-lg text-gray-600 mb-2">Final Score: {score}/{gameItems.length}</p>
                                    <p className="text-sm text-gray-500">Study flood safety tips and try again!</p>
                                </div>
                                <Button
                                    onClick={startNewGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-base py-5 px-10 font-semibold shadow-lg"
                                >
                                    Play Again
                                </Button>
                            </div>
                        )}

                        {/* Game Won */}
                        {gameWon && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600 animate-bounce" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-green-700 mb-2">Perfect Score! 🎉</h3>
                                    <p className="text-lg text-gray-600 mb-2">You got all {gameItems.length} questions correct!</p>
                                    <p className="text-sm text-gray-500">You're a flood safety expert!</p>
                                </div>
                                <Button
                                    onClick={startNewGame}
                                    className="bg-blue-600 hover:bg-blue-700 text-base py-5 px-10 font-semibold shadow-lg"
                                >
                                    Play Again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Confetti Effect */}
                {showConfetti && (
                    <>
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    animationDuration: `${2 + Math.random() * 2}s`,
                                }}
                            />
                        ))}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}