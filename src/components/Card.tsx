import { useEffect, useRef, useState } from "react";

type Props = {
  point: number;
  hide: boolean;
};

/**
 * 縦軸を中心に180°回転するカードフリップ。
 *
 * 構造:
 *   <perspective wrapper>          ← 奥行き感を付与
 *     <card (preserve-3d)>         ← 表裏を持つ3D物体。isRevealed で回転
 *       <back face>                ← 裏面: 常に front から180°裏側
 *       <front face>               ← 表面: rotateY(180deg) で初期状態は裏を向く
 *     </card>
 *   </perspective wrapper>
 *
 * isRevealed=false → card は rotateY(0)   → 裏面が正面を向く
 * isRevealed=true  → card は rotateY(180) → 表面が正面を向く
 */
const Card = ({ point, hide }: Props) => {
  const prevHideRef = useRef(hide);
  // hide=false（自分カード・公開済み）は最初から表向き
  const [isRevealed, setIsRevealed] = useState(!hide);

  useEffect(() => {
    const wasHidden = prevHideRef.current;
    prevHideRef.current = hide;

    if (wasHidden !== hide) {
      setIsRevealed(!hide);
    }
  }, [hide]);

  return (
    // perspective は親要素に置くと自然な奥行き感になる
    <div className="w-16 h-24 cursor-pointer" style={{ perspective: "300px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 裏面: デフォルト位置（rotateY=0）で正面を向く */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img className="w-full" src="/img/cards/back-side.png" alt="back" />
        </div>

        {/* 表面: 最初は裏を向いており、180°回転で正面に出てくる */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <img className="w-full" src={`/img/cards/${point}.png`} alt={`${point}`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
