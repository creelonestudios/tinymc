export default interface Dim {

	add(dim: Dim): Dim,
	mult(dim: Dim): Dim,
	set(dim: Dim | number): Dim,
	scale(x: number): Dim,
	floor(): Dim,
	copy(): Dim

}