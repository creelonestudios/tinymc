import { getAudioFile, soundList } from "../main.js"
import AudioFile from "./AudioFile.js"

export default class Sound {

	readonly key: string
	private readonly audios: AudioFile[]

	constructor(key: string) {
		this.key = key
		this.audios = []
	
		let def = soundList[key]
		if (!def) {
			console.warn(`Sound definition ${key} missing!`)
			def = {}
		}

		let sounds: any[] = def.sounds || []
		if (!(sounds instanceof Array) || sounds.length == 0) {
			console.warn(`Sounds array for ${key} empty or invalid:`, sounds)
			sounds = []
		}

		for (let i = 0; i < sounds.length; i++) {
			const sound = sounds[i]
			const name = typeof sound == "string" ? sound : sound.name
			this.audios.push(getAudioFile(name + ".ogg"))
		}
	}

	play() {
		if (this.audios.length == 0) return
		const r = Math.floor(Math.random() * this.audios.length)
		this.audios[r].play()
	}

}