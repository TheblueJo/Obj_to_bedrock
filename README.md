# Obj_to_bedrock
This nodejs script converts all availible Wavefront (.obj) models to the minecraft json geometry format. To use it, you'll need nodejs installed and it has to follow the following folder structure:
```
Ressource_Pack_Folder
|- converter.js
|- models
    |- entity
    |- block
    |- bones
    |- obj
        |- entity    *folder for .obj files of entity models*
        |- block      *folder for .obj files of block models*
        |- bones    *folder for .obj files of geometry bones*
|- textures
    |- entity
    |- block
    |- bones
    |- obj
        |- entity    *folder for .obj entity model textures*
        |- block    *folder for .obj block model textures*
        |- bones    *folder for .obj geometry bone textures*
```
The output files of geometry bones is for copying and the using in other geometries; they're bones, not models. If there is no texture for an entity or file .obj model, it'll will set the model's texture_width and texture_height to 64. Both texture and model must have the same name to be matched together: x.obj + x.png.

The script contains snippet from other sources. Those have their License notice in the comment above of them, exception for the OBJtoMC() function. [The repository](https://github.com/bridge-core/plugins) which I got it from has no official LICENSE file or notice. After asking a contributor of that repository, they told me it was MIT so I put MIT there. 
