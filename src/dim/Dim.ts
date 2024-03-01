export default interface Dim {

	add(dim: Dim): Dim,
	sub(dim: Dim): Dim,
	mult(dim: Dim): Dim,
	set(dim: Dim | number): Dim,
	scale(x: number): Dim
	dot(dim: Dim): number,
	sqMag(): number
	mag(): number,
	angle(): number
	normalize(): Dim,
	distanceTo(other: Dim): number
	floor(): Dim,
	copy(): Dim

}
