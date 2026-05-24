import React from "react";

import { JoinRoomHistory } from "./Room";

type Props = {
  joinRoomHistories: JoinRoomHistory[];
  votedUserIds: string[];
};

const RoomMembers: React.FC<Props> = ({ joinRoomHistories, votedUserIds }: Props) => {
  return (
    <>
      <p className="bg-gray-800 text-white font-bold text-xl p-4 mb-4">
        Users{" "}
        <span className="text-gray-400 text-sm font-normal">
          ({votedUserIds.length}/{joinRoomHistories.length} voted)
        </span>
      </p>

      <ul>
        {joinRoomHistories.map((u) => {
          const hasVoted = votedUserIds.includes(u.userId);
          return (
            <li
              key={u.userId}
              className="flex items-center ml-4 mr-4 mb-4 pb-2 border-b-2 border-gray-500"
            >
              <div className="relative">
                <img
                  className="w-10 h-10 rounded-full"
                  src={u.photoURL}
                  alt={u.userName}
                />
                {hasVoted && (
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-sm ml-4 flex-1 flex items-center justify-between">
                <p className="text-gray-900 leading-none">{u.userName}</p>
                {!hasVoted && (
                  <span className="text-gray-500 text-xs">待機中</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default RoomMembers;
