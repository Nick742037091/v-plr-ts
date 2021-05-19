interface Style {
    top?: string | number
    left?: string | number
    width?: string | number
    height?: string | number
    backgroundColor?: string
    borderRadius?: string
    borderWidth?: string|number
    borderColor?:string
}


interface Event {
    clientX?: number
    clientY?: number
    type?:string
    touches?:any
}

export {Style,Event}