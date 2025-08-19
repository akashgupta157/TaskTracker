"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import ListContainer from "@/components/ListContainer";
import { getBoardDetails } from "@/redux/slices/boardSlice";
export default function Board() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard, loading } = useSelector(
    (state: RootState) => state.board
  );
  const pathName = usePathname();
  const id = pathName.split("/").pop();

  useEffect(() => {
    if (!id) return;
    if (!currentBoard || currentBoard.id !== id) {
      dispatch(getBoardDetails(id));
    }
  }, [id, currentBoard, dispatch]);

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
