"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ClientType = "startup" | "existing"

export type VendorClientData = {
  // Client identity
  clientBusinessName: string
  clientContactName: string
  clientEmail: string
  industry: string
  subSector: string
  country: string
  currency: string

  // Business profile
  businessStage: string
  employeeCount: string
  businessDescription: string

  // Engagement details
  modelPurpose: string
  engagementReference: string
  clientType: ClientType | null
}

interface VendorStore {
  clientData: Partial<VendorClientData>
  currentClientType: ClientType | null
  intakeComplete: boolean
  updateClientData: (data: Partial<VendorClientData>) => void
  setClientType: (type: ClientType) => void
  setIntakeComplete: (val: boolean) => void
  resetClient: () => void
}

const initialClientData: Partial<VendorClientData> = {}

export const useVendorStore = create<VendorStore>()(
  persist(
    (set) => ({
      clientData: initialClientData,
      currentClientType: null,
      intakeComplete: false,

      updateClientData: (data) =>
        set((s) => ({ clientData: { ...s.clientData, ...data } })),

      setClientType: (type) =>
        set({ currentClientType: type }),

      setIntakeComplete: (val) =>
        set({ intakeComplete: val }),

      resetClient: () =>
        set({
          clientData: initialClientData,
          currentClientType: null,
          intakeComplete: false,
        }),
    }),
    { name: "finmodels-vendor-client" }
  )
)
