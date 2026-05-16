import Image from "next/image";
import { Board } from "@/types";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { LuFilter } from "react-icons/lu";
import { getAllParams } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CardFilters } from "@/types/CardFilter";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CardFilters>({});

  useEffect(() => {
    setFilters(getAllParams(searchParams));
  }, [searchParams, currentBoard?.id]);

  const handleFilterChange = (
    key: keyof CardFilters,
    value: CardFilters[keyof CardFilters]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriorityChange = (
    priority: "LOW" | "MEDIUM" | "HIGH",
    checked: boolean
  ) => {
    setFilters((prev) => {
      const current = prev.priority || [];
      return {
        ...prev,
        priority: checked
          ? [...current, priority]
          : current.filter((p) => p !== priority),
      };
    });
  };

  const handleAssigneeChange = (userId: string, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.assigneeId || [];
      return {
        ...prev,
        assigneeId: checked
          ? [...current, userId]
          : current.filter((id) => id !== userId),
      };
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.isCompleted !== undefined) {
      params.append("isCompleted", String(filters.isCompleted));
    }

    filters.priority?.forEach((p) => params.append("priority", p));
    filters.assigneeId?.forEach((id) => params.append("assigneeId", id));

    if (filters.dueDate) params.append("dueDate", filters.dueDate);
    if (filters.search) params.append("search", filters.search);

    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });

    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({});
    router.replace(window.location.pathname, { scroll: false });
    setFilterOpen(false);
  };

  return (
    <div>
      <h3 className="mb-4 font-semibold text-lg">Filter Cards</h3>

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
            onValueChange={(v) =>
              handleFilterChange("isCompleted", v === "true")
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
          {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2">
              <Checkbox
                checked={filters.priority?.includes(p) || false}
                onCheckedChange={(c) => handlePriorityChange(p, c as boolean)}
              />
              <Label className="capitalize">{p.toLowerCase()}</Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Select
            value={filters.dueDate || ""}
            onValueChange={(v) => handleFilterChange("dueDate", v)}
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

        {currentBoard &&
          currentBoard.members &&
          currentBoard.members.length > 0 && (
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {currentBoard.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.assigneeId?.includes(m.user.id) || false}
                      onCheckedChange={(c) =>
                        handleAssigneeChange(m.user.id, c as boolean)
                      }
                    />
                    <Label className="flex items-center gap-2">
                      <Image
                        src={m.user.image || ""}
                        alt={m.user.name || ""}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      {m.user.name || m.user.email}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={resetFilters} className="flex-1">
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
