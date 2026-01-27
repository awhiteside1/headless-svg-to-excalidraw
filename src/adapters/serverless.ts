/**
 * Serverless adapter for svg-to-excalidraw
 * Sets up DOM polyfills for edge/serverless environments
 */

let initialized = false;

export async function initServerlessEnvironment() {
  if (initialized) return;

  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    initialized = true;
    return; // Browser has native DOM APIs
  }

  // Check if running in Deno (has native DOMParser)
  if (typeof (globalThis as any).Deno !== 'undefined') {
    // Deno has DOMParser but might need document
    if (typeof document === 'undefined') {
      const { parseHTML } = await import('linkedom');
      const dom = parseHTML('<!DOCTYPE html>');
      globalThis.document = dom.document as any;
    }
    initialized = true;
    return;
  }

  // For Node.js/Edge runtimes, use linkedom
  try {
    const { parseHTML } = await import('linkedom');
    const { document, DOMParser, NodeFilter, TreeWalker } = parseHTML('<!DOCTYPE html>');

    globalThis.document = document as any;
    globalThis.DOMParser = DOMParser as any;
    globalThis.NodeFilter = NodeFilter as any;
    globalThis.TreeWalker = TreeWalker as any;

    initialized = true;
  } catch (error) {
    throw new Error(
      'Failed to initialize DOM environment. Install linkedom: bun add linkedom'
    );
  }
}

/**
 * Convert SVG to Excalidraw format in a serverless environment
 * Automatically initializes DOM polyfills on first call
 */
export async function convertServerless(svgString: string) {
  await initServerlessEnvironment();

  // Import parser after DOM is initialized
  const { convert } = await import('../parser');
  return convert(svgString);
}

/**
 * Pre-initialize for better cold start performance
 * Call this at module level in your serverless function
 */
export async function warmup() {
  await initServerlessEnvironment();
  // Preload the parser module
  await import('../parser');
}
