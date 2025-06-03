# Firebase設定ガイド

スコアボード機能を使用するために、Firebaseプロジェクトを設定する必要があります。

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力（例：eccentric-life-game）
4. Google Analyticsは任意（不要であれば無効化）
5. プロジェクトを作成

## 2. Firestoreデータベースの設定

1. Firebaseコンソールで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. セキュリティルールは「テストモードで開始」を選択（開発用）
4. ロケーションを選択（asia-northeast1など）

## 3. Firebase設定の取得

1. Firebaseコンソールで「プロジェクトの設定」（歯車アイコン）をクリック
2. 「全般」タブの「マイアプリ」セクションで「ウェブアプリを追加」
3. アプリのニックネームを入力
4. 「Firebase SDK snippet」から設定値をコピー

## 4. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の形式で設定：

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. セキュリティルール（本番環境用）

開発が完了したら、Firestoreのセキュリティルールを以下のように設定することを推奨：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // スコアコレクションは読み取り可能、書き込み可能
    match /scores/{document} {
      allow read, write: if true;
    }
  }
}
```

## スコアデータの構造

Firestoreに保存されるスコアデータの構造：

```typescript
{
  playerName: string,      // プレイヤー名
  wealth: number,          // 資産
  goodness: number,        // 善良さ
  ability: number,         // 能力
  age: number,             // 年齢
  turns: number,           // ターン数
  gameOverReason: string,  // ゲームオーバー理由
  timestamp: number,       // タイムスタンプ
  createdAt: Date          // 作成日時
}
``` 