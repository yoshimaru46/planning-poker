import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  doc,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";

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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Refs to hold latest values for use in the cleanup function (avoids stale closures)
  const roomIdRef = useRef(roomId);
  const userRef = useRef(user);
  roomIdRef.current = roomId;
  userRef.current = user;

  const isHideAllCards = selectedCardHistories.every((h) => h.hide);

  // When hidden, sort by userId (stable, non-revealing order) to prevent
  // inferring card values from position. When revealed, show in story_point
  // order (already sorted by Firestore query).
  const displayedHistories = useMemo(
    () =>
      isHideAllCards
        ? [...selectedCardHistories].sort((a, b) =>
            a.userId.localeCompare(b.userId)
          )
        : selectedCardHistories,
    [selectedCardHistories, isHideAllCards]
  );

  const photoUrlByUserId = useMemo(
    () =>
      Object.fromEntries(
        joinRoomHistories.map((h) => [h.userId, h.photoURL])
      ),
    [joinRoomHistories]
  );

  const mySelectedPoint = selectedCardHistories.find(
    (h) => h.userId === user?.uid
  )?.storyPoint;

  useEffect(() => {
    if (!roomId || !user) return;

    // Register the current user in the room.
    // Use a deterministic document ID to prevent duplicates from race conditions.
    const joinDocId = `${roomId}_${user.uid}`;
    setDoc(doc(db, "join_room_histories", joinDocId), {
      room_id: roomId,
      user_id: user.uid,
      user_name: user.displayName,
      photo_url: user.photoURL,
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

      // Remove current user from room on unmount.
      // Use the same deterministic document ID used when joining.
      const currentRoomId = roomIdRef.current;
      const currentUser = userRef.current;
      if (!currentRoomId || !currentUser) return;

      const joinDocId = `${currentRoomId}_${currentUser.uid}`;
      deleteDoc(doc(db, "join_room_histories", joinDocId));
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

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy URL:", e);
    }
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm(false);
    await resetAllCards();
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
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
            <div className="bg-gray-800 text-white font-bold text-xl p-4 flex items-center justify-between">
              <span>Selected Cards</span>
              <button
                className={`text-sm font-normal px-3 py-1 rounded border transition-colors ${
                  urlCopied
                    ? "bg-green-600 border-green-500 text-white"
                    : "bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-200"
                }`}
                onClick={copyRoomUrl}
              >
                {urlCopied ? "✓ Copied!" : "🔗 Share URL"}
              </button>
            </div>

            <p className="bg-gray-600 text-white font-bold text-sm p-4">
              Average Point: {isHideAllCards ? "?" : averagePoint()}
            </p>

            <div className="flex content-around flex-wrap bg-gray-200" style={{ height: "30vh" }}>
              {displayedHistories.map((h) => {
                const isMyHistory = h.userId === user?.uid;
                return (
                  <div
                    key={h.userId + h.storyPoint}
                    className="w-1/12 p-2 m-2"
                  >
                    <div
                      className={
                        isMyHistory
                          ? "inline-block ring-2 ring-blue-500 ring-offset-2 rounded-lg"
                          : "inline-block"
                      }
                    >
                      <div className="relative">
                        <Card point={h.storyPoint} hide={isMyHistory ? false : h.hide} />
                        {photoUrlByUserId[h.userId] && (
                          <img
                            className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-md"
                            src={photoUrlByUserId[h.userId]}
                            alt={h.userName}
                          />
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs break-words">
                      {isMyHistory ? (
                        <span className="font-bold text-blue-600">
                          {h.userName}
                        </span>
                      ) : (
                        h.userName
                      )}
                    </p>
                  </div>
                );
              })}
            </div>

            <section>
              <div className="flex items-center justify-between py-4 px-6">
                <button
                  className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-6 rounded text-xl"
                  onClick={() => toggleHideAllCards(!isHideAllCards)}
                >
                  {isHideAllCards ? "Show" : "Hide"}
                </button>

                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Reset?</span>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                      onClick={handleResetConfirm}
                    >
                      Reset
                    </button>
                    <button
                      className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded text-sm border-gray-400 border-2"
                      onClick={handleResetCancel}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded text-xl border-black border-2"
                    onClick={handleResetClick}
                  >
                    Reset
                  </button>
                )}
              </div>
            </section>

            <section>
              <p className="bg-gray-800 text-white font-bold text-xl p-4">
                Your Hand
              </p>

              <div className="flex content-around flex-wrap bg-gray-200" style={{ height: "30vh" }}>
                {STORY_POINTS.map((storyPoint) => {
                  const isSelected = storyPoint === mySelectedPoint;
                  return (
                    <div
                      key={storyPoint}
                      className={`w-1/12 p-2 m-2 ${isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={isSelected ? undefined : () => addSelectCardHistory({ id: storyPoint })}
                    >
                      <Card point={storyPoint} hide={false} />
                    </div>
                  );
                })}
              </div>
            </section>
          </section>
        </div>

        <div className="w-1/4 bg-gray-400">
          <RoomMembers
            joinRoomHistories={joinRoomHistories}
            votedUserIds={selectedCardHistories.map((h) => h.userId)}
          />
        </div>
      </div>
    </div>
  );
};

export default Room;
