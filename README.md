# Legend of Astra 〜星の伝説〜

> **完全オリジナルのJRPG風Webゲーム** — ドラゴンクエストのような「コマンド選択式ターン制RPG」の雰囲気を参考にした、完全オリジナル作品です。原作の固有名詞・キャラクター・音楽・画像・文章は一切使用していません。

![Legend of Astra Title Screen](https://img.shields.io/badge/Legend%20of%20Astra-JRPG-gold?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web%20Browser-green?style=for-the-badge)

## 🌐 プレイURL

**GitHub Pages:** https://tailofyukki-cell.github.io/legend-of-astra/

## 📖 ゲーム概要

アストラの大地を脅かす「闇の王ヴェイン」を倒すべく、勇者が旅立つ。  
フィールドを探索し、村人と会話し、ダンジョンを攻略してボスを倒せ！

### 世界観

| 場所 | 説明 |
|------|------|
| アストラのフィールド | 広大なフィールド。ゴブリンやコウモリが徘徊する |
| ルーナ村 | 旅の拠点。宿屋・道具屋・村人がいる |
| 影の洞窟 | 闇の王ヴェインが潜む危険なダンジョン |

## 🎮 操作方法

### PC（キーボード）

| キー | 動作 |
|------|------|
| 矢印キー / WASD | 移動 |
| Enter / Space / Z | 決定・調べる |
| ESC / X | メニューを開く |

### スマートフォン

| 操作 | 動作 |
|------|------|
| スワイプ | 移動 |
| タップ | 決定・調べる |
| 画面下の仮想パッド | 移動 |
| メニューボタン | メニューを開く |

## ⚔️ 戦闘システム

### コマンド

| コマンド | 説明 |
|---------|------|
| たたかう | 通常攻撃。ダメージ = max(1, 攻撃力 - 防御力/2 + ランダム) |
| まほう | 習得した魔法を使用。MP消費 |
| どうぐ | 所持アイテムを使用 |
| にげる | 逃走（ボス戦では不可）。速さが高いほど成功しやすい |

### ダメージ計算式

```
物理ダメージ = max(1, 攻撃力 - 防御力/2 + floor(rand * 攻撃力 * 0.2))
魔法ダメージ = max(1, 魔法威力 - 魔法防御 + floor(rand * 魔法威力 * 0.3))
```

### 魔法一覧

| 魔法名 | 習得Lv | MP | 効果 |
|--------|--------|-----|------|
| ヒール | Lv1 | 4 | HP 20〜30 回復 |
| ファイア | Lv2 | 6 | 単体に炎ダメージ |
| ブリザード | Lv4 | 8 | 単体に氷ダメージ |
| ストーム | Lv6 | 10 | 全体に風ダメージ |
| グレートヒール | Lv8 | 12 | HP 60〜80 回復 |
| インフェルノ | Lv10 | 18 | 全体に強力な炎ダメージ |

## 📈 成長要素

- 経験値を獲得してレベルアップ（最大Lv20）
- レベルアップでHP・MP・攻撃・防御・速さが上昇
- 特定レベルで新しい魔法を習得

## 💾 セーブ・ロード

- 村の宿屋（星月亭）に泊まるとセーブ（10G）
- タイトル画面から「つづきから」でロード
- ブラウザのLocalStorageに保存

## 🏃 ローカル実行方法

```bash
# リポジトリをクローン
git clone https://github.com/tailofyukki-cell/legend-of-astra.git
cd legend-of-astra

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:3000 を開く
```

### 本番ビルド

```bash
# 通常ビルド
pnpm build

# GitHub Pages用ビルド
pnpm exec vite build --config vite.config.gh.ts
```

## 🛠️ 技術スタック

| 技術 | 用途 |
|------|------|
| React 19 | UIフレームワーク |
| TypeScript | 型安全な開発 |
| Vite 7 | ビルドツール |
| Tailwind CSS 4 | スタイリング |
| HTML5 Canvas | マップ・キャラクター描画 |
| LocalStorage | セーブデータ |

## 📁 プロジェクト構成

```
legend-of-astra/
├── client/
│   ├── public/
│   │   └── data/          # ゲームデータ（JSON）
│   │       ├── maps.json  # マップデータ
│   │       ├── enemies.json # 敵データ
│   │       └── items.json # アイテム・魔法データ
│   └── src/
│       ├── game/
│       │   ├── GameEngine.ts  # ゲームロジック
│       │   └── GameContext.tsx # 状態管理
│       ├── components/game/
│       │   ├── TitleScreen.tsx
│       │   ├── GameScreen.tsx
│       │   ├── MapCanvas.tsx
│       │   ├── BattleScreen.tsx
│       │   ├── DialogBox.tsx
│       │   ├── MenuScreen.tsx
│       │   └── EndScreens.tsx
│       └── pages/
│           └── Home.tsx
└── .github/workflows/
    └── deploy.yml         # GitHub Pages自動デプロイ
```

## 🎨 素材・クレジット

- フォント: [DotGothic16](https://fonts.google.com/specimen/DotGothic16) / [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) (Google Fonts, OFL)
- タイトル背景・戦闘背景: AI生成画像（Manus Image Generation）
- キャラクター・マップ・敵スプライト: HTML5 Canvas によるオリジナル描画
- BGM・SE: なし（将来追加予定）

## 📄 ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照

```
Copyright (c) 2026 tailofyukki-cell
```

---

## 🗺️ 受入基準チェック

| 項目 | 状態 |
|------|------|
| フィールドを移動できる（PC操作） | ✅ |
| ランダムエンカウントが起こり、戦闘に遷移する | ✅ |
| コマンド式ターン制戦闘（攻撃/魔法/道具/逃走）が動く | ✅ |
| 経験値とレベルアップがある | ✅ |
| 村/NPC会話/回復手段がある | ✅ |
| ダンジョンとボスがあり、倒すとクリアになる | ✅ |
| GitHub Pagesで公開されている | ✅ |
| 原作の固有名詞・素材を使っていない（オリジナル） | ✅ |

---

*100日チャレンジ Day 1 — 2026/02/22*
