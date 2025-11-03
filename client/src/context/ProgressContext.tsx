import { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface QuizResult {
  lectureId: string;
  lectureTitle: string;
  score: number;
  total: number;
  completedAt: Date;
}

interface LectureProgress {
  lectureId: string;
  lectureTitle: string;
  isCompleted: boolean;
  isInProgress: boolean;
  lastViewed?: Date;
}

interface ProgressContextType {
  quizResults: QuizResult[];
  lectureProgress: LectureProgress[];
  loading: boolean;
  saveQuizResult: (lectureId: string, lectureTitle: string, score: number, total: number) => Promise<void>;
  markLectureViewed: (lectureId: string, lectureTitle: string) => Promise<void>;
  getQuizResult: (lectureId: string) => QuizResult | undefined;
  getLectureProgress: (lectureId: string) => LectureProgress | undefined;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

interface ProgressProviderProps {
  children: React.ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const { currentUser, userProfile } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [lectureProgress, setLectureProgress] = useState<LectureProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'student' && currentUser) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  async function loadProgress() {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Load quiz results
      const quizResultsRef = collection(db, 'quizResults');
      const quizQuery = query(quizResultsRef, where('userId', '==', currentUser.uid));
      const quizSnapshot = await getDocs(quizQuery);
      
      const results: QuizResult[] = [];
      quizSnapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          lectureId: data.lectureId,
          lectureTitle: data.lectureTitle,
          score: data.score,
          total: data.total,
          completedAt: data.completedAt?.toDate() || new Date(),
        });
      });
      setQuizResults(results);

      // Load lecture progress
      const progressRef = collection(db, 'lectureProgress');
      const progressQuery = query(progressRef, where('userId', '==', currentUser.uid));
      const progressSnapshot = await getDocs(progressQuery);
      
      const progress: LectureProgress[] = [];
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        progress.push({
          lectureId: data.lectureId,
          lectureTitle: data.lectureTitle,
          isCompleted: data.isCompleted,
          isInProgress: data.isInProgress,
          lastViewed: data.lastViewed?.toDate(),
        });
      });
      setLectureProgress(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveQuizResult(lectureId: string, lectureTitle: string, score: number, total: number) {
    if (!currentUser) return;

    try {
      const quizResult: QuizResult = {
        lectureId,
        lectureTitle,
        score,
        total,
        completedAt: new Date(),
      };

      // Save to Firestore
      await setDoc(
        doc(db, 'quizResults', `${currentUser.uid}_${lectureId}`),
        {
          userId: currentUser.uid,
          ...quizResult,
          completedAt: new Date(),
        }
      );

      // Update local state
      setQuizResults((prev) => {
        const filtered = prev.filter((r) => r.lectureId !== lectureId);
        return [...filtered, quizResult];
      });

      // Mark lecture as completed if score is 100%
      if (score === total) {
        await markLectureCompleted(lectureId, lectureTitle);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }

  async function markLectureCompleted(lectureId: string, lectureTitle: string) {
    if (!currentUser) return;

    try {
      await setDoc(
        doc(db, 'lectureProgress', `${currentUser.uid}_${lectureId}`),
        {
          userId: currentUser.uid,
          lectureId,
          lectureTitle,
          isCompleted: true,
          isInProgress: false,
          lastViewed: new Date(),
        }
      );

      setLectureProgress((prev) => {
        const filtered = prev.filter((p) => p.lectureId !== lectureId);
        return [...filtered, {
          lectureId,
          lectureTitle,
          isCompleted: true,
          isInProgress: false,
          lastViewed: new Date(),
        }];
      });
    } catch (error) {
      console.error('Error marking lecture as completed:', error);
    }
  }

  async function markLectureViewed(lectureId: string, lectureTitle: string) {
    if (!currentUser) return;

    try {
      // Check if progress exists
      const existingProgress = lectureProgress.find((p) => p.lectureId === lectureId);
      
      if (!existingProgress) {
        // Create new progress entry
        await setDoc(
          doc(db, 'lectureProgress', `${currentUser.uid}_${lectureId}`),
          {
            userId: currentUser.uid,
            lectureId,
            lectureTitle,
            isCompleted: false,
            isInProgress: true,
            lastViewed: new Date(),
          }
        );

        setLectureProgress((prev) => [
          ...prev,
          {
            lectureId,
            lectureTitle,
            isCompleted: false,
            isInProgress: true,
            lastViewed: new Date(),
          },
        ]);
      } else {
        // Update existing progress
        await setDoc(
          doc(db, 'lectureProgress', `${currentUser.uid}_${lectureId}`),
          {
            ...existingProgress,
            lastViewed: new Date(),
          }
        );

        setLectureProgress((prev) =>
          prev.map((p) =>
            p.lectureId === lectureId
              ? { ...p, lastViewed: new Date() }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error marking lecture as viewed:', error);
    }
  }

  function getQuizResult(lectureId: string): QuizResult | undefined {
    return quizResults.find((r) => r.lectureId === lectureId);
  }

  function getLectureProgress(lectureId: string): LectureProgress | undefined {
    return lectureProgress.find((p) => p.lectureId === lectureId);
  }

  const value = {
    quizResults,
    lectureProgress,
    loading,
    saveQuizResult,
    markLectureViewed,
    getQuizResult,
    getLectureProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}
