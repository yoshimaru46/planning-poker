# カード選択アニメーション追加

## Context
現在、カードの選択操作に視覚的なフィードバックがほとんどない。
- Your Hand のカードをクリックしても変化は `opacity-40` に切り替わるだけ（即座、アニメーションなし）
- Selected Cards エリアへのカード追加も即座に表示される
- ホバー時のフィードバックもない

カード選択時にアニメーションを入れることで、操作感と楽しさが向上する。

---

## 変更対象ファイル

1. `tailwind.config.js` — カスタム keyframe を追加
2. `src/components/Room.tsx` — Your Hand・Selected Cards のラッパー div にアニメーションクラスを付与
3. `src/components/Card.tsx` — カード画像自体にトランジションを追加（任意）

---

## 実装内容

### 1. `tailwind.config.js` — カスタムアニメーション追加

```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "card-pop": {
          "0%":   { transform: "scale(0.7) translateY(8px)", opacity: "0" },
          "60%":  { transform: "scale(1.1) translateY(-2px)" },
          "100%": { transform: "scale(1) translateY(0)",    opacity: "1" },
        },
      },
      animation: {
        "card-pop": "card-pop 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
```

### 2. `src/components/Room.tsx` — Your Hand セクション（L360–372）

#### 変更前
```jsx
className={`w-1/12 p-2 m-2 ${isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
```

#### 変更後
```jsx
className={`w-1/12 p-2 m-2 transition-all duration-200 select-none ${
  isSelected
    ? "opacity-40 cursor-not-allowed scale-95"
    : "cursor-pointer hover:-translate-y-2 hover:scale-110 active:scale-95 active:translate-y-0"
}`}
```

効果:
- **hover**: カードが上に浮く (`-translate-y-2`) + わずかに拡大 (`scale-110`)
- **active(押下中)**: 少し沈む感触 (`scale-95`)
- **選択済み**: フェードアウト + 若干縮小 (`scale-95`) でデッキに戻った感
- **transition-all duration-200**: 全状態変化をスムーズに

### 3. `src/components/Room.tsx` — Selected Cards セクション（L283–285）

#### 変更前
```jsx
<div
  key={h.userId + h.storyPoint}
  className="w-1/12 p-2 m-2"
>
```

#### 変更後
```jsx
<div
  key={h.userId + h.storyPoint}
  className="w-1/12 p-2 m-2 animate-card-pop"
>
```

効果:
- カードが Selected Cards エリアに追加される瞬間に pop アニメーション

---

## アニメーション設計方針

| 場面 | アニメーション | 狙い |
|------|--------------|------|
| Your Hand ホバー | 浮き上がり + 拡大 | 「選べる」感を強調 |
| クリック瞬間 | わずかに沈む | 物理的なクリック感 |
| 選択後フェード | opacity+scale のスムーズ変化 | 「使った」感 |
| Selected Cards に追加 | ポップイン | 「選択が反映された」という達成感 |

---

## 検証方法

1. `yarn dev` でアプリを起動
2. ルームに入り Your Hand のカードにホバー → 浮き上がりアニメーションを確認
3. カードをクリック → 押し込み感 → Selected Cards エリアへのポップイン確認
4. Your Hand のカードが `scale-95 + opacity-40` でスムーズにフェードすることを確認
5. 別ブラウザから同じルームに参加し、他者のカード選択でも Selected Cards のポップインが動作することを確認
