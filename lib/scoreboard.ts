import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Score } from '../app/types';

// スコアをFirestoreに保存
export const saveScore = async (score: Omit<Score, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const scoreData = {
      ...score,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'scores'), scoreData);
    console.log('スコアが保存されました:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('スコア保存エラー:', error);
    return null;
  }
};

// 上位スコアを取得（資産順）
export const getTopScores = async (limitCount: number = 10): Promise<Score[]> => {
  try {
    const q = query(
      collection(db, 'scores'),
      orderBy('wealth', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const scores: Score[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        id: doc.id,
        playerName: data.playerName,
        wealth: data.wealth,
        goodness: data.goodness,
        ability: data.ability,
        age: data.age,
        turns: data.turns,
        gameOverReason: data.gameOverReason,
        timestamp: data.timestamp,
        createdAt: data.createdAt.toDate(),
      });
    });
    
    return scores;
  } catch (error) {
    console.error('スコア取得エラー:', error);
    return [];
  }
};

// 最新のスコアを取得
export const getRecentScores = async (limitCount: number = 10): Promise<Score[]> => {
  try {
    const q = query(
      collection(db, 'scores'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const scores: Score[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scores.push({
        id: doc.id,
        playerName: data.playerName,
        wealth: data.wealth,
        goodness: data.goodness,
        ability: data.ability,
        age: data.age,
        turns: data.turns,
        gameOverReason: data.gameOverReason,
        timestamp: data.timestamp,
        createdAt: data.createdAt.toDate(),
      });
    });
    
    return scores;
  } catch (error) {
    console.error('スコア取得エラー:', error);
    return [];
  }
}; 