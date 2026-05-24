type Props = {
  point: number;
  hide: boolean;
};

const Card = ({ point, hide }: Props) => {
  const url = hide
    ? `/img/cards/back-side.png`
    : `/img/cards/${point}.png`;

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg w-16 h-24 cursor-pointer">
      <img className="w-full" src={url} alt={`${point}`} />
    </div>
  );
};

export default Card;
