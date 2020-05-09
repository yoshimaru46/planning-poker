import React, { useContext, useEffect, useRef, useState } from "react";

import { db } from "../Firebase";
import { useLocation } from "react-router-dom";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

import Navbar from "./Navbar";
import RoomMembers from "./RoomMembers";
import Card from "./Card";
import { UserContext } from "./UserContext";

export interface JoinRoomHistory {
  roomId: string;
  userId: string;
  userName: string;
  photoURL: string;
}

interface SelectedCardHistories {
  roomId: string;
  userId: string;
  userName: string;
  storyPoint: number;
  createdAt: Date;
  hide: boolean;
}

const STORY_POINTS = [0.5, 1, 2, 3, 5, 8];

const Room: React.FC = () => {
  const user = useContext(UserContext);

  const [joinRoomHistories, setJoinRoomHistories] = useState<JoinRoomHistory[]>(
    []
  );
  const [selectedCardHistories, setSelectedCardHistories] = useState<
    SelectedCardHistories[]
  >([]);

  const isHideAllCards = selectedCardHistories.every((h) => h.hide);

  const location = useLocation();
  const roomId = location.pathname.split("/")[2];

  const selectableStoryPoints = () => {
    const myHistory = selectedCardHistories.find(
      (data) => data.userId === user?.uid
    );
    return STORY_POINTS.filter((p) => p !== myHistory?.storyPoint);
  };

  const createJoinRoomHistories = async () => {
    if (!user) {
      console.error("user is undefined!");
      return;
    }

    const querySnapshot = await db
      .collection("join_room_histories")
      .where("room_id", "==", roomId)
      .where("user_id", "==", user.uid)
      .get();

    if (querySnapshot.size === 0) {
      await db.collection("join_room_histories").doc().set({
        room_id: roomId,
        user_id: user.uid,
        user_name: user.displayName,
        photo_url: user.photoURL,
      });
    }
  };

  const deleteJoinRoomHistories = async () => {
    if (!user) {
      console.error("user is undefined!");
      return;
    }

    const query = await db
      .collection("join_room_histories")
      .where("room_id", "==", roomId)
      .where("user_id", "==", user.uid)
      .get();

    for (const doc of query.docs) {
      await doc.ref.delete();
    }
  };

  const getUsersInTheRoom = () => {
    db.collection("join_room_histories")
      .where("room_id", "==", roomId)
      .onSnapshot((querySnapshot) => {
        const histories: JoinRoomHistory[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // @ts-ignore
          histories.push({
            roomId: data.room_id,
            userId: data.user_id,
            userName: data.user_name,
            photoURL: data.photo_url,
          });
        });

        setJoinRoomHistories(histories);
      });
  };

  const addSelectCardHistory = async ({ id }: { type: string; id: number }) => {
    if (!user) {
      console.error("user is undefined!");
      return;
    }

    const query = await db
      .collection("select_card_histories")
      .where("room_id", "==", roomId)
      .where("user_id", "==", user.uid)
      .get();

    for (const doc of query.docs) {
      await doc.ref.delete();
    }

    await db.collection("select_card_histories").doc().set({
      room_id: roomId,
      user_id: user.uid,
      user_name: user.displayName,
      story_point: id,
      created_at: new Date(),
      hide: isHideAllCards,
    });
  };

  const toggleHideAllCards = async (hide: boolean) => {
    db.collection("select_card_histories")
      .where("room_id", "==", roomId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.update({
            hide: hide,
          });
        });
      });
  };

  const resetAllCards = async () => {
    const query = await db
      .collection("select_card_histories")
      .where("room_id", "==", roomId)
      .get();

    for (const doc of query.docs) {
      await doc.ref.delete();
    }

    await toggleHideAllCards(true);
  };

  const getSelectCardHistories = () => {
    db.collection("select_card_histories")
      .where("room_id", "==", roomId)
      .onSnapshot((querySnapshot) => {
        const histories: SelectedCardHistories[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // @ts-ignore
          histories.push({
            roomId: data.room_id,
            userId: data.user_id,
            userName: data.user_name,
            storyPoint: data.story_point,
            createdAt: data.created_at,
            hide: data.hide,
          });
        });

        histories.sort((a, b) => {
          if (a.storyPoint < b.storyPoint) {
            return -1;
          }
          if (a.storyPoint > b.storyPoint) {
            return 1;
          }
          return 0;
        });

        setSelectedCardHistories(histories);
      });
  };

  useEffect(() => {
    createJoinRoomHistories();
    getUsersInTheRoom();
    getSelectCardHistories();

    return () => {
      deleteJoinRoomHistories();
    };
  }, []);

  // @ts-ignore
  const DropZone = ({ addSelectCardHistory, children }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
      accept: "card",
      drop(item) {
        addSelectCardHistory(item);
      },
    });
    drop(ref);
    return (
      <div
        className="flex content-around flex-wrap bg-gray-200"
        style={{ height: "23rem" }}
        ref={ref}
      >
        {" "}
        {children}
      </div>
    );
  };

  // @ts-ignore
  const CardItem = ({ id, children }) => {
    const ref = useRef(null);
    const [{ isDragging }, drag] = useDrag({
      item: { type: "card", id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const opacity = isDragging ? 0 : 1;
    drag(ref);
    return (
      <div ref={ref} style={{ opacity }}>
        {children}
      </div>
    );
  };

  const averagePoint = (): number => {
    if (selectedCardHistories.length === 0) {
      return 0;
    }

    let total = 0;
    selectedCardHistories.forEach((h) => {
      total += h.storyPoint;
    });
    return Math.round(total / selectedCardHistories.length);
  };

  return (
    <div>
      <Navbar />

      <div className="flex">
        <div className="w-3/4 bg-white">
          <section>
            <p className="bg-gray-800 text-white font-bold text-xl p-4">
              Selected Cards{" "}
            </p>

            <p className="bg-gray-600 text-white font-bold text-sm p-4">
              Average Point: {isHideAllCards ? "?" : averagePoint()}
            </p>

            <DndProvider backend={HTML5Backend}>
              <DropZone addSelectCardHistory={addSelectCardHistory}>
                {selectedCardHistories.map((h) => {
                  const isMyHistory = h.userId === user?.uid;
                  return (
                    <div
                      key={h.userId + h.storyPoint}
                      className="w-1/12 p-2 m-6"
                    >
                      <Card point={h.storyPoint} hide={h.hide} />
                      <p className="mt-4">
                        {h.userName} {isMyHistory ? `(${h.storyPoint})` : ""}
                      </p>
                    </div>
                  );
                })}
              </DropZone>
            </DndProvider>
          </section>

          <section>
            <div className="text-center py-4">
              <button
                className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-xl"
                onClick={() => toggleHideAllCards(!isHideAllCards)}
              >
                {isHideAllCards ? "Show" : "Hide"}
              </button>

              <button
                className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 ml-64 rounded text-xl border-black border-2"
                onClick={resetAllCards}
              >
                Reset
              </button>
            </div>
          </section>

          <section>
            <p className="bg-gray-800 text-white font-bold text-xl p-4">
              Your Hand{" "}
              <span className="text-white text-sm pl-4">
                {" "}
                (Please Drag & Drop your card to "Selected Cards" ↑)
              </span>
            </p>

            <DndProvider backend={HTML5Backend}>
              <DropZone addSelectCardHistory={() => undefined}>
                {selectableStoryPoints().map((storyPoint) => (
                  <div key={storyPoint} className="w-1/12 p-2 m-6">
                    <CardItem id={storyPoint}>
                      <Card point={storyPoint} hide={false} />
                    </CardItem>
                  </div>
                ))}
              </DropZone>
            </DndProvider>
          </section>
        </div>
        <div className="w-1/4 bg-gray-400">
          <RoomMembers joinRoomHistories={joinRoomHistories} roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default Room;
