import { createContext, useContext, useState } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lecture, InsertLecture } from '@shared/schema';

interface LectureContextType {
  lectures: Lecture[];
  loading: boolean;
  fetchLectures: () => Promise<void>;
  fetchLectureById: (id: string) => Promise<Lecture | null>;
  createLecture: (lecture: InsertLecture) => Promise<string>;
  updateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
}

const LectureContext = createContext<LectureContextType | null>(null);

export function useLectures() {
  const context = useContext(LectureContext);
  if (!context) {
    throw new Error('useLectures must be used within a LectureProvider');
  }
  return context;
}

interface LectureProviderProps {
  children: React.ReactNode;
}

export function LectureProvider({ children }: LectureProviderProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLectures() {
    setLoading(true);
    try {
      const q = query(collection(db, 'lectures'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const lecturesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          quiz: data.quiz || [],
          simulation: data.simulation || undefined,
        } as Lecture
      });
      setLectures(lecturesData);
    } catch (error) {
      console.error('Error fetching lectures:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLectureById(id: string): Promise<Lecture | null> {
    try {
      const docRef = doc(db, 'lectures', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          quiz: data.quiz || [],
          simulation: data.simulation || undefined,
        } as Lecture;
      }
      return null;
    } catch (error) {
      console.error('Error fetching lecture:', error);
      return null;
    }
  }

  async function createLecture(lecture: InsertLecture): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'lectures'), {
        ...lecture,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await fetchLectures(); // Refresh the list
      return docRef.id;
    } catch (error) {
      console.error('Error creating lecture:', error);
      throw error;
    }
  }

  async function updateLecture(id: string, updates: Partial<Lecture>) {
    try {
      const docRef = doc(db, 'lectures', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await fetchLectures(); // Refresh the list
    } catch (error) {
      console.error('Error updating lecture:', error);
      throw error;
    }
  }

  async function deleteLecture(id: string) {
    try {
      await deleteDoc(doc(db, 'lectures', id));
      await fetchLectures(); // Refresh the list
    } catch (error) {
      console.error('Error deleting lecture:', error);
      throw error;
    }
  }

  async function incrementViews(id: string) {
    try {
      const docRef = doc(db, 'lectures', id);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  const value = {
    lectures,
    loading,
    fetchLectures,
    fetchLectureById,
    createLecture,
    updateLecture,
    deleteLecture,
    incrementViews
  };

  return (
    <LectureContext.Provider value={value}>
      {children}
    </LectureContext.Provider>
  );
}