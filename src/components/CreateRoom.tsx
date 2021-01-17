import React, { useContext, useState } from "react";

import { db } from "../Firebase";
import { useHistory } from "react-router-dom";
import Navbar from "./Navbar";
import { UserContext } from "./UserContext";
import firebase from "firebase/app";

const CreateRoom: React.FC = () => {
  const user = useContext(UserContext);

  const history = useHistory();

  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<undefined | string>(undefined);

  const createRoom = () => {
    if (!user) {
      console.error("user is undefined!");
      return;
    }

    db.collection("rooms")
      .add({
        creator_id: user.uid,
      })
      .then((res) => {
        firebase.analytics().logEvent('room_created');
        history.push(`/rooms/${res.id}`);
      });
  };

  // @ts-ignore
  const handleSubmit = (e) => {
    e.preventDefault();

    const docRef = db.collection("rooms").doc(roomId);

    docRef.get().then((doc) => {
      if (doc.exists) {
        firebase.analytics().logEvent('join_room');
        history.push(`/rooms/${roomId}`);
      } else {
        setError("Room does not exists. Please enter another Room ID.");
      }
    });
  };

  const isSubmitDisabled = roomId.length === 0;

  return (
    <div className="w-full flex flex-wrap">
      <Navbar />

      <div
        className="w-full md:w-1/2 flex flex-col"
        style={{ height: "calc(100vh - 6em)" }}
      >
        <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
          <div className="text-center">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-md font-bold mb-2"
                  htmlFor="inputRoomID"
                >
                  Room ID
                </label>
                <input
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    error ? "border-red-500" : ""
                  } `}
                  id="inputRoomID"
                  type="text"
                  placeholder="Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                {error && (
                  <p className="text-red-500 text-xs italic">{error}</p>
                )}
              </div>

              <input
                disabled={isSubmitDisabled}
                className={`bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl ${
                  isSubmitDisabled ? "cursor-not-allowed" : ""
                }`}
                type="submit"
                value="Join a room"
              />
            </form>
          </div>
        </div>
      </div>

      <div
        className="w-full md:w-1/2 flex flex-col bg-gray-300"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
          <div className="text-center">
            <button
              className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
              onClick={createRoom}
            >
              Create a new room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
