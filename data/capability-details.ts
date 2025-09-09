export interface CapabilityDetail {
  name: string
  category: string
  businessExplanation: string
  technicalExplanation: string
  impact: string
  examples: string[]
}

export const capabilityDetails: Record<string, CapabilityDetail> = {
  "brdf-pbr": {
    name: "BRDF & PBR",
    category: "3D Graphics",
    businessExplanation:
      "Accurately simulating how light interacts with materials so that 3D objects appear realistic under different lighting conditions",
    technicalExplanation:
      "BRDF (Bidirectional Reflectance Distribution Function) defines how light is reflected at a surface. PBR (Physically Based Rendering) uses physical reflectance models, energy conservation, and real-world material parameters (like roughness and metallic values) to ensure consistent, realistic shading under varied lighting.",
    impact:
      "If materials aren't physically accurate, objects will have inconsistent lighting, unrealistic reflections, and overall less believable scenes",
    examples: [
      "Rendering materials like metal or wood with lifelike lighting response",
      "Ensuring consistent object appearance under varying lighting in a game engine",
      "Using scanned material values for ultra-realistic textures",
    ],
  },
  "inverse-rendering": {
    name: "Inverse Rendering",
    category: "3D Vision",
    businessExplanation:
      "Determining a scene's 3D structure, materials, and lighting from images so we can recreate or modify the scene realistically",
    technicalExplanation:
      "Computing the underlying 3D geometry, material properties, and illumination from one or more images. It often involves solving an inverse problem (via optimization or neural networks) to estimate shapes, reflectance (BRDF), and light sources that could have produced the input images.",
    impact:
      "Errors in inverse rendering lead to incorrect 3D scenes (wrong geometry or lighting), making any augmented or reconstructed content look unrealistic and out of place",
    examples: [
      "Reconstructing a room's 3D model and lighting from a single photograph",
      "Estimating an object's shape and material from an image to create a 3D asset",
      "Capturing real-world lighting from a photo to relight virtual objects",
    ],
  },
  "white-balance": {
    name: "White Balance",
    category: "Imaging",
    businessExplanation:
      "Automatically correcting for lighting color tints (e.g., warm indoor light or cool outdoor light) so that whites and other colors appear natural",
    technicalExplanation:
      "Adjusting image colors based on the detected illumination color temperature. Algorithms shift the red-blue balance to neutralize color casts (for example, removing an orange tint from tungsten lighting) so that an image's white and gray areas appear neutral. This calibration ensures consistency in color appearance under different lighting conditions.",
    impact:
      "Improper white balance results in unnatural color casts (too blue or too orange), making scenes look unrealistic and hindering the blending of virtual content with real backgrounds",
    examples: [
      "Correcting a photo so a white shirt looks white under yellowish indoor lighting",
      "Balancing live camera feed colors in AR for a more natural overlay",
      "Normalizing color in a dataset of images taken at different times of day",
    ],
  },
  "multi-view-reconstruction": {
    name: "Multi-View Reconstruction",
    category: "3D Vision",
    businessExplanation:
      "Building a complete 3D model of an object or scene using multiple images or scans, capturing details that one view alone would miss",
    technicalExplanation:
      "Using multiple images (from different angles) to recover 3D structure. Typically involves finding correspondences between images (feature matching), estimating camera positions (structure-from-motion), and then generating a dense 3D point cloud or mesh via multi-view stereo or volumetric integration. This produces a more complete model by covering occluded areas through the additional viewpoints.",
    impact:
      "If some views don't align or cover every area, the reconstruction may have holes or distortions; accurate multi-view reconstruction yields detailed, complete 3D models crucial for realistic AR scenes or digital replicas",
    examples: [
      "Turning a set of photos around an object into a full 3D model with textures",
      "Using drone photographs from all sides of a building to reconstruct it in 3D",
      "Recreating a film set digitally by scanning it from multiple camera angles",
    ],
  },
  "point-cloud": {
    name: "Point Cloud",
    category: "3D Vision",
    businessExplanation:
      "A raw 3D representation of shape made of many points, often produced by 3D scanners, which can be used to visualize or further model an environment or object",
    technicalExplanation:
      "A set of points in 3D space (usually with X, Y, Z coordinates and sometimes color) sampled from surfaces. Point clouds come from LiDAR, depth cameras, or photogrammetry. They require processing like noise filtering, alignment (if multiple scans), and possibly meshing to become a usable model. They capture fine detail but lack connectivity, meaning they're great for quick scans but often converted into meshes for downstream use.",
    impact:
      "Point clouds can be noisy and unstructured; without processing, they may appear incomplete or be inefficient for rendering and collision. Proper handling (filtering and meshing) is needed to ensure the final 3D model is accurate and performance-friendly, otherwise AR visuals might show holes or overly rough surfaces",
    examples: [
      "Visualizing a LiDAR scan of a room as a point cloud to inspect its layout",
      "Merging point clouds from multiple scans to cover a whole object",
      "Using a point cloud directly for quick obstacle detection in a robot navigation system",
    ],
  },
  meshing: {
    name: "Meshing",
    category: "3D Vision",
    businessExplanation:
      "Turning unstructured 3D data (like point clouds or volumes) into a solid 3D surface model that can be easily textured and rendered",
    technicalExplanation:
      "Generating a mesh (vertices, edges, faces) from raw spatial data. Methods include triangulating point clouds (connecting points into polygons), volumetric surface reconstruction (like Poisson reconstruction), or converting a voxel grid via marching cubes. Meshing produces a continuous surface representation, often filling gaps and smoothing noise, resulting in a watertight geometric model suitable for visualization and physics.",
    impact:
      "Poor meshing can introduce holes, bumps, or too many polygons, causing visual artifacts and performance issues. Good meshing yields a clean, accurate model that retains important details while being efficient, directly affecting how realistic and usable a scanned 3D asset will be in AR/VR or games",
    examples: [
      "Converting a 3D laser scan of a sculpture into a watertight mesh for an AR app",
      "Meshing depth sensor data in real-time to create a live 3D map of a room",
      "Simplifying a high-detail mesh for use on mobile devices without losing key shape features",
    ],
  },
  "material-classification": {
    name: "Material Classification",
    category: "3D Vision",
    businessExplanation:
      "Recognizing surface materials (e.g. wood, metal, glass) from images to apply correct visual properties and behaviors in 3D scenes",
    technicalExplanation:
      "Using image analysis or deep learning to identify the material type of surfaces. This involves analyzing texture, color, and reflectance cues to classify regions of an image or 3D scan by material (like distinguishing metal vs. plastic) so that appropriate shading models or physical parameters can be assigned.",
    impact:
      "Misidentified materials cause incorrect shading (a shiny surface rendered matte or vice versa), breaking realism and potentially leading to wrong physical interactions",
    examples: [
      "Automatically tagging parts of a 3D scan as metal vs. fabric for proper rendering",
      "Identifying road, sky, and vegetation materials in images for simulation environments",
      "Choosing correct shaders for objects in AR by recognizing their real-world material",
    ],
  },
  "depth-estimation": {
    name: "Depth Estimation",
    category: "3D Vision",
    businessExplanation: "Understanding how far objects are from the camera to create realistic 3D effects",
    technicalExplanation:
      "Monocular or stereo depth prediction using deep learning models. Involves geometric understanding, disparity estimation, and depth map generation through encoder-decoder architectures or transformer models.",
    impact: "Inaccurate depth affects 3D rendering, occlusion handling, and realistic lighting calculations",
    examples: ["Creating depth maps from single images", "3D scene reconstruction", "Realistic object placement"],
  },
  "geometric-reconstruction": {
    name: "Geometric Reconstruction",
    category: "3D Vision",
    businessExplanation: "Building the core 3D shape and structure of an object from images or depth data.",
    technicalExplanation:
      "Algorithms that convert point clouds or depth maps into a polygonal mesh. Techniques include Poisson surface reconstruction, marching cubes, or neural implicit representations like NeRF (Neural Radiance Fields) to generate a continuous 3D surface.",
    impact:
      "Flaws in this stage result in a distorted, lumpy, or incomplete 3D model, which cannot be fixed by later texturing or rendering.",
    examples: [
      "Creating a 3D mesh from a depth map",
      "Fusing multiple camera views into a single 3D shape",
      "Generating a 3D model of a room from a scan",
    ],
  },
}
