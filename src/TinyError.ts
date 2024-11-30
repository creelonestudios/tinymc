export default class TinyError extends Error {

	constructor(readonly plainMessage: string, cause?: Error | string) {
		super(undefined, { cause })
	}

	get message(): string {
		return this.toString()
	}

	toString() {
		// const causeMsg = this.cause instanceof Error ? this.cause?.message : this.cause

		return this.plainMessage // `${this.cause ? `${this.plainMessage}\nCause: ${causeMsg}` : this.plainMessage}`
	}

}
