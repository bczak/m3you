import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { Example } from '@/components/preview/example';
import { Playground } from '@/components/preview/playground';
import { PropsTable } from '@/components/preview/props-table';
import { SpecLink } from '@/components/preview/spec-link';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Available in every page without an import — these appear on nearly all of them.
    Playground,
    Example,
    PropsTable,
    SpecLink,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
