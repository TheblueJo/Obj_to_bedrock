let fs = require("fs");
let path = require("path");

// Path for the entities' models and textures folders
const emodelsFolderPath = "./models/obj/entity";
const etexturesFolderPath = "./textures/obj/entity";
// Path for the block's models and textures folders
const bmodelsFolderPath = "./models/obj/block";
const btexturesFolderPath = "./textures/obj/block";
// Path for the bones
const bonesFolderPath = "./models/obj/bones";
const bonesOutputPath = "./models/bones";

// used to scale the model
const scale = 1;

/**
 * 
 * @returns {{e: string[], b: string[], bones: string[]}} Arrays with all .obj files' names
 */
function getAllOBJFiles(){
    let entityModelsOBJ = fs.readdirSync(emodelsFolderPath, {encoding: "utf-8"});
	let eArr = entityModelsOBJ.filter(file => path.extname(file) === ".obj");

    let blockModelsOBJ = fs.readdirSync(bmodelsFolderPath, {encoding: "utf-8"});
	let bArr = blockModelsOBJ.filter(file => path.extname(file) === ".obj");

    let bonesOBJ = fs.readdirSync(bonesFolderPath, {encoding: "utf-8"});
    let bonesArr = bonesOBJ.filter(file => path.extname(file) === ".obj");

    return {e: eArr, b: bArr, bones: bonesArr};
};

/**
 * Convert a .obj file to a .json Minecraft model
 * @param {string} objFileContent
 * @param {File} texture
 * @param {string} modelId
 * @param {boolean} isModel Whether this is a model or a bone
 * @param {number} scale
 * @returns
 * 
### There is no license notice in the github repository (https://github.com/bridge-core/plugins), so I asked a contributor and they said it should be MIT. So this is basically currently a placeholder until they add a License to the repository. It was also not the owner of the repository, so it could change at any time, I guess...
Also, this code has been changed and is not the same as in the repository

MIT License

Copyright (c) 2024 bridge-core

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
function OBJtoMC(objFileContent, texture, modelId, isModel, scale = 1) {
	let positions = []
	let normals = []
	let uvs = []
	let polys = []
	const bones = []

	const lines = objFileContent.split(/\r\n|\n/g);
	for(const line of lines){
		const firstSpace = line.indexOf(' ')
		const defType = line.substring(0, firstSpace)
		const data = line.substring(firstSpace + 1, line.length)

		switch (defType) {
			case 'v':
				positions.push(
					data
						.trim()
						.split(' ')
						.map(
							(str, i) => (i === 0 ? -scale : scale) * Number(str)
						)
				)
				break
			case 'vn':
				normals.push(
					data
						.trim()
						.split(' ')
						.map((str, i) => (i === 0 ? -1 : 1) * Number(str))
				)
				break
			case 'vt':
				const uv = data
					.trim()
					.split(' ')
					.map((str, i) => Number(str))
				uvs.push([uv[0], uv[1]])		// test to check if UVs will work this way
				break;
			case 'f':
				const face = data
					.trim()
					.split(' ')
					.map((index) => {
						const v = Number(index.split('/')[0])
						const vt =
							index.includes('/') && !index.includes('//')
								? Number(index.split('/')[1])
								: Number(index.split('/')[0])
						const vn = index.includes('//')
							? Number(index.split('//')[1])
							: Number(
									index.split('/').length === 3
										? index.split('/')[2]
										: index.split('/')[0]
							  )
						return [v - 1, vn - 1, vt - 1]		/// x z y => x y z, if the north/east/... are x and y in the modeling software and up/down z; else model is rotated;; useless comment?
					})
				//Minecraft currently doesn't support triangular shapes
				while (face.length <= 3) face.push(face[0])
				while (face.length > 4) face.pop()
				polys.push(face)

				break;
		};
	};

	/// add the bone with all things
	if(polys.length >= 1){
		bones.push({
			name: "bone",
			poly_mesh: {
				normalized_uvs: true,
				positions,
				normals,
				uvs,
				polys,
			},
		})
	};


    if(isModel == true){// models

        const image = texture;
        
        // Get width & height
        const width = image ? image.width : 32
        const height = image ? image.height : 32

        return {
            format_version: '1.21.0',
            'minecraft:geometry': [
                {
                    description: {
                        identifier: modelId,
                        texture_width: width,
                        texture_height: height,
                    },
                    bones,
                },
            ],
        };
    }else {     // bones
        return {
            bones
        };
    };
};


/**
 * Used to get the size of a PNG file, later for use in the geo description
 * @param {string} base64 
 * @returns 
 * 
#### This code snippet/function is adapted from an answer by Endless on Stack Overflow
#### Question: Get height and width dimensions from a Base64-encoded PNG image
#### URLs: Topic: https://stackoverflow.com/q/15327959 - Answer: https://stackoverflow.com/a/41152378
#### Licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/)
 */
