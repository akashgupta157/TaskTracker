import Image from "next/image";
import { Board } from "@/types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { LuFilter } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { getAllParams } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AppDispatch } from "@/redux/store";
import { CardFilters } from "@/types/CardFilter";
import { filterBoard } from "@/redux/slices/boardSlice";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Filter({
  currentBoard,
  setFilterOpen,
}: {
  currentBoard: Board | null;
  setFilterOpen: (isOpen: boolean) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CardFilters>({});

  useEffect(() => {
    setFilters(getAllParams(searchParams));
  }, [searchParams, currentBoard?.id, dispatch]);

  const handleFilterChange = (
    key: keyof CardFilters,
    value: CardFilters[keyof CardFilters]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriorityChange = (
    priority: "LOW" | "MEDIUM" | "HIGH",
    checked: boolean
  ) => {
    setFilters((prev) => {
      const currentPriorities = prev.priority || [];
      if (checked) {
        return {
          ...prev,
          priority: [...currentPriorities, priority],
        };
      } else {
        return {
          ...prev,
          priority: currentPriorities.filter((p) => p !== priority),
        };
      }
    });
  };

  const handleAssigneeChange = (userId: string, checked: boolean) => {
    setFilters((prev) => {
      const currentAssignees = prev.assigneeId || [];
      if (checked) {
        return {
          ...prev,
          assigneeId: [...currentAssignees, userId],
        };
      } else {
        return {
          ...prev,
          assigneeId: currentAssignees.filter((id) => id !== userId),
        };
      }
    });
  };

  const applyFilters = () => {
    if (!currentBoard?.id) return;

    const param = new URLSearchParams();

    if (filters.isCompleted !== undefined) {
      param.append("isCompleted", filters.isCompleted.toString());
    }

    if (filters.priority && filters.priority.length > 0) {
      filters.priority.forEach((priority: string) => {
        param.append("priority", priority);
      });
    }

    if (filters.assigneeId && filters.assigneeId.length > 0) {
      filters.assigneeId.forEach((assigneeId: string) => {
        param.append("assigneeId", assigneeId);
      });
    }

    if (filters.dueDate) {
      param.append("dueDate", filters.dueDate);
    }

    if (filters.search) {
      param.append("search", filters.search);
    }

    const newUrl = `${window.location.pathname}?${param.toString()}`;
    router.replace(newUrl, { scroll: false });

    dispatch(
      filterBoard({
        boardId: currentBoard.id,
        filterData: filters,
      })
    );
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({});

    router.replace(window.location.pathname, { scroll: false });

    if (!currentBoard?.id) return;
    dispatch(
      filterBoard({
        boardId: currentBoard.id,
        filterData: {},
      })
    );
    setFilterOpen(false);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Filter Cards</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search in title or description..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.isCompleted?.toString() || ""}
            onValueChange={(value) =>
              handleFilterChange("isCompleted", value === "true")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Pending</SelectItem>
              <SelectItem value="true">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="space-y-2">
            {(["LOW", "MEDIUM", "HIGH"] as const).map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={filters.priority?.includes(priority) || false}
                  onCheckedChange={(checked) =>
                    handlePriorityChange(priority, checked as boolean)
                  }
                />
                <Label htmlFor={`priority-${priority}`} className="capitalize">
                  {priority.toLowerCase()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Select
            value={filters.dueDate || ""}
            onValueChange={(value) => handleFilterChange("dueDate", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select due date filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentBoard?.members && currentBoard.members.length > 0 && (
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {currentBoard.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assignee-${member.user.id}`}
                    checked={
                      filters.assigneeId?.includes(member.user.id) || false
                    }
                    onCheckedChange={(checked) =>
                      handleAssigneeChange(member.user.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`assignee-${member.user.id}`}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={member.user.image || ""}
                      alt={member.user.name || ""}
                      width={25}
                      height={25}
                      className="rounded-full w-6 h-6"
                    />
                    <span>{member.user.name || member.user.email}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="flex-1 gap-2"
        >
          Reset
        </Button>
        <Button onClick={applyFilters} className="flex-1 gap-2">
          <LuFilter className="w-4 h-4" />
          Apply
        </Button>
      </div>
    </div>
  );
}
