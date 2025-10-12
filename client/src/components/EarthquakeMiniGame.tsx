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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const initialItems = [
  { id: '1', text: 'Drop, Cover, and Hold On', imageUrl: 'https://i.imgur.com/g0P0eLq.png' },
  { id: '2', text: 'Stay away from windows', imageUrl: 'https://i.imgur.com/3d6H4F9.png' },
  { id: '3', text: 'Go to an open area', imageUrl: 'https://i.imgur.com/vS2gO6Y.png' },
  { id: '4', text: 'Check for injuries', imageUrl: 'https://i.imgur.com/1Zm9Z8X.png' },
];

const correctOrder = ['3', '1', '2', '4'];

function SortableItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    border: '1px solid #ccc',
    marginBottom: '5px',
    backgroundColor: 'white',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img src={props.imageUrl} alt={props.text} style={{ width: '50px', marginRight: '10px' }} />
      {props.text}
    </div>
  );
}

export function EarthquakeMiniGame({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
  const [items, setItems] = useState(initialItems);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function checkOrder() {
    const currentOrder = items.map(item => item.id);
    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setShake(true);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-2xl ${shake ? 'shake' : ''}`}>
        <DialogHeader>
          <DialogTitle>Earthquake Safety Simulation</DialogTitle>
          <DialogDescription>
            Drag and drop the items into the correct order of actions to take during an earthquake.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Earthquake Mini-Game</CardTitle>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map(item => <SortableItem key={item.id} id={item.id} text={item.text} imageUrl={item.imageUrl} />)}
              </SortableContext>
            </DndContext>
            <Button onClick={checkOrder} className="mt-4">Check Order</Button>
            {isCorrect === true && <p className="text-green-500 mt-2">Correct! 🎉</p>}
            {isCorrect === false && <p className="text-red-500 mt-2">Not quite right, try again. The screen will shake as a hint!</p>}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}