import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Plane,
    MeshBasicMaterial,
    Mesh,
    Raycaster,
    Vector3
} from 'https://cdn.skypack.dev/three?dts'


const setup = (width: number, height: number) => {
    const scene = new Scene()
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)

    const renderer = new WebGLRenderer({alpha: true})

    renderer.setSize(width, height)
    renderer.domElement.style.position = 'absolute'
    document.body.appendChild(renderer.domElement)

    return { scene, camera, renderer }
}

const addCube = (scene: Scene) => {
    const geometry = new BoxGeometry()
    const material = new MeshBasicMaterial({color: 'pink'})
    const cube = new Mesh(geometry, material)

    scene.add(cube)

    return cube
}

// const addPlane = (scene: Scene) => {
//     const plane = new PlaneGeometry()
//     scene.add(plane)
// }

export default (width: number, height: number) => {
    const { camera, scene, renderer } = setup(width, height)
    camera.position.z = 5

    const cube = addCube(scene)

    const update = () => {
        cube.rotation.x += .01
        cube.rotation.y += .01
    }

    const animate = () => {
        requestAnimationFrame(animate)
        update()
        renderer.render(scene, camera)
    }

    animate()

    const raycaster = new Raycaster()
    const plane = new Plane(new Vector3(0, 0, 1))

    const normalize = ({x, y}: {x: number, y: number}) => {
        return {
            x: (x / renderer.domElement.width) * 2 - 1,
            y: (y / -renderer.domElement.height) * 2 + 1,
        }
    }

    return {
        positionCube: (position: {x: number, y: number}) => {
            const normalizedPos = normalize(position)

            raycaster.setFromCamera(normalizedPos, camera)

            const ray = raycaster.ray

            const distance = ray.distanceToPlane(plane)
            const direction = ray.direction

            const worldPos = camera.position.clone().add(direction.multiplyScalar(distance))

            cube.position.copy(worldPos)
        }
    }
}


export { Vector3 }
