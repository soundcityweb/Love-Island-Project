export interface Contestant {
  id: string
  name: string
  age: number
  location: string
  image: string
}

export type VotingStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  /** Session already cast a vote in this event (409). */
  | "duplicate"
