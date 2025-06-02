# Card Icon Generator

OpenAI GPT-4oとResponses APIを使用してカードアイコンのPNG画像を生成するスクリプトです。`public/dummy.png`をスタイル参照として使用し、カード名に基づいて高品質な画像を生成します。

## 新機能 (GPT-4o対応)

- **高品質生成**: GPT-4oによる大幅に向上した画像品質
- **スタイル参照**: 参照画像をより正確に理解し反映
- **詳細な指示対応**: より複雑で詳細な指示に対応
- **改善されたテキストレンダリング**: 画像内のテキスト表現が向上
- **リアルタイム知識**: 実世界の知識を活用した画像生成

## セットアップ

### 1. 依存関係のインストール

```bash
pip install -r requirements.txt
```

### 2. OpenAI API キーの設定

環境変数でOpenAI API キーを設定してください：

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

または、`.env`ファイルに保存することもできます：

```bash
echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
```

### 3. API Organization Verification (必要に応じて)

GPT-4oを使用するには、開発者コンソールでAPI Organization Verificationを完了する必要がある場合があります。

## 使用方法

### 単一カードアイコンの生成

基本的な使用方法：

```bash
python generate_card_icons.py "Fire Dragon" fire_dragon_001
```

カスタムオプション付き：

```bash
python generate_card_icons.py "Ice Crystal" ice_crystal_001 \
  --reference public/dummy.png \
  --output-dir public/card-images
```

### バッチ生成（複数カード）

JSONファイルからの一括生成：

```bash
python batch_generate_cards.py sample_cards.json
```

オプション付きのバッチ生成：

```bash
python batch_generate_cards.py sample_cards.json \
  --reference public/dummy.png \
  --output-dir public/card-images \
  --delay 3.0 \
  --resume
```

### 入力ファイル形式

#### JSON形式

```json
{
  "cards": [
    {
      "id": "fire_dragon",
      "name": "Fire Dragon",
      "description": "A powerful dragon breathing flames"
    },
    {
      "id": "ice_crystal", 
      "name": "Ice Crystal",
      "description": "A magical ice crystal with freezing powers"
    }
  ]
}
```

または、シンプルな配列形式：

```json
[
  {
    "id": "fire_dragon",
    "name": "Fire Dragon"
  },
  {
    "id": "ice_crystal",
    "name": "Ice Crystal"
  }
]
```

#### CSV形式

```csv
id,name,description
fire_dragon,Fire Dragon,A powerful dragon breathing flames
ice_crystal,Ice Crystal,A magical ice crystal with freezing powers
```

## コマンドラインオプション

### generate_card_icons.py

- `card_name`: 生成するカードの名前または説明
- `card_id`: 出力ファイル名のID（.png拡張子は不要）
- `--reference, -r`: スタイル参照画像のパス（デフォルト: `public/dummy.png`）
- `--output-dir, -o`: 出力ディレクトリ（デフォルト: `public/card-images`）

### batch_generate_cards.py

- `input_file`: カードデータを含むJSONまたはCSVファイル
- `--reference, -r`: スタイル参照画像のパス（デフォルト: `public/dummy.png`）
- `--output-dir, -o`: 出力ディレクトリ（デフォルト: `public/card-images`）
- `--delay, -d`: API呼び出し間の遅延（秒）（デフォルト: 2.0）
- `--resume`: 前回の進行状況から再開

## 出力

生成された画像は以下の形式で保存されます：
- ファイル名: `{id}.png`
- 場所: `public/card-images/`
- サイズ: 1024x1024 ピクセル（高品質設定）
- 形式: PNG（透明背景対応）
- 品質: 高品質（GPT-4o標準）

## GPT-4oの特徴

### 1. 高品質画像生成
従来のDALL-E 3と比較して大幅に向上した画像品質を提供します。

### 2. 改善されたスタイル理解
参照画像のスタイルをより正確に理解し、一貫性のある画像を生成します。

### 3. 詳細な指示対応
複雑で詳細な指示により正確に従うことができます。

### 4. リビジョンプロンプト
生成された画像と共に、AIが最適化したプロンプトも確認できます。

## コストと制限事項

### トークン数とコスト
GPT-4oは画像トークンベースの料金体系を使用します：

| 品質 | 正方形 (1024×1024) | 縦長 (1024×1536) | 横長 (1536×1024) |
|------|-------------------|------------------|------------------|
| 低   | 272 tokens        | 408 tokens       | 400 tokens       |
| 中   | 1056 tokens       | 1584 tokens      | 1568 tokens      |
| 高   | 4160 tokens       | 6240 tokens      | 6208 tokens      |

### レイテンシ
- 複雑なプロンプトは処理に最大2分かかる場合があります
- バッチ生成では`--delay`オプションで間隔を調整してください（推奨: 2-3秒）

## 注意事項

1. **API制限**: GPT-4oのAPI制限に注意してください。バッチ生成では`--delay`オプションで呼び出し間隔を調整できます。

2. **コスト**: GPT-4oの使用には料金がかかります。高品質設定では多くのトークンを使用します。

3. **進行状況**: バッチ生成では`.generation_progress.json`ファイルで進行状況を保存し、`--resume`オプションで中断したところから再開できます。

4. **画像品質**: GPT-4oは参照画像のスタイルをより正確に反映しますが、完全に一致するとは限りません。

5. **Content Moderation**: すべてのプロンプトと生成画像はコンテンツポリシーに従ってフィルタリングされます。

## トラブルシューティング

### よくあるエラー

1. **APIキーエラー**: `OPENAI_API_KEY`環境変数が正しく設定されているか確認してください。

2. **参照画像が見つからない**: `public/dummy.png`が存在するか確認してください。

3. **権限エラー**: 出力ディレクトリへの書き込み権限があるか確認してください。

4. **レート制限**: API呼び出しが多すぎる場合は、`--delay`オプションで遅延を増やしてください（推奨: 2-3秒）。

5. **Organization Verification**: GPT-4oを使用するには、OpenAIの開発者コンソールでAPI Organization Verificationが必要な場合があります。

## 例

### 単一カード生成の例

```bash
# ファイアドラゴンのアイコンを生成
python generate_card_icons.py "Fire Dragon" fire_dragon_001

# より詳細な説明でアイスクリスタルを生成
python generate_card_icons.py "Magical ice crystal with blue glow and sparkling effects" ice_crystal_001
```

### バッチ生成の例

```bash
# サンプルカードを一括生成
python batch_generate_cards.py sample_cards.json

# 3秒の遅延で高品質生成（API制限対策）
python batch_generate_cards.py sample_cards.json --delay 3.0

# 中断したバッチ生成を再開
python batch_generate_cards.py sample_cards.json --resume
```

## 新APIの利点

- **高品質**: GPT-4oによる大幅に向上した画像品質
- **一貫性**: スタイル参照がより正確に反映される
- **柔軟性**: より詳細で複雑な指示に対応
- **効率**: より効率的なAPI設計
- **透明性**: リビジョンプロンプトで生成過程を確認可能 