"use client";

import React, { useEffect } from "react";
import Header from "@/components/Header";
import { getAllParams } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import ListContainer from "@/components/ListContainer";
import { useBoardSubscriptions } from "@/lib/realtime";
import { usePathname, useSearchParams } from "next/navigation";
import {
  filterBoard,
  getBoardDetails,
  setBoardLoading,
} from "@/redux/slices/boardSlice";

export default function Board() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard, loading } = useSelector(
    (state: RootState) => state.board
  );
  const searchParams = useSearchParams();

  const pathName = usePathname();
  const id = pathName.split("/").pop();

  useBoardSubscriptions(id as string);

  useEffect(() => {
    if (!id) return;
    if (!currentBoard || currentBoard.id !== id) {
      if (searchParams.size > 0) {
        dispatch(setBoardLoading(true));
        dispatch(
          filterBoard({ boardId: id, filterData: getAllParams(searchParams) })
        );
      } else {
        dispatch(getBoardDetails(id));
      }
    }
  }, [id, currentBoard, dispatch, searchParams]);

  return (
    <div
      className={`flex-1 flex flex-col font-sans ${currentBoard?.background}`}
    >
      <Header currentBoard={currentBoard} loading={loading} />

      <div className="flex-1 overflow-x-auto">
        <ListContainer currentBoard={currentBoard} loading={loading} />
      </div>
    </div>
  );
}
