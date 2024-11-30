import fs from "fs/promises"
import YSON from "@j0code/yson"

/*
 * NOTE: This script is supposed to be executed server-side to generate directory summaries the game can fetch.
 * It should not be referenced in any front-end code. Summaries must NOT be commited.
 * This is needed for GitHub Pages. For actual backends, use middleware to provide them.
 */

async function generateSummaries(path) {
	const entries = await fs.readdir(path, { withFileTypes: true }).catch(e => {
		console.error("Could not generate summaries:", e)
	})

	if (!entries) return

	const summary = { directories: [], files: [], recursiveFiles: [] }
	const promises = []

	for (const entry of entries) {
		if (entry.isFile() && entry.name != "_dir.yson") {
			summary.files.push(entry.name)
			summary.recursiveFiles.push(entry.name)
		} else if (entry.isDirectory()) {
			summary.directories.push(entry.name)

			promises.push(generateSummaries(`${path}/${entry.name}`).then(entrySummary => ({ summary: entrySummary, parent: entry.name })))
		}
	}

	const results = await Promise.allSettled(promises)

	for (const result of results) {
		if (result.status == "rejected") {
			console.error("Unexpected error:", result.reason)
			continue
		}

		const entrySummary = result.value.summary
		const entryParent = result.value.parent

		summary.recursiveFiles.push(...entrySummary.recursiveFiles.map(entryName => `${entryParent}/${entryName}`))
	}

	await fs.writeFile(`${path}/_dir.yson`, YSON.stringify(summary, { space: "\t" }))
		.catch(e => console.error("Could not save summary:", e))

	return summary
}

await generateSummaries("public/data")
