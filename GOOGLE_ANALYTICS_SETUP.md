# Google Analytics 設定手順

このプロジェクトにGoogle Analytics 4（GA4）が統合されました。

## 設定手順

### 1. Google Analytics アカウントの設定

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 新しいプロパティを作成
3. 測定IDを取得（例：`G-XXXXXXXXXX`）

### 2. 環境変数の設定

プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下を追加：

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**注意：** `G-XXXXXXXXXX` を実際の測定IDに置き換えてください。

### 3. 現在の統合内容

以下の機能が自動的に追跡されます：

#### 基本的な分析
- ページビュー
- セッション時間
- ユーザー数
- デバイス情報

#### ゲーム特有のイベント
- `game_start`: ゲーム開始時
  - プレイヤー名
  - 初期ステータス（資産、信用、能力、年齢）
- `card_selection`: カード選択時
  - ターン数
  - 選択したポジティブカード
  - 選択したネガティブカード
- `game_end`: ゲーム終了時
  - 終了理由
  - 最終ステータス
  - 生存ターン数
- `card_effect`: カード効果発動時
  - カード名
  - 効果タイプ
  - ステータス変化
- `settings_change`: 設定変更時

### 4. カスタムイベント追跡の使用方法

任意のコンポーネントでイベントを追跡したい場合：

```typescript
import { trackGameEvent, trackEvent } from './components/GoogleAnalytics'

// ゲーム特有のイベント
trackGameEvent.gameStart('プレイヤー名', { wealth: 100, goodness: 50, ability: 75, age: 20 })

// 一般的なイベント
trackEvent('button_click', 'user_interaction', 'restart_game')
```

### 5. プライバシーに関する注意事項

- Google Analytics は匿名化されたデータのみを収集します
- 個人を特定できる情報は収集されません
- ゲーム内のプレイヤー名は統計目的でのみ使用されます

### 6. 開発環境での動作

- 開発環境（localhost）でもGoogle Analyticsは動作します
- 本番環境とは別のプロパティを使用することを推奨します

## トラブルシューティング

### データが表示されない場合

1. 測定IDが正しく設定されているか確認
2. `.env.local` ファイルが正しい場所にあるか確認
3. ブラウザの開発者ツールでネットワークタブを確認し、Google Analyticsへのリクエストが送信されているか確認
4. Google Analytics のリアルタイムレポートを確認

### コンソールエラーが出る場合

- 広告ブロッカーが有効になっている可能性があります
- Google Analytics のスクリプトが正しく読み込まれているか確認してください

## 削除方法

Google Analytics を削除したい場合：

1. `app/components/GoogleAnalytics.tsx` を削除
2. `app/layout.tsx` から Google Analytics の import と使用を削除
3. `.env.local` から `NEXT_PUBLIC_GA_MEASUREMENT_ID` を削除 