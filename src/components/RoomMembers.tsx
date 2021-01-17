import React from "react";

import { JoinRoomHistory } from "./Room";

type Props = {
  joinRoomHistories: JoinRoomHistory[];
};

const RoomMembers: React.FC<Props> = ({ joinRoomHistories }: Props) => {
  return (
    <>
      <p className="bg-gray-800 text-white font-bold text-xl p-4 mb-4">Users</p>

      <ul>
        {joinRoomHistories.map((u) => (
          <li
            key={u.userId}
            className="flex items-center ml-4 mb-4 pb-2 border-b-2 border-gray-500"
          >
            <img
              className="w-10 h-10 rounded-full"
              src={u.photoURL}
              alt={u.userName}
            />
            <div className="text-sm ml-4">
              <p className="text-gray-900 leading-none">{u.userName}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default RoomMembers;
