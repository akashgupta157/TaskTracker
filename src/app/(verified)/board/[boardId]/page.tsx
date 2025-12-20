"use client";

import React, { useEffect } from "react";
import Header from "@/components/Header";
import { useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getAllParams } from "@/lib/utils";
import ListContainer from "@/components/ListContainer";
import { useBoardSubscriptions } from "@/lib/realtime";
import { setCurrentBoard } from "@/redux/slices/boardSlice";
import { usePathname, useSearchParams } from "next/navigation";
import {
  useGetBoardByIdQuery,
  useFilterBoardQuery,
} from "@/redux/api/boardApi";

export default function Board() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBoard = useSelector(
    (state: RootState) => state.board.currentBoard
  );

  const boardId = pathname.split("/").pop() as string;
  const filters = getAllParams(searchParams);
  const isFiltering = searchParams.size > 0;

  const filteredResult = useFilterBoardQuery({ boardId, filterData: filters });
  const unfilteredResult = useGetBoardByIdQuery(boardId);

  const {
    data: board,
    isLoading,
    isFetching,
  } = isFiltering ? filteredResult : unfilteredResult;

  const isFilterLoading = isFiltering && isFetching;

  useEffect(() => {
    if (board) {
      dispatch(setCurrentBoard(board));
    }
  }, [board, dispatch]);

  useBoardSubscriptions(boardId);

  return (
    <div
      className={`flex-1 flex flex-col font-sans ${currentBoard?.background}`}
    >
      <Header currentBoard={currentBoard} loading={isLoading} />

      <div className="flex-1 overflow-x-auto">
        <ListContainer
          currentBoard={currentBoard || board}
          loading={isLoading}
          isFilterLoading={isFilterLoading}
        />
      </div>
    </div>
  );
}
