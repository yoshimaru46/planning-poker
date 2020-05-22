import React from "react";

import { SquareLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex justify-center">
      <SquareLoader
        size={50}
        loading={true}
      />
    </div>
  );
};

export default Loader;
