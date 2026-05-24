# Plan: Your Hand のレイアウトシフト修正

## Context

「Your Hand」でカードを選択すると `selectableStoryPoints` から該当ポイントが除外され、
flex コンテナが再計算されてレイアウトシフトが発生する。

## 根本原因

```ts
// Room.tsx L149-153
const selectableStoryPoints = STORY_POINTS.filter(
  (p) => p !== selectedCardHistories.find((h) => h.userId === user?.uid)?.storyPoint
);
```

選択済みカードを配列から**消す**ため、flex wrap が再計算されてガタつく。

## 解決方針

カードを配列から消さず、**全カードを常にレンダリングし、選択済みカードを視覚的に無効化**する。

- `selectableStoryPoints` → `STORY_POINTS` 全件を使う
- 各カードに `isSelected` フラグを持たせ、選択済みなら：
  - `opacity-40` + `cursor-not-allowed` でグレーアウト
  - クリック/ドラッグを無効化
- スロットが常に存在するのでレイアウトは一切動かない

## 変更ファイル

`src/components/Room.tsx` のみ

### 変更詳細

1. **`selectableStoryPoints` を削除**し、代わりに選択済みポイントを保持する変数を用意

```ts
const mySelectedPoint = selectedCardHistories.find(
  (h) => h.userId === user?.uid
)?.storyPoint;
```

2. **Your Hand のレンダリングを `STORY_POINTS` 全件に変更**

```tsx
{STORY_POINTS.map((storyPoint) => {
  const isSelected = storyPoint === mySelectedPoint;
  return (
    <div
      key={storyPoint}
      className={`w-1/12 p-2 m-2 ${isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={isSelected ? undefined : () => addSelectCardHistory({ id: storyPoint })}
    >
      <CardItem id={storyPoint} disabled={isSelected}>
        <Card point={storyPoint} hide={false} />
      </CardItem>
    </div>
  );
})}
```

3. **`CardItem` に `disabled` prop を追加**し、`useDrag` を無効化

```tsx
interface CardItemProps {
  id: number;
  disabled?: boolean;
  children: ReactNode;
}

const CardItem = ({ id, disabled, children }: CardItemProps) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: CARD_TYPE,
      item: { id },
      canDrag: !disabled,   // ← 追加
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [id, disabled]
  );
  ...
};
```

## 確認方法

1. `npm run dev` でローカル起動
2. Your Hand でカードをクリックまたはドラッグ → 選択済みカードがグレーアウトし、他のカードが動かないことを確認
3. 別のカードを選択 → グレーアウトが移動し、前のカードが再びアクティブになることを確認
