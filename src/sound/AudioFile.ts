export default class AudioFile {

	static LOADING = 0
	static LOADED  = 1
	static FAILED  = 2

	readonly path: string
	private readonly audio: HTMLAudioElement
	private readonly nodes: Set<HTMLAudioElement> // list of currently playing audio instances
	#state: number

	constructor(path: string) {
		this.path = path
		const audio = new Audio(`./assets/tiny/sounds/${path}`)
		audio.addEventListener("canplaythrough", () => {
			this.#state = AudioFile.LOADED
		})
		audio.addEventListener("error", e => {
			this.#state = AudioFile.FAILED
			console.error(`Audio "${path}" failed to load:`, e)
		})

		this.audio = audio
		this.nodes = new Set()
		this.#state = AudioFile.LOADING
	}

	get state() {
		return this.#state
	}

	ready() {
		return this.#state == AudioFile.LOADED
	}

	play() {
		if (!this.ready()) return
		const node = (this.audio.cloneNode(true) as HTMLAudioElement)
		node.play()
		this.nodes.add(node)
		node.addEventListener("ended", () => this.nodes.delete(node))
		node.addEventListener("error", () => this.nodes.delete(node))
		node.addEventListener("pause", () => this.nodes.delete(node))
	}

}