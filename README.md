# 💀 エキセントリック人生ゲーム

リアル人生ゲーム - 資産、信用、能力、年齢を管理して生き抜け！

## 🎮 ゲームについて

PWA（Progressive Web App）対応の人生シミュレーションゲームです。
カードベースのゲームシステムで、リスクとリターンを考えて選択を行います。

## 🚀 アップデート機能

### 自動更新
- アプリは自動的に最新バージョンをチェックします
- 新しいバージョンが利用可能な場合、3秒のカウントダウン後に自動更新されます
- 「今すぐ更新」ボタンで即座に更新することも可能です

### 開発者向け：アップデートの配信方法
1. `public/sw.js` の `CACHE_NAME` のバージョン番号を上げる
   ```javascript
   const CACHE_NAME = 'eccentric-life-game-v3'; // v2 → v3 に変更
   ```
2. デプロイすると、ユーザーの端末で自動的に更新通知が表示されます

## 📱 キャッシュクリア方法

### iPhone (Safari)
1. **設定** → **Safari** → **詳細** → **Webサイトデータ**
2. 該当サイトを探して削除
3. または **設定** → **Safari** → **履歴とWebサイトデータを消去**

### Android (Chrome)
1. **Chrome設定** → **プライバシーとセキュリティ** → **閲覧履歴データの削除**
2. **キャッシュされた画像とファイル** + **Cookieとサイトデータ** を選択
3. 期間を **全期間** にして削除

### PWAアプリの場合
1. **アプリを長押し** → **アプリ情報**
2. **ストレージ** → **キャッシュを削除** または **データを削除**

## 💻 開発環境

```bash
npm run dev     # 開発サーバー起動
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動
```

### 開発時の注意
- 開発環境ではService Workerは無効化されます
- 本番環境でのみPWA機能が有効になります

## 🔧 技術スタック

- **Next.js 14** - React フレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **PWA** - Progressive Web App対応
- **Service Worker** - キャッシュ管理・自動更新

## 📝 ゲーム仕様

- **ポジティブカード**: プレイヤーが選択する行動
- **ネガティブカード**: 選択数に応じてランダムで選ばれるリスク
- **ステータス**: 資産、信用、能力、年齢の4つを管理
- **ゲームオーバー**: 年齢80歳到達、または各種リスクによる死亡

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
