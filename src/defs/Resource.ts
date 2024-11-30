import { NamespacedId } from "../util/interfaces.js"
import ResourceLocation from "../util/ResourceLocation.js"

export default class Resource {

	readonly id: ResourceLocation

	constructor(id: NamespacedId) {
		this.id = new ResourceLocation(id)
	}

}
