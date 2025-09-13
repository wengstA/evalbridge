const metricsExplanations = {
  "glossiness-accuracy": {
    userFriendlyName: "How Shiny Things Look",
    explanation: "This measures if the AI can tell the difference between shiny surfaces (like metal or glass) and dull surfaces (like cardboard or fabric). When this works well, mirrors look like mirrors and matte paint looks matte.",
    whatItMeans: "Higher scores mean the AI is better at making shiny things actually look shiny and dull things look dull in the final 3D model.",
    recommendedValue: 90,
    higherIsBetter: true,
    examples: {
      good: "A chrome car bumper that actually reflects light and looks metallic",
      bad: "A chrome bumper that looks like flat gray plastic"
    }
  },
  "roughness-consistency": {
    userFriendlyName: "Surface Texture Stability",
    explanation: "This checks if surface textures (rough vs smooth) stay consistent when you look at the object from different angles. A rough wooden table should look rough from all sides.",
    whatItMeans: "Lower scores are better - they mean the texture doesn't randomly change from rough to smooth as you move around the object.",
    recommendedValue: 0.10,
    higherIsBetter: false,
    examples: {
      good: "Sandpaper that looks consistently rough from every angle",
      bad: "Sandpaper that looks smooth from one side and rough from another"
    }
  },
  "delta-e2000": {
    userFriendlyName: "Color Accuracy",
    explanation: "This measures how close the colors in your 3D model are to the colors in your original photo. It uses a special formula that matches how human eyes actually see color differences.",
    whatItMeans: "Lower scores are better - they mean the colors look more like the original photo. A score under 3 means most people won't notice the color difference.",
    recommendedValue: 2.5,
    higherIsBetter: false,
    examples: {
      good: "Your red car stays the same shade of red in the 3D model",
      bad: "Your red car turns orange or pink in the 3D model"
    }
  },
  "reflection-accuracy": {
    userFriendlyName: "Mirror and Reflection Quality",
    explanation: "This measures how well reflective surfaces like mirrors, water, or polished metal show reflections. Good reflections make objects look realistic and alive.",
    whatItMeans: "Higher scores mean reflections look more realistic - you can actually see other objects reflected in shiny surfaces.",
    recommendedValue: 92,
    higherIsBetter: true,
    examples: {
      good: "A mirror that shows your reflection and the room behind you",
      bad: "A mirror that looks like a flat gray rectangle"
    }
  },
  "fresnel-consistency": {
    userFriendlyName: "Viewing Angle Reflections",
    explanation: "This checks if reflections change naturally when you look at something from different angles - just like in real life where reflections get stronger when you look at water from the side.",
    whatItMeans: "Lower scores are better - they mean reflections behave naturally as you move around the object.",
    recommendedValue: 0.08,
    higherIsBetter: false,
    examples: {
      good: "A lake that reflects more when viewed from the side, less from above",
      bad: "A lake that reflects the same amount no matter where you look from"
    }
  },
  "transparency-accuracy": {
    userFriendlyName: "See-Through Material Quality",
    explanation: "This measures how well transparent materials like glass, water, or plastic actually let you see through them and how they bend light realistically.",
    whatItMeans: "Lower scores are better - they mean transparent objects actually look transparent and bend light naturally.",
    recommendedValue: 0.06,
    higherIsBetter: false,
    examples: {
      good: "A wine glass you can see through with realistic light bending",
      bad: "A wine glass that looks like solid white plastic"
    }
  },
  "depth-accuracy": {
    userFriendlyName: "Distance and Depth Perception",
    explanation: "This measures how well the AI understands what's close and what's far away in your photo, so the 3D model has proper depth and doesn't look flat.",
    whatItMeans: "Higher scores mean objects appear at the right distances from each other, creating realistic 3D depth.",
    recommendedValue: 94,
    higherIsBetter: true,
    examples: {
      good: "A person standing in front of a building with clear depth separation",
      bad: "A person and building that look like they're floating at the same distance"
    }
  },
  "depth-consistency": {
    userFriendlyName: "Stable 3D Positioning",
    explanation: "This checks if objects stay at the same distance when you move your viewpoint around them. A table should always be the same distance from the wall, no matter where you look from.",
    whatItMeans: "Lower scores are better - they mean object positions don't shift weirdly when you change your viewing angle.",
    recommendedValue: 0.05,
    higherIsBetter: false,
    examples: {
      good: "A chair that stays the same distance from the table when you walk around it",
      bad: "A chair that seems to move closer or farther from the table as you change angles"
    }
  },
  "mesh-accuracy": {
    userFriendlyName: "3D Shape Accuracy",
    explanation: "This measures how closely the 3D shape matches the real object's shape. It checks if curves are smooth, corners are sharp, and proportions are correct.",
    whatItMeans: "Lower scores are better - they mean the 3D shape is very close to the real object's actual shape.",
    recommendedValue: 0.03,
    higherIsBetter: false,
    examples: {
      good: "A sphere that's perfectly round and a cube with sharp corners",
      bad: "A sphere that looks lumpy or a cube with rounded, wobbly edges"
    }
  },
  "perspective-consistency": {
    userFriendlyName: "Shape Stability from Different Angles",
    explanation: "This checks if objects keep their proper shape and proportions when viewed from different angles. A circular wheel should look circular from the front and oval from the side.",
    whatItMeans: "Higher scores mean the object's shape looks natural and doesn't warp unexpectedly when you change your viewpoint.",
    recommendedValue: 8.5,
    higherIsBetter: true,
    examples: {
      good: "A round table that looks properly round from above and elliptical from the side",
      bad: "A round table that randomly looks square or distorted from certain angles"
    }
  },
  "saturation-balance": {
    userFriendlyName: "Color Vibrancy Accuracy",
    explanation: "This measures if colors have the right amount of vibrancy - not too dull and washed out, not too bright and oversaturated. Colors should feel natural and true to life.",
    whatItMeans: "Higher scores mean colors look natural and appealing, with the right amount of vibrancy for each material type.",
    recommendedValue: 8.0,
    higherIsBetter: true,
    examples: {
      good: "Grass that's naturally green, skin that has healthy color",
      bad: "Grass that's neon green or skin that looks gray and lifeless"
    }
  },
  "refraction-index": {
    userFriendlyName: "Light Bending Accuracy",
    explanation: "This measures how well transparent materials bend light, like how a straw looks bent in a glass of water. Different materials bend light differently - glass more than water, diamond more than glass.",
    whatItMeans: "Higher scores mean light bends through transparent materials in a realistic way, making them look authentic.",
    recommendedValue: 8.5,
    higherIsBetter: true,
    examples: {
      good: "A magnifying glass that actually makes things look bigger",
      bad: "A magnifying glass that has no effect on what you see through it"
    }
  }
};

export default metricsExplanations;
