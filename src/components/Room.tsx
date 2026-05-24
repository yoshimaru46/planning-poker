import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { db, analytics } from "../Firebase";
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

interface SelectedCardHistory {
  roomId: string;
  userId: string;
  userName: string;
  storyPoint: number;
  createdAt: Timestamp;
  hide: boolean;
}

const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21];
const CARD_TYPE = "card";

// --- DropZone component (extracted to avoid re-creation on each render) ---

interface DropZoneProps {
  onDrop: (item: { id: number }) => void;
  children: ReactNode;
}

const DropZone = ({ onDrop, children }: DropZoneProps) => {
  const [, drop] = useDrop<{ id: number }, void, unknown>(
    () => ({
      accept: CARD_TYPE,
      drop(item) {
        onDrop(item);
      },
    }),
    [onDrop]
  );

  return (
    <div
      ref={drop}
      className="flex content-around flex-wrap bg-gray-200"
      style={{ height: "30vh" }}
    >
      {children}
    </div>
  );
};

// --- CardItem component (extracted to avoid re-creation on each render) ---

interface CardItemProps {
  id: number;
  children: ReactNode;
}

const CardItem = ({ id, children }: CardItemProps) => {
  const [{ isDragging }, drag] = useDrag<
    { id: number },
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: CARD_TYPE,
      item: { id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id]
  );

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0 : 1 }}>
      {children}
    </div>
  );
};

// --- Room component ---

const Room = () => {
  const user = useContext(UserContext);
  const { id: roomId } = useParams<{ id: string }>();

  const [joinRoomHistories, setJoinRoomHistories] = useState<JoinRoomHistory[]>(
    []
  );
  const [selectedCardHistories, setSelectedCardHistories] = useState<
    SelectedCardHistory[]
  >([]);

  // Refs to hold latest values for use in the cleanup function (avoids stale closures)
  const roomIdRef = useRef(roomId);
  const userRef = useRef(user);
  roomIdRef.current = roomId;
  userRef.current = user;

  const isHideAllCards = selectedCardHistories.every((h) => h.hide);

  const selectableStoryPoints = STORY_POINTS.filter(
    (p) =>
      p !==
      selectedCardHistories.find((h) => h.userId === user?.uid)?.storyPoint
  );

  useEffect(() => {
    if (!roomId || !user) return;

    // Register the current user in the room
    const joinQuery = query(
      collection(db, "join_room_histories"),
      where("room_id", "==", roomId),
      where("user_id", "==", user.uid)
    );
    getDocs(joinQuery).then((snapshot) => {
      if (snapshot.size === 0) {
        addDoc(collection(db, "join_room_histories"), {
          room_id: roomId,
          user_id: user.uid,
          user_name: user.displayName,
          photo_url: user.photoURL,
        });
      }
    });

    // Subscribe to room members
    const membersQuery = query(
      collection(db, "join_room_histories"),
      where("room_id", "==", roomId)
    );
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      const histories: JoinRoomHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        histories.push({
          roomId: data.room_id as string,
          userId: data.user_id as string,
          userName: data.user_name as string,
          photoURL: data.photo_url as string,
        });
      });
      setJoinRoomHistories(histories);
    });

    // Subscribe to selected cards
    const cardsQuery = query(
      collection(db, "select_card_histories"),
      where("room_id", "==", roomId),
      orderBy("story_point")
    );
    const unsubscribeCards = onSnapshot(cardsQuery, (snapshot) => {
      const histories: SelectedCardHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        histories.push({
          roomId: data.room_id as string,
          userId: data.user_id as string,
          userName: data.user_name as string,
          storyPoint: data.story_point as number,
          createdAt: data.created_at as Timestamp,
          hide: data.hide as boolean,
        });
      });
      setSelectedCardHistories(histories);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeCards();

      // Remove current user from room on unmount
      const currentRoomId = roomIdRef.current;
      const currentUser = userRef.current;
      if (!currentRoomId || !currentUser) return;

      getDocs(
        query(
          collection(db, "join_room_histories"),
          where("room_id", "==", currentRoomId),
          where("user_id", "==", currentUser.uid)
        )
      ).then((snapshot) => {
        snapshot.docs.forEach((doc) => deleteDoc(doc.ref));
      });
    };
  }, [roomId, user]);

  const addSelectCardHistory = useCallback(
    async ({ id }: { id: number }) => {
      if (!user || !roomId) return;
      try {
        const prev = await getDocs(
          query(
            collection(db, "select_card_histories"),
            where("room_id", "==", roomId),
            where("user_id", "==", user.uid)
          )
        );
        await Promise.all(prev.docs.map((doc) => deleteDoc(doc.ref)));

        await addDoc(collection(db, "select_card_histories"), {
          room_id: roomId,
          user_id: user.uid,
          user_name: user.displayName,
          story_point: id,
          created_at: new Date(),
          hide: isHideAllCards,
        });

        if (analytics) logEvent(analytics, "card_selected");
      } catch (e) {
        console.error("Failed to select card:", e);
      }
    },
    [user, roomId, isHideAllCards]
  );

  const toggleHideAllCards = async (hide: boolean) => {
    if (!roomId) return;
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "select_card_histories"),
          where("room_id", "==", roomId)
        )
      );
      await Promise.all(
        snapshot.docs.map((doc) => updateDoc(doc.ref, { hide }))
      );
    } catch (e) {
      console.error("Failed to toggle cards:", e);
    }
  };

  const resetAllCards = async () => {
    if (!roomId) return;
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "select_card_histories"),
          where("room_id", "==", roomId)
        )
      );
      await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (e) {
      console.error("Failed to reset cards:", e);
    }
  };

  const averagePoint = (): number => {
    if (selectedCardHistories.length === 0) return 0;
    const total = selectedCardHistories.reduce(
      (sum, h) => sum + h.storyPoint,
      0
    );
    return Math.round((total / selectedCardHistories.length) * 10) / 10;
  };

  return (
    <div>
      <Navbar />

      <div className="flex" style={{ height: "calc(100vh - 6rem)" }}>
        <div className="w-3/4 bg-white">
          <section>
            <p className="bg-gray-800 text-white font-bold text-xl p-4">
              Selected Cards
            </p>

            <p className="bg-gray-600 text-white font-bold text-sm p-4">
              Average Point: {isHideAllCards ? "?" : averagePoint()}
            </p>

            <DndProvider backend={HTML5Backend}>
              <DropZone onDrop={addSelectCardHistory}>
                {selectedCardHistories.map((h) => {
                  const isMyHistory = h.userId === user?.uid;
                  return (
                    <div
                      key={h.userId + h.storyPoint}
                      className="w-1/12 p-2 m-2"
                    >
                      <Card point={h.storyPoint} hide={h.hide} />
                      <p className="mt-4">
                        {h.userName} {isMyHistory ? `(${h.storyPoint})` : ""}
                      </p>
                    </div>
                  );
                })}
              </DropZone>

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
                    (Please Drag &amp; Drop your card to &quot;Selected
                    Cards&quot; ↑)
                  </span>
                </p>

                <DropZone onDrop={() => undefined}>
                  {selectableStoryPoints.map((storyPoint) => (
                    <div key={storyPoint} className="w-1/12 p-2 m-2">
                      <CardItem id={storyPoint}>
                        <Card point={storyPoint} hide={false} />
                      </CardItem>
                    </div>
                  ))}
                </DropZone>
              </section>
            </DndProvider>
          </section>
        </div>

        <div className="w-1/4 bg-gray-400">
          <RoomMembers joinRoomHistories={joinRoomHistories} />
        </div>
      </div>
    </div>
  );
};

export default Room;
