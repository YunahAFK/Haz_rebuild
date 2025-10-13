import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const initialItems = [
  { id: '1', imageUrl: 'https://imgur.com/MZGnclX.png', color: 'bg-blue-500' },
  { id: '2', imageUrl: 'https://imgur.com/NYmoC5C.png', color: 'bg-yellow-500' },
  { id: '3', imageUrl: 'https://imgur.com/teDamOR.png', color: 'bg-green-500' },
  { id: '4', imageUrl: 'https://imgur.com/zjfukAK.png', color: 'bg-red-500' },
];

const correctOrder = ['3', '1', '2', '4'];

function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`
        group relative overflow-hidden rounded-xl border-4 border-gray-200 bg-white
        cursor-grab active:cursor-grabbing
        hover:border-blue-400 hover:shadow-2xl
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-110 shadow-2xl z-50 rotate-3' : 'hover:scale-105'}
      `}
    >
      <div className="w-40 h-40 sm:w-48 sm:h-48">
        <img 
          src={props.imageUrl} 
          alt="Safety step" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      {/* Number Badge */}
      <div className={`
        absolute top-2 right-2 w-8 h-8 rounded-full ${props.color}
        flex items-center justify-center shadow-lg
        text-white font-bold text-sm
        group-hover:scale-125 transition-transform
      `}>
        {props.index}
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/10 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}

export function EarthquakeMiniGame({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
  const [items, setItems] = useState(initialItems);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsCorrect(null);
    }
  }

  function checkOrder() {
    const currentOrder = items.map(item => item.id);
    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
      setIsCorrect(true);
      setShowConfetti(true);
    } else {
      setIsCorrect(false);
    }
  }

  function resetGame() {
    setItems(initialItems);
    setIsCorrect(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          
          .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            top: -10px;
            z-index: 9999;
            animation: confetti-fall 3s linear forwards;
          }
        `}</style>
        
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl">Earthquake Safety Simulation</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Drag and drop the images into the correct order of actions to take during an earthquake. 
            <span className="block mt-1 font-semibold text-orange-600">Start with what to do BEFORE the shaking!</span>
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              Earthquake Preparedness Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(i => i.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-4 justify-center flex-wrap">
                  {items.map((item, index) => (
                    <SortableItem 
                      key={item.id} 
                      id={item.id} 
                      imageUrl={item.imageUrl}
                      color={item.color}
                      index={index + 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="flex items-center gap-3 mt-8 justify-center flex-wrap">
              <Button 
                onClick={checkOrder} 
                className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Check Order
              </Button>
              <Button 
                onClick={resetGame} 
                variant="outline"
                className="px-8 py-6 border-2"
              >
                Reset
              </Button>
              
              {isCorrect === true && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-500 rounded-lg animate-in slide-in-from-left duration-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 font-bold">Perfect! You're Earthquake Ready! 🎉</p>
                </div>
              )}
              
              {isCorrect === false && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-500 rounded-lg animate-in slide-in-from-left duration-300">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-bold">Wrong, Try Again! 🌲</p>
                </div>
              )}
            </div>
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
                  backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
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