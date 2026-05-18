"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react"

// ----- Types ----- //

export interface CartItem {
  id: string
  slug: string
  name: string
  image: string
  price: number
  currency: string
  category: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  /** False until localStorage has been read on the client. */
  hydrated: boolean
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; product: Omit<CartItem, "quantity">; quantity: number }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  hydrated: boolean
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  getQuantity: (id: string) => number
}

// ----- localStorage helpers ----- //

const CART_KEY = "li_ng_cart_v1"

function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

// ----- Reducer ----- //

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items, hydrated: true }

    case "ADD": {
      const existing = state.items.find((i) => i.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id
              ? { ...i, quantity: Math.min(10, i.quantity + action.quantity) }
              : i,
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.product, quantity: Math.min(10, action.quantity) },
        ],
      }
    }

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id
            ? { ...i, quantity: Math.max(1, Math.min(10, action.quantity)) }
            : i,
        ),
      }

    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }

    case "CLEAR":
      return { ...state, items: [] }

    default:
      return state
  }
}

// ----- Context ----- //

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], hydrated: false })

  // Hydrate from localStorage once on mount
  useEffect(() => {
    dispatch({ type: "HYDRATE", items: readCart() })
  }, [])

  // Persist whenever items change (skip the initial empty render)
  const prevHydrated = useRef(false)
  useEffect(() => {
    if (!state.hydrated) return
    if (!prevHydrated.current) {
      prevHydrated.current = true
      return // skip write on the hydration dispatch itself
    }
    writeCart(state.items)
  }, [state.items, state.hydrated])

  const addItem = useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1) =>
      dispatch({ type: "ADD", product, quantity }),
    [],
  )
  const updateQuantity = useCallback(
    (id: string, quantity: number) =>
      dispatch({ type: "UPDATE_QTY", id, quantity }),
    [],
  )
  const removeItem = useCallback(
    (id: string) => dispatch({ type: "REMOVE", id }),
    [],
  )
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), [])
  const isInCart = useCallback(
    (id: string) => state.items.some((i) => i.id === id),
    [state.items],
  )
  const getQuantity = useCallback(
    (id: string) => state.items.find((i) => i.id === id)?.quantity ?? 0,
    [state.items],
  )

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        subtotal,
        hydrated: state.hydrated,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within <CartProvider>")
  return ctx
}
