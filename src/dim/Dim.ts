export default interface Dim {

	add(dim: Dim): Dim,
	sub(dim: Dim): Dim,
	mult(dim: Dim): Dim,
	set(dim: Dim | number): Dim,
	scale(x: number): Dim,
	sqMag(): number
	mag(): number,
	normalize(): Dim,
	distanceTo(other: Dim): number
	floor(): Dim,
	copy(): Dim

}
