import React from "react";

type Props = {
  point: number;
  hide: boolean;
};

const Card: React.FC<Props> = ({ point, hide }: Props) => {
  const url = hide
    ? `${process.env.PUBLIC_URL}/img/cards/back-side.png`
    : `${process.env.PUBLIC_URL}/img/cards/${point}.png`;

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg w-32 h-48 cursor-pointer">
      <img className="w-full" src={url} alt={`${point}`} />
    </div>
  );
};

export default Card;
