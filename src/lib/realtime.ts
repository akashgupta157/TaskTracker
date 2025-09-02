import { supabase } from "./utils";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

export const useBoardSubscriptions = (boardId: string) => {
  const dispatch = useDispatch();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!boardId) return;

    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const channel = supabase.channel(`board-${boardId}`);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "lists",
        filter: `boardId=eq.${boardId}`,
      },
      (payload) => {
        switch (payload.eventType) {
          case "INSERT":
            // dispatch(rtAddList(payload.new as any));
            break;
          case "UPDATE":
            // const updatedList = payload.new as any;
            // dispatch(
            //   rtUpdateList({
            //     listId: updatedList.id,
            //     updates: updatedList,
            //   })
            // );
            break;
          case "DELETE":
            // dispatch(rtDeleteList(payload.old.id));
            break;
        }
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "cards",
        filter: `boardId=eq.${boardId}`,
      },
      (payload) => {
        switch (payload.eventType) {
          case "INSERT":
            // dispatch(rtAddCard(payload.new as any));
            break;
          case "UPDATE":
            // const updatedCard = payload.new as any;
            // dispatch(
            //   rtUpdateCard({
            //     cardId: updatedCard.id,
            //     updates: updatedCard,
            //   })
            // );
            break;
          case "DELETE":
            // dispatch(rtDeleteCard(payload.old.id));
            break;
        }
      }
    );

    channel.subscribe((status) => {
      if (status !== "SUBSCRIBED") return;
      console.log("Subscribed to board");
    });
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [boardId, dispatch]);
};
