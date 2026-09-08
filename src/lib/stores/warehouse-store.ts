import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Which building the warehouse screens are currently about.
 *
 * Persisted rather than kept in the URL, unlike the `date` and `slot_id`
 * params those screens already use. Those two change with every question the
 * operator asks; the warehouse is "which building am I standing in", which
 * should survive a refresh and follow them from the Wall to Loading to Return
 * without being re-picked each time.
 *
 * The server has the final say either way. A `responsible` clerk is pinned to
 * one warehouse by `wh_warehouse_staff`, so `GET /warehouse/warehouses`
 * returns them exactly one row and this store just records it; naming another
 * building is refused server-side, not merely hidden here. For admin and
 * supervisor, who run every site, this is the real selection.
 */
interface WarehouseStore {
  selectedWarehouseId: number | null;
  setSelectedWarehouseId: (id: number | null) => void;
}

export const useWarehouseStore = create<WarehouseStore>()(
  devtools(
    persist(
      (set) => ({
        selectedWarehouseId: null,
        setSelectedWarehouseId: (selectedWarehouseId) => {
          set({ selectedWarehouseId });
        },
      }),
      {
        name: "warehouse-store",
        partialize: (state) => ({
          selectedWarehouseId: state.selectedWarehouseId,
        }),
      },
    ),
    { name: "warehouse-store" },
  ),
);

export const useSelectedWarehouseId = () =>
  useWarehouseStore((state) => state.selectedWarehouseId);
export const useSetSelectedWarehouseId = () =>
  useWarehouseStore((state) => state.setSelectedWarehouseId);
