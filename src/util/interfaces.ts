import type Inventory from "../Inventory"
import type ResourceLocation from "./ResourceLocation"

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export type Flatten<T> = T extends Array<unknown> ? (Flatten<ArrayElement<T>>)[] : {
	[K in keyof T]: T[K]
}

export interface HasInventory {
	inventory: Inventory
}

export type BaseData = {
	id: NamespacedId
}

export interface HasData {
	getData: (...args: never[]) => object
}

export type DataOf<T extends HasData> = ReturnType<T["getData"]>

export type RawNamespacedId = `${string}:${string}`
export type NamespacedId = RawNamespacedId | ResourceLocation

export type SoundDef = {
	sounds: Array<string | {
		name: string
	}>
}
