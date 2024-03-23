import Inventory from "../Inventory"

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

export type NamespacedId = `${string}:${string}`

export type SoundDef = {
	sounds: Array<string | {
		name: string
	}>
}
