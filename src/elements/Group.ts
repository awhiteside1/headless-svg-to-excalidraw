import { presAttrsToElementValues } from '../attributes'
import type { ExcalidrawElementBase } from '../elements/ExcalidrawElement'
import { randomId } from '../utils'

export function getGroupAttrs(groups: Group[]): Partial<ExcalidrawElementBase> {
	return groups.reduce(
		(acc, { element }) => {
			const elVals = presAttrsToElementValues(element)

			return Object.assign(acc, elVals)
		},
		{} as Partial<ExcalidrawElementBase>,
	)
}

class Group {
	id: string = randomId()

	element: Element

	constructor(element: Element) {
		this.element = element
	}
}

export default Group
