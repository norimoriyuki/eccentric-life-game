import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
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

// 期間判定のヘルパー関数
const isWithinDateRange = (createdAt: Date): boolean => {
  const startDate = new Date('2025-06-03T14:00:00.000Z');
  const endDate = new Date('2028-01-01T00:00:00.000Z');
  return createdAt >= startDate && createdAt < endDate;
};

// 上位スコアを取得（資産順・期間限定）
export const getTopScores = async (limitCount: number = 10): Promise<Score[]> => {
  try {
    // より多くのデータを取得してクライアントサイドでフィルタリング
    const q = query(
      collection(db, 'scores'),
      orderBy('wealth', 'desc'),
      limit(Math.max(limitCount * 3, 500)) // 期間フィルタ後に十分なデータが残るよう多めに取得
    );
    
    const querySnapshot = await getDocs(q);
    const allScores: Score[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const score: Score = {
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
      };
      allScores.push(score);
    });
    
    // 期間でフィルタリングして上位を取得
    const filteredScores = allScores
      .filter(score => isWithinDateRange(score.createdAt))
      .sort((a, b) => b.wealth - a.wealth)
      .slice(0, limitCount);
    
    console.log(`期間限定スコア取得: 全${allScores.length}件中${filteredScores.length}件が対象期間内`);
    return filteredScores;
  } catch (error) {
    console.error('スコア取得エラー:', error);
    return [];
  }
};

// 最新のスコアを取得（期間限定）
export const getRecentScores = async (limitCount: number = 10): Promise<Score[]> => {
  try {
    // 期間設定: 2025/6/4 00:00:00 から 2028/1/1 00:00:00
    const startDate = new Date('2025-06-03T14:00:00.000Z');
    const endDate = new Date('2028-01-01T00:00:00.000Z');
    
    const q = query(
      collection(db, 'scores'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc'),
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