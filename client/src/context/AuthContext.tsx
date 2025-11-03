import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { auth, db, secondaryAuth } from '@/lib/firebase';
import { User } from '@shared/schema';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  fetchStudents?: () => Promise<User[]>;
  createUser?: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  async function createUser(email: string, password: string, name: string) {
    try {
      // Use the secondary auth instance to create the user
      // This prevents the auto-sign-in from affecting the main app's auth state
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const user = userCredential.user;

      console.log('New user created in Firebase Auth:', user.uid);

      // Immediately create user profile in Firestore
      const newProfile = {
        name,
        email: user.email || '',
        role: 'student',
        createdAt: serverTimestamp(),
      };

      console.log('Saving to Firestore...', newProfile);
      await setDoc(doc(db, 'users', user.uid), newProfile);
      console.log('User saved to Firestore successfully!');
      
      // Sign out from the secondary auth instance (doesn't affect main app)
      await signOut(secondaryAuth);
      
      console.log('Student user created successfully. Teacher remains logged in!');
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Re-throw to let the calling code handle it
      throw error;
    }
  }

  async function fetchStudents(): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const querySnapshot = await getDocs(q);
    const students: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      students.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    return students;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            id: user.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        } else {
          // Create default profile for new users (assuming teacher for now)
          const defaultProfile: Omit<User, 'id'> = {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'teacher',
            createdAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', user.uid), defaultProfile);
          setUserProfile({
            id: user.uid,
            ...defaultProfile,
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    loading,
    fetchStudents,
    createUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}