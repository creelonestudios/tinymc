import { NamespacedId, RawNamespacedId } from "./util/interfaces.js"
import Attribute from "./defs/Attribute.js"
import BlockDef from "./defs/BlockDef.js"
import EntityDef from "./defs/EntityDef.js"
import ItemDef from "./defs/ItemDef.js"
import PlayerDef from "./defs/PlayerDef.js"
import Resource from "./defs/Resource.js"
import ResourceLocation from "./util/ResourceLocation.js"
import YSON from "https://j0code.github.io/yson/YSON.js"
import YSONSyntaxError from "https://j0code.github.io/yson/YSONSyntaxError.js"

export class Registry<T extends Resource = Resource> extends Resource {

	private entries: Map<RawNamespacedId, T>

	constructor(id: NamespacedId) {
		super(id)
		this.entries = new Map()
	}

	register(entry: T) {
		if (entry.id.matches(this.id)) {
			throw new Error("Entry may not have the same ID as registry")
		}

		if (this.entries.has(entry.id.toString())) {
			throw new Error("Duplicate entry")
		}

		this.entries.set(entry.id.toString(), entry)
	}

	get(id: NamespacedId): T | undefined {
		if (id instanceof ResourceLocation) id = id.toString()

		return this.entries.get(id)
	}

	query(...ids: NamespacedId[]): Resource | undefined {
		const id = ids[0] instanceof ResourceLocation ? ids[0].toString() : ids[0]

		const entry = this.entries.get(id)

		if (ids.length == 0) return entry

		if (!(entry instanceof Registry)) {
			throw new Error(`No such registry: ${entry?.id}`)
		}

		return entry.query(...ids.slice(1))
	}

	exists(id: NamespacedId, ...ids: NamespacedId[]): boolean {
		if (id instanceof ResourceLocation) id = id.toString()
		if (ids.length == 0) return this.entries.has(id)

		const entry = this.entries.get(id)

		if (!(entry instanceof Registry)) {
			return false
		}

		return entry.exists(ids[0], ...ids.slice(1))
	}

	values() {
		return this.entries.values()
	}

	toString() {
		return `[Registry(${this.entries.size}) ${this.id}]`
	}

}

export async function createRegistries() {
	const rootRegistry = new Registry<Registry>("tiny:root")

	const attributes = await loadDefs("tiny:attribute", Attribute)
	const blocks     = await loadDefs("tiny:block",     BlockDef)
	const entities   = await loadDefs("tiny:entity",    EntityDef)
	const items      = await loadDefs("tiny:item",      ItemDef)

	// hardcoded entries
	blocks.register(new BlockDef("tiny:air", {}))
	entities.register(new EntityDef("tiny:item", { hasFriction: true }, attributes))
	entities.register(new PlayerDef(attributes))

	rootRegistry.register(attributes)
	rootRegistry.register(blocks)
	rootRegistry.register(entities)
	rootRegistry.register(items)

	/* console.log(`${rootRegistry}`, rootRegistry)
	console.log(`${attributes}`, attributes)
	console.log(`${blocks}`, blocks)
	console.log(`${entities}`, entities)
	console.log(`${items}`, items) */

	return rootRegistry
}

type ResourceConstructor<T> = { new(id: NamespacedId, data: unknown, ...other: never[]): T }
type DirSummary = { directories: string[], files: string[], recursiveFiles: string[] }

async function loadDefs<T extends Resource>(regId: NamespacedId, cls: ResourceConstructor<T>): Promise<Registry<T>> {
	if (typeof regId == "string") regId = new ResourceLocation(regId)

	const registry = new Registry<T>(regId)

	let dir

	try {
		dir = await fetchDirSummary(`./data`)
	} catch (ignore) {
		return registry
	}

	const promises: Promise<void>[] = []

	for (const namespace of dir.directories) {
		promises.push(loadDefsInNamespace(registry, namespace, `./data/${namespace}/${regId.path}`, cls))
	}

	await Promise.all(promises)

	return registry
}

async function loadDefsInNamespace<T extends Resource>(registry: Registry<T>, namespace: string, path: string, cls: ResourceConstructor<T>): Promise<void> {
	let dir

	try {
		dir = await fetchDirSummary(path)
	} catch (ignore) {
		return
	}

	if (!dir) return

	const promises: Promise<void>[] = []

	for (const file of dir.recursiveFiles) {
		const idpath = file.substring(0, file.lastIndexOf("."))
		const promise = YSON.load(`${path}/${file}`)
			.then(data => {
				registry.register(new cls(`${namespace}:${idpath}`, data))
			})
			.catch(e => {
				if (e instanceof YSONSyntaxError) {
					console.warn(`Malformed def ${registry.id}#${namespace}:${idpath}:`, e.message)
				} else {
					console.warn(`Error loading def ${registry.id}#${namespace}:${idpath}:`, e)
				}
			})

		promises.push(promise)
	}

	await Promise.all(promises)
}

async function fetchDirSummary(path: string): Promise<DirSummary> {
	return await YSON.load(`${path}/_dir.yson`) as DirSummary
}
