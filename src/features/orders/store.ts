import { create } from 'zustand';

import type { OrderItemDraft } from './components/OrderItemsEditor.component';

export interface OrderDraftCustomer {
  name: string;
  phone: string;
  email: string;
}

export interface OrderDraftAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderDraft {
  items: OrderItemDraft[];
  customer?: OrderDraftCustomer;
  address?: OrderDraftAddress;
}

interface OrderDraftState {
  draft: OrderDraft | null;
  setDraft: (draft: OrderDraft) => void;
  takeDraft: () => OrderDraft | null;
}

// Plain module-level store (not just a hook), same pattern as
// features/auth/store.ts — read once outside a render, via getState(), by
// OrderNewPage, then cleared so a stale draft never resurfaces. Carries
// items alone (from "create order from template") or items + customer +
// address (from "duplicate order") — both pre-fill OrderForm the same way.
export const useOrderDraftStore = create<OrderDraftState>((set, get) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  takeDraft: () => {
    const { draft } = get();
    set({ draft: null });
    return draft;
  },
}));
