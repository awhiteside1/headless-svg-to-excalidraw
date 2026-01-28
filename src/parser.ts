import ExcalidrawScene from "./elements/ExcalidrawScene";
import Group from "./elements/Group";
import { createTreeWalker, walk } from "./walker";
import { DOMParser } from "./dom";

export type ConversionResult = {
  hasErrors: boolean;
  errors: any; // NodeList from linkedom
  content: any; // Serialized Excalidraw JSON
  warnings: string[];
};

export const convert = (svgString: string): ConversionResult => {
  const warnings: string[] = [];

  // Validate input
  if (!svgString || svgString.trim().length === 0) {
    const error = "SVG string is empty or invalid";
    console.error(error);
    return {
      hasErrors: true,
      errors: [error],
      content: null,
      warnings,
    };
  }

  const svgDOM = DOMParser.parseFromString(svgString, "image/svg+xml") as any;

  // was there a parsing error?
  const errorsElements = svgDOM.querySelectorAll("parsererror");
  const hasErrors = errorsElements.length > 0;
  let content = null;

  if (hasErrors) {
    console.error(
      "There were errors while parsing the given SVG: ",
      [...errorsElements].map((el: any) => el.innerHTML),
    );
  } else {
    const tw = createTreeWalker(svgDOM as Node);
    const scene = new ExcalidrawScene();
    const groups: Group[] = [];

    // Track skipped elements for logging
    const skippedElements = new Set<string>();

    walk(
      { tw, scene, groups, root: svgDOM as Document, skippedElements },
      tw.nextNode(),
    );

    content = scene.toExJSON();

    // Validate conversion results
    const elementCount = content?.elements?.length || 0;

    if (elementCount === 0) {
      const warning = "Conversion produced 0 elements - the SVG may contain only unsupported elements or be empty";
      console.warn(warning);
      warnings.push(warning);
    }

    // Log skipped elements
    if (skippedElements.size > 0) {
      const skippedList = Array.from(skippedElements).join(", ");
      const warning = `Skipped unsupported elements: ${skippedList}`;
      console.warn(warning);
      warnings.push(warning);
    }

    // Log success stats
    if (elementCount > 0) {
      console.log(`✓ Successfully converted ${elementCount} SVG elements to Excalidraw format`);
    }
  }

  return {
    hasErrors,
    errors: hasErrors ? errorsElements : null,
    content,
    warnings,
  };
};
