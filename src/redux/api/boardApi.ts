import { Board } from "@/types";
import { baseApi } from "./baseApi";
import { CardFilters } from "@/types/CardFilter";

export const boardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => "/boards",
      providesTags: ["Board"],
    }),

    getBoardById: builder.query<Board, string>({
      query: (boardId) => `/boards/${boardId}`,
      providesTags: (_, __, id) => [{ type: "Board", id }],
    }),

    filterBoard: builder.query<
      Board,
      { boardId: string; filterData: CardFilters }
    >({
      query: ({ boardId, filterData }) => ({
        url: `/boards/${boardId}/filter`,
        params: filterData,
      }),
      providesTags: (_, __, args) => [{ type: "Board", id: args.boardId }],
    }),

    createBoard: builder.mutation<
      Board,
      { title: string; background: string }
    >({
      query: (body) => ({
        url: "/boards",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Board"],
    }),

    inviteBoardMember: builder.mutation<
      { message: string },
      { boardId: string; email: string }
    >({
      query: ({ boardId, email }) => ({
        url: `/boards/${boardId}/invite`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Board", id: arg.boardId },
      ],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useGetBoardByIdQuery,
  useFilterBoardQuery,
  useCreateBoardMutation,
  useInviteBoardMemberMutation
} = boardApi;
