import * as sass from "sass";
import path from "node:path";

export default function (eleventyConfig) {
  eleventyConfig.addTemplateFormats("scss");

  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }

      return async (data) => {
        let result = await sass.compileAsync(inputPath, {
          loadPaths: ['node_modules']
          // importers: [ 
          //   new sass.NodePackageImporter()
          // ]
        });
        return result.css;
      };
    },
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
  };
};
