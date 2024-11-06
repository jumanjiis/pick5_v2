import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { samplePlayers } from './sampleData';

const firebaseConfig = {
  apiKey: "AIzaSyD-PgxcsqxVmNPY85vIpGguOY0Cfl_1-3U",
  authDomain: "database-4fbef.firebaseapp.com",
  projectId: "database-4fbef",
  storageBucket: "database-4fbef.firebasestorage.app",
  messagingSenderId: "563207078452",
  appId: "1:563207078452:web:c6bfffa208081ba6b98061"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Function to initialize players collection
export const initializePlayers = async () => {
  const playersRef = collection(db, 'players');
  
  // Add each player to the database
  for (const player of samplePlayers) {
    const playerId = player.name?.toLowerCase().replace(/\s+/g, '-');
    if (playerId) {
      await setDoc(doc(playersRef, playerId), {
        ...player,
        id: playerId,
      });
    }
  }
};

// Initialize players if needed
initializePlayers().catch(console.error);