function getPngDimensions(base64) {
    const header = atob(base64.slice(0, 50)).slice(16,24)
    const uint8 = Uint8Array.from(header, c => c.charCodeAt(0))
    const dataView = new DataView(uint8.buffer)
  
    return {
      width: dataView.getInt32(0),
      height: dataView.getInt32(4)
    }
  }

  /**
   * Checks if folders exist
   * @returns true if paths exist, false when error
   */
function startCheck(){
    try{
        if(
            fs.existsSync(emodelsFolderPath) == false
            || fs.existsSync(etexturesFolderPath) == false
            || fs.existsSync(bmodelsFolderPath) == false
            || fs.existsSync(btexturesFolderPath) == false
            || fs.existsSync(bonesFolderPath) == false
            || fs.existsSync(bonesOutputPath) == false
        ){
            throw new Error(`Folder Structure is wrong! Make sure the following paths exist: \n ${emodelsFolderPath} \n ${etexturesFolderPath} \n ${bmodelsFolderPath} \n ${btexturesFolderPath} \n ${bonesFolderPath} \n ${bonesOutputPath}`);
        }else {
            return true;
        };
    }
    catch (err){
        console.log(err.message);
        return false;
    };
};

  /**
   * The main function to run
   */
function run(){
    if(startCheck() == false) return;

    let {e, b, bones} = getAllOBJFiles();

    e.forEach(file => {
        let png;
        // check if texture exists, else using default png
        if(fs.existsSync(`${etexturesFolderPath}/${file.replace(".obj", ".png")}`) == false){
            console.log(new Error(`PNG Texture ${etexturesFolderPath}/${file.replace(".obj", ".png")} not found; using default 64x64.`).message);
            png = { width: 64, height: 64 };
        };
        // write geo file
        fs.writeFileSync(
            `./models/entity/${file.replace(".obj", ".geo.json")}`,
            JSON.stringify(
                OBJtoMC(
                    fs.readFileSync(
                        `${emodelsFolderPath}/${file}`,
                        {encoding: "utf-8"}
                    ),
                    png || getPngDimensions(fs.readFileSync(`${etexturesFolderPath}/${file.replace(".obj", ".png")}`).toString("base64")),
                    `geometry.${file.replace(".obj", "")}`,
                    true,
                    scale
                )
            )
        )
    });

	b.forEach(file => {
        let png;
        // check if texture exists, else using default png
        if(fs.existsSync(`${btexturesFolderPath}/${file.replace(".obj", ".png")}`) == false){
            console.log(new Error(`PNG Texture ${btexturesFolderPath}/${file.replace(".obj", ".png")} not found; using default 64x64`).message);
            png = { width: 64, height: 64 };
        };
        // write geo file
        fs.writeFileSync(
            `./models/block/${file.replace(".obj", ".geo.json")}`,
            JSON.stringify(
                OBJtoMC(
                    fs.readFileSync(
                        `${bmodelsFolderPath}/${file}`,
                        {encoding: "utf-8"}
                    ), 
                    png || getPngDimensions(fs.readFileSync(`${btexturesFolderPath}/${file.replace(".obj", ".png")}`).toString("base64")),
                    `geometry.${file.replace(".obj", "")}`,
                    true,
					scale
                )
            )
        )
    });

    bones.forEach(file => {
        // write geo file
        fs.writeFileSync(
            `${bonesOutputPath}/${file.replace(".obj", ".geo.bone.json")}`,
            JSON.stringify(
                OBJtoMC(
                    fs.readFileSync(
                        `${bonesFolderPath}/${file}`,
                        {encoding: "utf-8"}
                    ),
                    { width: 64, height:64 },
                    `${file.replace(".obj", "")}`,
                    false,
					scale
                )
            )
        )
    });

};

run();