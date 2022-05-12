import * as faceLandmarksDetection from 'https://cdn.skypack.dev/@tensorflow-models/face-landmarks-detection?dts'

import setupThree, { Vector3 } from './three.ts'
import { Point } from './types.ts'

const image = document.querySelector('img')!
const canvas = document.querySelector<HTMLCanvasElement>('canvas#overlay')!
const ctx = canvas.getContext('2d')!

const clear = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height)
}

const initDetector = async () => {
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh

    return await faceLandmarksDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: false
    })
}

const resizeCanvas = () => {
    canvas.width = image.width
    canvas.height = image.height
}

const drawPoint = (position: {x: number, y: number}, size = 10, style = 'green') => {
    const {x, y} = position
    ctx.fillStyle = style
    ctx.fillRect(x - ( size / 2), y- ( size / 2), size, size)
}

const extractPosition = (face: faceLandmarksDetection.Face) => {
    const leftEye = face.keypoints[159]
    const rightEye = face.keypoints[386]
    const chin = face.keypoints[175]
    const nose = face.keypoints[1]

    return {
        leftEye,
        rightEye,
        chin,
        nose
    }
}

const drawFace = (face: faceLandmarksDetection.Face) => {
    const { box } = face

    const { leftEye, rightEye, chin, nose } = extractPosition(face)

    clear()

    ctx.strokeStyle = 'red'
    ctx.strokeRect(box.xMin, box.yMin, box.width, box.height)

    drawPoint(nose, 15, 'red')
    drawPoint(leftEye)
    drawPoint(rightEye)
    drawPoint(chin)

    return {
        leftEye,
        rightEye,
        chin,
        nose
    }
}

const detectFaces = async (detector: faceLandmarksDetection.FaceLandmarksDetector) => {
    const faces = await detector.estimateFaces(image)

    return drawFace(faces[0])
}

const once = (fn: any) => {
    let run = true

    return (x: any) => {
        if (run) {
            run = false
            fn(x)
        } 
    }
}

const calcForwardNormal = (a: Point, b: Point, c: Point) => {
    return new Vector3()
}

window.addEventListener('load', 
    async () => {
        resizeCanvas()
        const { positionCube } = setupThree(image.width, image.height)

        // const w = window as any
        // w._positionCube = positionCube

        const detector = await initDetector()
        const faces = await detector.estimateFaces(image)
        console.log({faces})

        const fps = 30
        const interval = 1000 / fps

        const logNose = once((nose: any) => console.log({nose}))
        // const posCube = once(positionCube)

        const detect = async () => {
            const {
                nose,
                leftEye,
                rightEye,
                chin
            } = await detectFaces(detector)

            const forward = calcForwardNormal(leftEye, rightEye, chin)

            logNose(nose)
            // posCube(nose)
            positionCube(nose)
            // positionCube(nose, forward)
        }

        setInterval(detect, interval)
    }
)
