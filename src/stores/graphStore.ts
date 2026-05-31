import { create } from "zustand";
import { GRAPH_NODES } from "../data/graphData";

// ---------------------------------------------------------------------------
// KNOWLEDGE GRAPH — global selection + ambient auto-traversal.
// Selection persists across tab switches. When the user isn't actively
// hovering, an ambient "query" periodically traverses the graph (the agents
// querying the ontology), so the graph feels live rather than frozen.
// ---------------------------------------------------------------------------

interface GraphStore {
  selected: string | null;
  /** node the ambient auto-query is currently visiting (null = none) */
  autoQuery: string | null;
  /** true while the user is hovering — pauses ambient traversal */
  userActive: boolean;
  started: boolean;
  setSelected: (id: string | null) => void;
  setUserActive: (active: boolean) => void;
  start: () => void;
  _timer?: number;
}

// Nodes the ambient query rotates through (skip the central brand node).
const QUERY_NODES = GRAPH_NODES.filter((n) => n.type !== "brand").map((n) => n.id);

export const useGraph = create<GraphStore>((set, get) => ({
  selected: "brand",
  autoQuery: null,
  userActive: false,
  started: false,
  _timer: undefined,

  setSelected: (id) => set({ selected: id }),
  setUserActive: (active) => set({ userActive: active }),

  start: () => {
    if (get().started) return;
    let i = 0;
    const id = window.setInterval(() => {
      // pause ambient traversal while the user is interacting
      if (get().userActive) {
        set({ autoQuery: null });
        return;
      }
      i = (i + 1) % QUERY_NODES.length;
      set({ autoQuery: QUERY_NODES[i] });
    }, 2600);
    set({ started: true, _timer: id });
  },
}));
