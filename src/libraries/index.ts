import type {LibraryItem} from '@excalidraw/excalidraw/types'


type Props = {
	name: string
	elements: LibraryItem['elements']
}

const createLibraryItem = (name: string, elements: LibraryItem['elements']): LibraryItem => {


	return {
		id: name,
		name,
		elements,
		created: new Date().getMilliseconds(),
		status: 'published'

	}


}
