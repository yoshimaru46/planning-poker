import { SquareLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex justify-center">
      <SquareLoader size={50} color="#000000" loading={true} />
    </div>
  );
};

export default Loader;
