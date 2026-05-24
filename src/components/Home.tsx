import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { loginWithGithub } from "../firebase/loginWithGithub";
import { loginAnonymously } from "../firebase/loginAnonymously";
import { logoutWithGithub } from "../firebase/logoutWithGithub";
import Loader from "./Loader";

const Home = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);
  const [devName, setDevName] = useState("");

  return (
    <div className="w-full flex flex-wrap">
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
          <a href="/" className="bg-black text-white font-bold text-2xl p-4">
            Planning Poker
          </a>
        </div>

        <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
          {user === undefined && <Loader />}

          {user === null && (
            <>
              <p className="text-center text-3xl">Welcome.</p>
              <div className="text-center pt-12 pb-12">
                <button
                  className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
                  onClick={loginWithGithub}
                >
                  Login with GitHub
                </button>
              </div>

              {import.meta.env.DEV && (
                <div className="border border-dashed border-gray-400 rounded p-4 mt-4">
                  <p className="text-center text-xs text-gray-500 mb-3">
                    ⚙️ Dev only
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="表示名（例: Alice）"
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                    />
                    <button
                      disabled={!devName.trim()}
                      className="bg-gray-600 hover:bg-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1 px-3 rounded text-sm"
                      onClick={() => loginAnonymously(devName.trim())}
                    >
                      匿名で参加
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {user && (
            <>
              <p className="text-center text-3xl">Hi, {user.displayName}</p>
              <div className="text-center pt-12 pb-12">
                <button
                  className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
                  onClick={() => navigate("/create-room")}
                >
                  Join or Create a room
                </button>
              </div>

              <div className="text-center">
                <button
                  className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded text-xl border-black border-2"
                  onClick={logoutWithGithub}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-1/2 shadow-2xl">
        <img
          className="object-cover w-full h-screen hidden md:block"
          alt="home-bg"
          src="/img/home-bg.png"
        />
      </div>
    </div>
  );
};

export default Home;
