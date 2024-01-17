import firebase, { initializeApp } from 'firebase/app';
import 'firebase/firestore';
import { Firestore, getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';


class FirebaseService {
  private database: Firestore;

  constructor() {
    const firebaseConfig = {
        apiKey: 'AIzaSyC44hOXavfrNl5DmUsFLrnGJKVBn_PrO1Q',
        authDomain: 'viso-test-app-1.firebaseapp.com',
        projectId: 'viso-test-app-1',
        storageBucket: 'viso-test-app-1.appspot.com',
        messagingSenderId: '988680272329',
        appId: '1:988680272329:web:07f16b33cb5d8af9da1018',
        measurementId: 'G-3TJYDHL1GP'
    };

    const app = initializeApp(firebaseConfig);
    this.database = getFirestore(app);
  }


  async fetchData<T>(collectionPath: string, documentId: string): Promise<{ data: T | null; docId: string | null }> {
    try {
      const docRef = doc(this.database, collectionPath, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { data: docSnap.data() as T, docId: docSnap.id };
      } else {
        return { data: null, docId: null };
      }
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      throw error;
    }
  }

  async fetchMarkersData(collectionPath: string): Promise<Array<any>> {
    try {
      const querySnapshot = await getDocs(collection(this.database, collectionPath));
      const markersData: Array<any> = [];

      querySnapshot.forEach((doc) => {
        markersData.push({ id: doc.id, data: doc.data() });
      });

      return markersData;
    } catch (error) {
      console.error('Error fetching markers data from Firestore:', error);
      throw error;
    }
  }

  async sendData<T>(collectionPath?: string, documentId?: string, data?: T): Promise<void> {
    try {
      const docRef = doc(collection(this.database, collectionPath || ''), documentId || '');
      await setDoc(docRef, data as any);
    } catch (error) {
      console.error('Error sending data to Firestore:', error);
      throw error;
    }
  }

  async deleteData(collectionPath: string, documentId: string): Promise<void> {
    try {
      const docRef = doc(this.database, collectionPath, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting data from Firestore:', error);
      throw error;
    }
  }
}


export default FirebaseService;
