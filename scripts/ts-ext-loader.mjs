export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !specifier.endsWith('.ts') && !specifier.endsWith('.js')) {
    return nextResolve(`${specifier}.ts`, context)
  }
  return nextResolve(specifier, context)
}
