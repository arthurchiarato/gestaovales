// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 🔁 Substitua pelos dados reais do seu projeto no Firebase
const firebaseConfig = {
   apiKey: "AIzaSyAt2j8t-PwLNtd2BWKgByKnNk8eCj3jWOM",
  authDomain: "vale-simplificado.firebaseapp.com",
  projectId: "vale-simplificado",
  storageBucket: "vale-simplificado.firebasestorage.app",
  messagingSenderId: "400799616801",
  appId: "1:400799616801:web:f2a218915eeac2211fb860"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
